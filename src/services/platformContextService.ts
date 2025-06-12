
import { supabase } from '@/integrations/supabase/client';

export interface PlatformContext {
  currentPage: string;
  pageName: string;
  userInfo: any;
  contentBuilderState?: any;
  serpData?: any;
  recentContent: any[];
  analytics?: any;
  solutions?: any[];
  brandGuidelines?: any;
  companyInfo?: any;
  timestamp: string;
}

class PlatformContextService {
  async getFullContext(basicContext: any): Promise<PlatformContext> {
    const context: PlatformContext = {
      ...basicContext,
      recentContent: [],
      timestamp: new Date().toISOString()
    };

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return context;
      }

      // Get recent content
      const { data: recentContent } = await supabase
        .from('content_items')
        .select('id, title, status, created_at, seo_score')
        .eq('user_id', user.data.user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      context.recentContent = recentContent || [];

      // Get page-specific context
      await this.addPageSpecificContext(context, basicContext.currentPage);

      // Get user profile and company info
      await this.addUserContext(context, user.data.user.id);

    } catch (error) {
      console.error('Error getting platform context:', error);
    }

    return context;
  }

  private async addPageSpecificContext(context: PlatformContext, currentPage: string) {
    try {
      switch (currentPage) {
        case '/':
          await this.addDashboardContext(context);
          break;
        case '/content-builder':
          await this.addContentBuilderContext(context);
          break;
        case '/analytics':
          await this.addAnalyticsContext(context);
          break;
        case '/solutions':
          await this.addSolutionsContext(context);
          break;
      }
    } catch (error) {
      console.error('Error adding page-specific context:', error);
    }
  }

  private async addDashboardContext(context: PlatformContext) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data: contentStats } = await supabase
      .from('content_items')
      .select('status')
      .eq('user_id', user.data.user.id);

    context.analytics = {
      totalContent: contentStats?.length || 0,
      published: contentStats?.filter(item => item.status === 'published').length || 0,
      drafts: contentStats?.filter(item => item.status === 'draft').length || 0
    };
  }

  private async addContentBuilderContext(context: PlatformContext) {
    // This would integrate with Content Builder state when available
    context.contentBuilderState = {
      currentStep: 'keyword_research', // This would come from actual state
      hasKeywords: false, // This would be determined from actual selections
      hasSerpData: false,
      hasOutline: false
    };
  }

  private async addAnalyticsContext(context: PlatformContext) {
    const { data: analytics } = await supabase
      .from('content_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    context.analytics = {
      recentAnalytics: analytics || [],
      totalViews: analytics?.reduce((sum, item) => {
        const data = item.analytics_data as any;
        return sum + (data?.views || 0);
      }, 0) || 0
    };
  }

  private async addSolutionsContext(context: PlatformContext) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data: solutions } = await supabase
      .from('solutions')
      .select('*')
      .eq('user_id', user.data.user.id);

    context.solutions = solutions || [];
  }

  private async addUserContext(context: PlatformContext, userId: string) {
    try {
      // Get company info
      const { data: companyInfo } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (companyInfo) {
        context.companyInfo = companyInfo;
      }

      // Get brand guidelines
      const { data: brandGuidelines } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (brandGuidelines) {
        context.brandGuidelines = brandGuidelines;
      }
    } catch (error) {
      console.error('Error adding user context:', error);
    }
  }

  generateContextSummary(context: PlatformContext): string {
    const summary = [`User is on ${context.pageName} page`];
    
    if (context.recentContent.length > 0) {
      summary.push(`Has ${context.recentContent.length} recent content items`);
    }

    if (context.companyInfo) {
      summary.push(`Company: ${context.companyInfo.name}`);
    }

    if (context.analytics) {
      if (context.analytics.totalContent) {
        summary.push(`Total content: ${context.analytics.totalContent}`);
      }
      if (context.analytics.published) {
        summary.push(`Published: ${context.analytics.published}`);
      }
    }

    return summary.join(', ');
  }
}

export const platformContextService = new PlatformContextService();
