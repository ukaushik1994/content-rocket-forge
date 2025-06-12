
import { contentBuilderIntegration, type ContentBuilderState, type ContentBuilderInsights } from './contentBuilderIntegration';
import { serpAnalysisIntegration, type SerpAnalysisState, type SerpInsights } from './serpAnalysisIntegration';
import { analyticsIntegration, type AnalyticsState, type AnalyticsInsights } from './analyticsIntegration';
import { PlatformContext } from './platformContextService';

export interface WorkflowContext {
  currentPage: string;
  contentBuilder?: {
    state: ContentBuilderState;
    insights: ContentBuilderInsights;
  };
  serpAnalysis?: {
    state: SerpAnalysisState;
    insights: SerpInsights;
  };
  analytics?: {
    state: AnalyticsState;
    insights: AnalyticsInsights;
  };
  recommendations: string[];
  availableActions: WorkflowAction[];
}

export interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'serp' | 'analytics' | 'navigation';
  parameters?: any;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

class WorkflowOrchestratorService {
  async getFullWorkflowContext(platformContext: PlatformContext): Promise<WorkflowContext> {
    const context: WorkflowContext = {
      currentPage: platformContext.currentPage,
      recommendations: [],
      availableActions: []
    };

    try {
      // Get Content Builder context if on relevant page
      if (platformContext.currentPage === '/content-builder') {
        const cbState = await contentBuilderIntegration.getContentBuilderState();
        if (cbState) {
          const cbInsights = contentBuilderIntegration.generateInsights(cbState);
          context.contentBuilder = { state: cbState, insights: cbInsights };
          context.recommendations.push(...cbInsights.recommendedActions);
        }
      }

      // Get SERP Analysis context
      const serpState = await serpAnalysisIntegration.getSerpAnalysisState();
      if (serpState && serpState.hasResults) {
        const serpInsights = serpAnalysisIntegration.generateSerpInsights(serpState);
        context.serpAnalysis = { state: serpState, insights: serpInsights };
        context.recommendations.push(...serpInsights.recommendations);
      }

      // Get Analytics context
      const analyticsState = await analyticsIntegration.getAnalyticsState();
      if (analyticsState) {
        const analyticsInsights = analyticsIntegration.generateAnalyticsInsights(analyticsState);
        context.analytics = { state: analyticsState, insights: analyticsInsights };
        context.recommendations.push(...analyticsInsights.recommendations);
      }

      // Generate available actions based on context
      context.availableActions = this.generateAvailableActions(context);

      return context;
    } catch (error) {
      console.error('Error getting workflow context:', error);
      return context;
    }
  }

  private generateAvailableActions(context: WorkflowContext): WorkflowAction[] {
    const actions: WorkflowAction[] = [];

    // Content Builder actions
    if (context.contentBuilder) {
      const { state, insights } = context.contentBuilder;
      
      if (insights.blockers.length > 0) {
        insights.blockers.forEach((blocker, index) => {
          actions.push({
            id: `resolve_blocker_${index}`,
            name: `Resolve: ${blocker}`,
            description: `Help resolve the current blocker: ${blocker}`,
            category: 'content',
            enabled: true,
            priority: 'high'
          });
        });
      }

      if (state.currentStep < state.stepNames.length - 1) {
        actions.push({
          id: 'next_step',
          name: `Proceed to ${insights.nextStepName}`,
          description: `Move to the next step in the content creation workflow`,
          category: 'content',
          enabled: insights.blockers.length === 0,
          priority: 'medium'
        });
      }
    }

    // SERP Analysis actions
    if (!context.serpAnalysis?.state.hasResults) {
      actions.push({
        id: 'analyze_serp',
        name: 'Analyze SERP Results',
        description: 'Perform SERP analysis for better content insights',
        category: 'serp',
        enabled: true,
        priority: 'high'
      });
    }

    // Analytics actions
    if (context.analytics) {
      const { state } = context.analytics;
      
      if (state.draftContent > 0) {
        actions.push({
          id: 'review_drafts',
          name: 'Review Draft Content',
          description: `Review and potentially publish ${state.draftContent} draft content pieces`,
          category: 'content',
          enabled: true,
          priority: 'medium'
        });
      }

      if (state.averageSeoScore < 70) {
        actions.push({
          id: 'improve_seo',
          name: 'Improve SEO Scores',
          description: 'Focus on improving SEO optimization across your content',
          category: 'content',
          enabled: true,
          priority: 'high'
        });
      }
    }

    // Navigation actions
    if (context.currentPage !== '/content-builder') {
      actions.push({
        id: 'go_to_content_builder',
        name: 'Go to Content Builder',
        description: 'Navigate to Content Builder to create new content',
        category: 'navigation',
        enabled: true,
        priority: 'low'
      });
    }

    if (context.currentPage !== '/analytics') {
      actions.push({
        id: 'go_to_analytics',
        name: 'View Analytics',
        description: 'Check your content performance and analytics',
        category: 'navigation',
        enabled: true,
        priority: 'low'
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  generateWorkflowSummary(context: WorkflowContext): string {
    const summary = [];

    if (context.contentBuilder) {
      const { state, insights } = context.contentBuilder;
      summary.push(`Content Builder: Currently on "${insights.currentStepName}" (${Math.round(insights.progress)}% complete)`);
      
      if (insights.blockers.length > 0) {
        summary.push(`⚠️ Blockers: ${insights.blockers.join(', ')}`);
      }
    }

    if (context.serpAnalysis?.state.hasResults) {
      const { insights } = context.serpAnalysis;
      summary.push(`SERP Analysis: ${insights.competitorCount} competitors analyzed, ${insights.opportunityScore}% opportunity score`);
    }

    if (context.analytics) {
      const { state } = context.analytics;
      summary.push(`Analytics: ${state.totalContent} total content, ${state.publishedContent} published, avg SEO score ${state.averageSeoScore}/100`);
    }

    if (context.recommendations.length > 0) {
      summary.push(`Top recommendations: ${context.recommendations.slice(0, 2).join(', ')}`);
    }

    return summary.join(' | ');
  }

  async executeWorkflowAction(actionId: string, parameters: any = {}): Promise<any> {
    try {
      // Route action to appropriate service
      if (actionId.startsWith('resolve_blocker') || actionId === 'next_step') {
        return await contentBuilderIntegration.executeWorkflowAction(actionId, parameters);
      }
      
      if (actionId === 'analyze_serp') {
        return await serpAnalysisIntegration.analyzeSerpForKeyword(parameters.keyword || 'default keyword');
      }
      
      if (actionId.startsWith('go_to_')) {
        const page = actionId.replace('go_to_', '').replace('_', '-');
        return { 
          success: true, 
          navigate: `/${page}`,
          message: `Navigating to ${page}...` 
        };
      }

      return { success: true, message: `Executed action: ${actionId}` };
    } catch (error) {
      console.error('Error executing workflow action:', error);
      throw error;
    }
  }
}

export const workflowOrchestrator = new WorkflowOrchestratorService();
