import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsMetrics {
  views: number;
  engagement: number;
  conversions: number;
  revenue: number;
  change: {
    views: number;
    engagement: number;
    conversions: number;
    revenue: number;
  };
}

export interface ContentAnalytics {
  id: string;
  title: string;
  views: number;
  engagement: string;
  performance: number;
  revenue: string;
  published_url?: string;
  last_updated: string;
}

export interface TimelineData {
  date: string;
  views: number;
  visitors: number;
  engagement: number;
  conversions: number;
}

class RealAnalyticsService {
  private getDateRangeFromTimeRange(timeRange: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return { startDate, endDate };
  }

  async fetchOverviewMetrics(timeRange: string = '7days'): Promise<AnalyticsMetrics> {
    try {
      const { startDate, endDate } = this.getDateRangeFromTimeRange(timeRange);
      
      const { data: contentItems, error } = await supabase
        .from('content_items')
        .select(`
          id,
          title,
          created_at,
          content_analytics (
            analytics_data,
            search_console_data,
            last_fetched_at
          )
        `)
        .eq('status', 'published')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Error fetching content metrics:', error);
        throw error;
      }

      // Calculate metrics from real data
      const currentMetrics = this.calculateMetricsFromContent(contentItems || []);
      
      // Get previous period for comparison
      const previousPeriodStart = new Date(startDate);
      const previousPeriodEnd = new Date(startDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      previousPeriodStart.setTime(previousPeriodStart.getTime() - timeDiff);

      const { data: previousItems } = await supabase
        .from('content_items')
        .select(`
          id,
          title,
          created_at,
          content_analytics (
            analytics_data,
            search_console_data,
            last_fetched_at
          )
        `)
        .eq('status', 'published')
        .gte('created_at', previousPeriodStart.toISOString())
        .lte('created_at', previousPeriodEnd.toISOString());

      const previousMetrics = this.calculateMetricsFromContent(previousItems || []);
      
      // Calculate percentage changes
      currentMetrics.change = {
        views: this.calculatePercentageChange(previousMetrics.views, currentMetrics.views),
        engagement: this.calculatePercentageChange(previousMetrics.engagement, currentMetrics.engagement),
        conversions: this.calculatePercentageChange(previousMetrics.conversions, currentMetrics.conversions),
        revenue: this.calculatePercentageChange(previousMetrics.revenue, currentMetrics.revenue),
      };

      return currentMetrics;
    } catch (error) {
      console.error('Analytics service error:', error);
      return {
        views: 0,
        engagement: 0,
        conversions: 0,
        revenue: 0,
        change: { views: 0, engagement: 0, conversions: 0, revenue: 0 }
      };
    }
  }

  async fetchContentAnalytics(timeRange: string = '7days'): Promise<ContentAnalytics[]> {
    try {
      const { startDate, endDate } = this.getDateRangeFromTimeRange(timeRange);

      const { data: contentItems, error } = await supabase
        .from('content_items')
        .select(`
          id,
          title,
          published_url,
          updated_at,
          content_analytics (
            analytics_data,
            search_console_data,
            last_fetched_at
          )
        `)
        .eq('status', 'published')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString())
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching content analytics:', error);
        throw error;
      }

