import { supabase } from '@/integrations/supabase/client';

export interface GoogleAnalyticsData {
  views: number;
  engagement: number;
  clicks: number;
  conversions: number;
  bounceRate: number;
  avgSessionDuration: number;
  source: string;
}

class GoogleAnalyticsService {
  async fetchContentAnalytics(contentId: string, publishedUrl: string): Promise<GoogleAnalyticsData | null> {
    try {
      // Call the existing google-analytics-fetch edge function
      const { data, error } = await supabase.functions.invoke('google-analytics-fetch', {
        body: { contentId, publishedUrl }
      });

      if (error) {
        console.error('Error fetching Google Analytics:', error);
        return null;
      }

      // Transform GA data to our format
      return {
        views: data?.data?.pageViews || 0,
        engagement: data?.data?.sessions || 0,
        clicks: data?.data?.sessions || 0,
        conversions: data?.data?.conversionRate ? Math.round(data.data.sessions * data.data.conversionRate) : 0,
        bounceRate: data?.data?.bounceRate || 0,
        avgSessionDuration: data?.data?.avgSessionDuration || 0,
        source: 'google_analytics'
      };
    } catch (error) {
      console.error('Failed to fetch Google Analytics:', error);
      return null;
    }
  }

  async fetchCampaignAnalytics(campaignId: string, contentItems: any[]): Promise<GoogleAnalyticsData[]> {
    const results = await Promise.allSettled(
      contentItems
        .filter(item => item.published_url)
        .map(item => this.fetchContentAnalytics(item.id, item.published_url))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<GoogleAnalyticsData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();
