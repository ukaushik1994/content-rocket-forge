
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsState {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  averageSeoScore: number;
  topPerformingContent: any[];
  recentAnalytics: any[];
  performanceMetrics: {
    totalViews: number;
    totalClicks: number;
    averagePosition: number;
    totalImpressions: number;
  };
}

export interface AnalyticsInsights {
  performanceSummary: string;
  topPerformers: string[];
  improvementAreas: string[];
  recommendations: string[];
  trends: {
    direction: 'up' | 'down' | 'stable';
    description: string;
  }[];
}

class AnalyticsIntegrationService {
  async getAnalyticsState(): Promise<AnalyticsState | null> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      // Get content statistics
      const { data: contentStats } = await supabase
        .from('content_items')
        .select('id, status, seo_score, title, created_at')
        .eq('user_id', user.data.user.id);

      // Get analytics data
      const { data: analytics } = await supabase
        .from('content_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const totalContent = contentStats?.length || 0;
      const publishedContent = contentStats?.filter(item => item.status === 'published').length || 0;
      const draftContent = contentStats?.filter(item => item.status === 'draft').length || 0;
      
      const averageSeoScore = contentStats?.length > 0 
        ? Math.round(contentStats.reduce((sum, item) => sum + (item.seo_score || 0), 0) / contentStats.length)
        : 0;

      // Calculate performance metrics
      const performanceMetrics = {
        totalViews: analytics?.reduce((sum, item) => {
          const data = item.analytics_data as any;
          return sum + (data?.views || 0);
        }, 0) || 0,
        totalClicks: analytics?.reduce((sum, item) => {
          const data = item.analytics_data as any;
          return sum + (data?.clicks || 0);
        }, 0) || 0,
        averagePosition: analytics?.length > 0 
          ? Math.round(analytics.reduce((sum, item) => {
              const data = item.analytics_data as any;
              return sum + (data?.position || 0);
            }, 0) / analytics.length)
          : 0,
        totalImpressions: analytics?.reduce((sum, item) => {
          const data = item.analytics_data as any;
          return sum + (data?.impressions || 0);
        }, 0) || 0
      };

      return {
        totalContent,
        publishedContent,
        draftContent,
        averageSeoScore,
        topPerformingContent: contentStats?.slice(0, 5) || [],
        recentAnalytics: analytics || [],
        performanceMetrics
      };
    } catch (error) {
      console.error('Error getting analytics state:', error);
      return null;
    }
  }

  generateAnalyticsInsights(state: AnalyticsState): AnalyticsInsights {
    const performanceSummary = `You have ${state.totalContent} total content pieces, with ${state.publishedContent} published and ${state.draftContent} in draft. Average SEO score: ${state.averageSeoScore}/100.`;

    const topPerformers = state.topPerformingContent
      .filter(content => content.seo_score > 80)
      .map(content => content.title)
      .slice(0, 3);

    const improvementAreas = [];
    const recommendations = [];

    if (state.averageSeoScore < 70) {
      improvementAreas.push('SEO optimization across content');
      recommendations.push('Focus on improving SEO scores through better keyword optimization and content structure');
    }

    if (state.draftContent > state.publishedContent) {
      improvementAreas.push('Content publishing workflow');
      recommendations.push('Consider establishing a regular publishing schedule to move drafts to published status');
    }

    if (state.performanceMetrics.totalViews < 1000) {
      improvementAreas.push('Content visibility and reach');
      recommendations.push('Implement content promotion strategies to increase visibility and traffic');
    }

    const trends: { direction: 'up' | 'down' | 'stable'; description: string; }[] = [
      {
        direction: state.performanceMetrics.totalViews > 500 ? 'up' : 'stable',
        description: `Content views trending ${state.performanceMetrics.totalViews > 500 ? 'upward' : 'stable'}`
      },
      {
        direction: state.averageSeoScore > 75 ? 'up' : 'down',
        description: `SEO performance ${state.averageSeoScore > 75 ? 'improving' : 'needs attention'}`
      }
    ];

    return {
      performanceSummary,
      topPerformers,
      improvementAreas,
      recommendations,
      trends
    };
  }

  async getContentPerformance(contentId: string): Promise<any> {
    try {
      const { data: analytics } = await supabase
        .from('content_analytics')
        .select('*')
        .eq('content_id', contentId)
        .single();

      return analytics?.analytics_data || {};
    } catch (error) {
      console.error('Error getting content performance:', error);
      return {};
    }
  }
}

export const analyticsIntegration = new AnalyticsIntegrationService();
