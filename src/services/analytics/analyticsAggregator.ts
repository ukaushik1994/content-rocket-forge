import { supabase } from '@/integrations/supabase/client';
import { googleAnalyticsService } from './googleAnalyticsService';
import { socialAnalyticsService } from './socialAnalyticsService';

export interface AggregatedAnalytics {
  totalViews: number;
  totalEngagement: number;
  totalClicks: number;
  totalShares: number;
  totalConversions: number;
  totalRevenue: number;
  avgEngagementRate: number;
  avgConversionRate: number;
  bySource: Record<string, {
    views: number;
    engagement: number;
    conversions: number;
  }>;
  byPlatform: Record<string, {
    views: number;
    engagement: number;
  }>;
  topPerformers: Array<{
    contentId: string;
    title: string;
    views: number;
    engagement: number;
  }>;
}

class AnalyticsAggregator {
  async aggregateCampaignAnalytics(campaignId: string): Promise<AggregatedAnalytics> {
    try {
      // Fetch campaign content items
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select('id, title, published_url, performance_metrics, metadata')
        .eq('campaign_id', campaignId);

      if (contentError || !contentItems) {
        throw new Error('Failed to fetch content items');
      }

      // Fetch analytics data from database
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (analyticsError) {
        console.error('Failed to fetch campaign analytics:', analyticsError);
      }

      // Initialize aggregates
      const aggregated: AggregatedAnalytics = {
        totalViews: 0,
        totalEngagement: 0,
        totalClicks: 0,
        totalShares: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgEngagementRate: 0,
        avgConversionRate: 0,
        bySource: {},
        byPlatform: {},
        topPerformers: []
      };

      // Aggregate from database analytics
      if (analyticsData && analyticsData.length > 0) {
        analyticsData.forEach(record => {
          aggregated.totalViews += record.views || 0;
          aggregated.totalEngagement += record.engagement_count || 0;
          aggregated.totalClicks += record.clicks || 0;
          aggregated.totalShares += record.shares || 0;
          aggregated.totalConversions += record.conversions || 0;
          aggregated.totalRevenue += parseFloat(record.revenue?.toString() || '0');

          // By source
          const source = record.source || 'unknown';
          if (!aggregated.bySource[source]) {
            aggregated.bySource[source] = { views: 0, engagement: 0, conversions: 0 };
          }
          aggregated.bySource[source].views += record.views || 0;
          aggregated.bySource[source].engagement += record.engagement_count || 0;
          aggregated.bySource[source].conversions += record.conversions || 0;

          // By platform
          const platform = record.platform || 'unknown';
          if (!aggregated.byPlatform[platform]) {
            aggregated.byPlatform[platform] = { views: 0, engagement: 0 };
          }
          aggregated.byPlatform[platform].views += record.views || 0;
          aggregated.byPlatform[platform].engagement += record.engagement_count || 0;
        });
      } else {
        // Use performance_metrics from content_items as fallback
        contentItems.forEach(item => {
          const metrics = item.performance_metrics as any || {};
          aggregated.totalViews += metrics.views || 0;
          aggregated.totalEngagement += metrics.engagement || 0;
          aggregated.totalClicks += metrics.clicks || 0;
          aggregated.totalShares += metrics.shares || 0;
          aggregated.totalConversions += metrics.conversions || 0;
        });
      }

      // Calculate averages
      const itemCount = Math.max(contentItems.length, 1);
      aggregated.avgEngagementRate = aggregated.totalViews > 0 
        ? (aggregated.totalEngagement / aggregated.totalViews) * 100 
        : 0;
      aggregated.avgConversionRate = aggregated.totalViews > 0 
        ? (aggregated.totalConversions / aggregated.totalViews) * 100 
        : 0;

      // Get top performers
      aggregated.topPerformers = contentItems
        .map(item => {
          const metrics = item.performance_metrics as any || {};
          return {
            contentId: item.id,
            title: item.title,
            views: metrics.views || 0,
            engagement: metrics.engagement || 0
          };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      return aggregated;
    } catch (error) {
      console.error('Error aggregating campaign analytics:', error);
      throw error;
    }
  }

  async updateContentPerformanceMetrics(contentId: string): Promise<void> {
    try {
      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('published_url, metadata')
        .eq('id', contentId)
        .single();

      if (contentError || !content) {
        throw new Error('Content item not found');
      }

      // Fetch fresh analytics data
      const gaData = content.published_url 
        ? await googleAnalyticsService.fetchContentAnalytics(contentId, content.published_url)
        : null;

      const metadata = content.metadata as any || {};
      const platform = metadata.platform || 'wordpress';
      const socialData = await socialAnalyticsService.fetchSocialAnalytics(
        contentId, 
        platform, 
        content.published_url
      );

      // Merge analytics data
      const performanceMetrics = {
        views: (gaData?.views || 0) + (socialData?.views || 0),
        engagement: (gaData?.engagement || 0) + (socialData?.engagement || 0),
        clicks: (gaData?.clicks || 0) + (socialData?.clicks || 0),
        shares: socialData?.shares || 0,
        conversions: (gaData?.conversions || 0) + (socialData?.conversions || 0),
        last_updated: new Date().toISOString()
      };

      // Update content_items table
      await supabase
        .from('content_items')
        .update({ performance_metrics: performanceMetrics })
        .eq('id', contentId);

    } catch (error) {
      console.error('Failed to update content performance metrics:', error);
    }
  }
}

export const analyticsAggregator = new AnalyticsAggregator();
