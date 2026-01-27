import { supabase } from '@/integrations/supabase/client';

export interface SocialAnalyticsData {
  platform: string;
  views: number | null;
  engagement: number | null;
  shares: number | null;
  clicks: number | null;
  conversions: number | null;
  lastUpdated?: string;
  isConnected: boolean;
  message?: string;
}

class SocialAnalyticsService {
  /**
   * Fetch social analytics from content_analytics table
   * Returns null with proper messaging if no API connected
   */
  async fetchLinkedInAnalytics(contentId: string): Promise<SocialAnalyticsData> {
    try {
      // Try to fetch from content_analytics table
      const { data, error } = await supabase
        .from('content_analytics')
        .select('analytics_data')
        .eq('content_id', contentId)
        .single();

      if (error || !data?.analytics_data) {
        return {
          platform: 'linkedin',
          views: null,
          engagement: null,
          shares: null,
          clicks: null,
          conversions: null,
          isConnected: false,
          message: 'Connect your LinkedIn account in Settings to view analytics'
        };
      }

      const analytics = data.analytics_data as Record<string, any>;
      const linkedin = analytics?.linkedin || {};

      return {
        platform: 'linkedin',
        views: linkedin.views ?? null,
        engagement: linkedin.engagement ?? null,
        shares: linkedin.shares ?? null,
        clicks: linkedin.clicks ?? null,
        conversions: linkedin.conversions ?? null,
        lastUpdated: linkedin.lastUpdated,
        isConnected: true
      };
    } catch (error) {
      console.error('Error fetching LinkedIn analytics:', error);
      return {
        platform: 'linkedin',
        views: null,
        engagement: null,
        shares: null,
        clicks: null,
        conversions: null,
        isConnected: false,
        message: 'Failed to fetch analytics data'
      };
    }
  }

  async fetchTwitterAnalytics(contentId: string): Promise<SocialAnalyticsData> {
    try {
      const { data, error } = await supabase
        .from('content_analytics')
        .select('analytics_data')
        .eq('content_id', contentId)
        .single();

      if (error || !data?.analytics_data) {
        return {
          platform: 'twitter',
          views: null,
          engagement: null,
          shares: null,
          clicks: null,
          conversions: null,
          isConnected: false,
          message: 'Connect your X (Twitter) account in Settings to view analytics'
        };
      }

      const analytics = data.analytics_data as Record<string, any>;
      const twitter = analytics?.twitter || analytics?.x || {};

      return {
        platform: 'twitter',
        views: twitter.views ?? null,
        engagement: twitter.engagement ?? null,
        shares: twitter.shares ?? null,
        clicks: twitter.clicks ?? null,
        conversions: twitter.conversions ?? null,
        lastUpdated: twitter.lastUpdated,
        isConnected: true
      };
    } catch (error) {
      console.error('Error fetching Twitter analytics:', error);
      return {
        platform: 'twitter',
        views: null,
        engagement: null,
        shares: null,
        clicks: null,
        conversions: null,
        isConnected: false,
        message: 'Failed to fetch analytics data'
      };
    }
  }

  async fetchSocialAnalytics(contentId: string, platform: string, postUrl?: string): Promise<SocialAnalyticsData | null> {
    if (!contentId) return null;

    try {
      switch (platform.toLowerCase()) {
        case 'linkedin':
          return await this.fetchLinkedInAnalytics(contentId);
        case 'twitter':
        case 'x':
          return await this.fetchTwitterAnalytics(contentId);
        default:
          return {
            platform,
            views: null,
            engagement: null,
            shares: null,
            clicks: null,
            conversions: null,
            isConnected: false,
            message: `${platform} analytics not supported yet`
          };
      }
    } catch (error) {
      console.error(`Failed to fetch ${platform} analytics:`, error);
      return null;
    }
  }

  /**
   * Aggregate analytics across all platforms for a content item
   */
  async getAggregatedAnalytics(contentId: string): Promise<{
    totalViews: number;
    totalEngagement: number;
    totalShares: number;
    platforms: SocialAnalyticsData[];
  }> {
    const platforms = ['linkedin', 'twitter'];
    const results = await Promise.all(
      platforms.map(p => this.fetchSocialAnalytics(contentId, p))
    );

    const validResults = results.filter((r): r is SocialAnalyticsData => r !== null);

    return {
      totalViews: validResults.reduce((sum, r) => sum + (r.views || 0), 0),
      totalEngagement: validResults.reduce((sum, r) => sum + (r.engagement || 0), 0),
      totalShares: validResults.reduce((sum, r) => sum + (r.shares || 0), 0),
      platforms: validResults
    };
  }
}

export const socialAnalyticsService = new SocialAnalyticsService();
