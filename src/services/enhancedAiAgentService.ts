
import { supabase } from '@/integrations/supabase/client';
import { aiAgentService } from './aiAgentService';

interface EnhancedContext {
  currentPage: string;
  pageName: string;
  userInfo: any;
  recentActivity: any[];
  currentData: any;
}

class EnhancedAIAgentService {
  async getEnhancedContext(basicContext: any): Promise<EnhancedContext> {
    const enhanced: EnhancedContext = {
      ...basicContext,
      recentActivity: [],
      currentData: null
    };

    try {
      // Get recent user activity
      const { data: recentContent } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      enhanced.recentActivity = recentContent || [];

      // Get page-specific data
      switch (basicContext.currentPage) {
        case '/':
          enhanced.currentData = await this.getDashboardData();
          break;
        case '/content-builder':
          enhanced.currentData = await this.getContentBuilderData();
          break;
        case '/analytics':
          enhanced.currentData = await this.getAnalyticsData();
          break;
        case '/solutions':
          enhanced.currentData = await this.getSolutionsData();
          break;
      }

    } catch (error) {
      console.error('Error getting enhanced context:', error);
    }

    return enhanced;
  }

  private async getDashboardData() {
    try {
      const { data: contentCount } = await supabase
        .from('content_items')
        .select('id', { count: 'exact' })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      return {
        contentCount: contentCount?.length || 0,
        pageType: 'dashboard'
      };
    } catch (error) {
      return { error: 'Failed to load dashboard data' };
    }
  }

  private async getContentBuilderData() {
    return {
      pageType: 'content-builder',
      availableFeatures: [
        'Keyword Research',
        'SERP Analysis', 
        'Content Generation',
        'SEO Optimization'
      ]
    };
  }

  private async getAnalyticsData() {
    try {
      const { data: analytics } = await supabase
        .from('content_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        pageType: 'analytics',
        recentAnalytics: analytics || []
      };
    } catch (error) {
      return { error: 'Failed to load analytics data' };
    }
  }

  private async getSolutionsData() {
    try {
      const { data: solutions } = await supabase
        .from('solutions')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      return {
        pageType: 'solutions',
        userSolutions: solutions || []
      };
    } catch (error) {
      return { error: 'Failed to load solutions data' };
    }
  }

  async addNavigationFunction() {
    // Add navigation capability to the AI agent using the public method
    aiAgentService.registerFunction('navigateToPage', this.navigateToPage.bind(this));
  }

  private async navigateToPage(params: any) {
    const validPages = [
      '/',
      '/content-builder',
      '/analytics', 
      '/solutions',
      '/settings',
      '/drafts',
      '/ai-assistant'
    ];

    if (validPages.includes(params.page)) {
      return { 
        success: true, 
        navigate: params.page,
        notification: `Navigating to ${params.page}...` 
      };
    } else {
      throw new Error(`Invalid page: ${params.page}`);
    }
  }
}

export const enhancedAiAgentService = new EnhancedAIAgentService();