      return this.transformContentData(contentItems || []);
    } catch (error) {
      console.error('Content analytics error:', error);
      return [];
    }
  }

  async fetchTimelineData(metric: string, timeRange: string = '7days'): Promise<TimelineData[]> {
    try {
      const { startDate } = this.getDateRangeFromTimeRange(timeRange);
      
      const { data: analytics, error } = await supabase
        .from('content_analytics')
        .select(`
          analytics_data,
          search_console_data,
          last_fetched_at,
          content_items!inner (
            id,
            title,
            user_id,
            created_at
          )
        `)
        .gte('content_items.created_at', startDate.toISOString())
        .order('last_fetched_at', { ascending: false });

      if (error) {
        console.error('Error fetching timeline data:', error);
        throw error;
      }

      return this.generateTimelineFromAnalytics(analytics || [], timeRange);
    } catch (error) {
      console.error('Timeline data error:', error);
      return [];
    }
  }

  async fetchCustomRangeData(startDate: Date, endDate: Date): Promise<{
    metrics: AnalyticsMetrics;
    contentAnalytics: ContentAnalytics[];
    timelineData: TimelineData[];
  }> {
    try {
      const [metricsData, contentData, timelineData] = await Promise.all([
        this.fetchMetricsForDateRange(startDate, endDate),
        this.fetchContentForDateRange(startDate, endDate),
        this.fetchTimelineForDateRange(startDate, endDate)
      ]);

      return {
        metrics: metricsData,
        contentAnalytics: contentData,
        timelineData: timelineData
      };
    } catch (error) {
      console.error('Error fetching custom range data:', error);
      return {
        metrics: { views: 0, engagement: 0, conversions: 0, revenue: 0, change: { views: 0, engagement: 0, conversions: 0, revenue: 0 } },
        contentAnalytics: [],
        timelineData: []
      };
    }
  }

  private async fetchMetricsForDateRange(startDate: Date, endDate: Date): Promise<AnalyticsMetrics> {
    const { data: contentItems } = await supabase
      .from('content_items')
      .select(`
        id,
        title,
        created_at,
        content_analytics (
          analytics_data,
          search_console_data,
          last_fetched_at
        )
      `)
      .eq('status', 'published')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    return this.calculateMetricsFromContent(contentItems || []);
  }

  private async fetchContentForDateRange(startDate: Date, endDate: Date): Promise<ContentAnalytics[]> {
    const { data: contentItems } = await supabase
      .from('content_items')
      .select(`
        id,
        title,
        published_url,
        updated_at,
        content_analytics (
          analytics_data,
          search_console_data,
          last_fetched_at
        )
      `)
      .eq('status', 'published')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString())
      .order('updated_at', { ascending: false })
      .limit(20);

    return this.transformContentData(contentItems || []);
  }

  private async fetchTimelineForDateRange(startDate: Date, endDate: Date): Promise<TimelineData[]> {
    const { data: analytics } = await supabase
      .from('content_analytics')
      .select(`
        analytics_data,
        search_console_data,
        last_fetched_at,
        content_items!inner (
          id,
          title,
          user_id,
          created_at
        )
      `)
      .gte('content_items.created_at', startDate.toISOString())
      .lte('content_items.created_at', endDate.toISOString())
      .order('last_fetched_at', { ascending: false });

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return this.generateTimelineFromAnalytics(analytics || [], `${days}days`);
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateMetricsFromContent(contentItems: any[]): AnalyticsMetrics {
    let totalViews = 0;
    let totalEngagement = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    contentItems.forEach(item => {
      if (item.content_analytics?.[0]?.analytics_data) {
        const analyticsData = item.content_analytics[0].analytics_data;
        totalViews += analyticsData.views || 0;
        totalEngagement += analyticsData.engagement || 0;
        totalConversions += analyticsData.conversions || 0;
        totalRevenue += analyticsData.revenue || 0;
      }
    });

    return {
      views: totalViews,
      engagement: parseFloat((totalEngagement / Math.max(contentItems.length, 1)).toFixed(1)),
      conversions: totalConversions,
      revenue: Math.round(totalRevenue),
      change: {
        views: 0,
        engagement: 0,
        conversions: 0,
        revenue: 0,
      }
    };
  }

  private transformContentData(contentItems: any[]): ContentAnalytics[] {
    return contentItems.map(item => {
      const analyticsData = item.content_analytics?.[0]?.analytics_data || {};
      const views = analyticsData.views || 0;
      const engagementRate = analyticsData.engagement || 0;
      
      return {
        id: item.id,
        title: item.title,
        views: views,
        engagement: `${engagementRate.toFixed(1)}%`,
        performance: Math.min(Math.round((views / 200) + (engagementRate * 10)), 100),
        revenue: `$${Math.round(views * 0.1)}`,
        published_url: item.published_url,
        last_updated: new Date(item.updated_at).toLocaleDateString()
      };
    });
  }

  private generateTimelineFromAnalytics(analytics: any[], timeRange: string): TimelineData[] {
    const days = this.getDaysFromRange(timeRange);
    const timeline: TimelineData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayData = analytics.reduce((acc, item) => {
        const analyticsData = item.analytics_data || {};
        return {
          views: acc.views + (analyticsData.daily_views || 0),
          visitors: acc.visitors + (analyticsData.daily_visitors || 0),
          engagement: acc.engagement + (analyticsData.daily_engagement || 0),
          conversions: acc.conversions + (analyticsData.daily_conversions || 0)
        };
      }, { views: 0, visitors: 0, engagement: 0, conversions: 0 });

      timeline.push({
        date: date.toISOString().split('T')[0],
        views: dayData.views,
        visitors: dayData.visitors,
        engagement: parseFloat(dayData.engagement.toFixed(1)),
        conversions: dayData.conversions
      });
    }

    return timeline;
  }

  private getDaysFromRange(timeRange: string): number {
    switch (timeRange) {
      case '24h': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 7;
    }
  }
}

export const realAnalyticsService = new RealAnalyticsService();
