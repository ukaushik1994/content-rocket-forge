
import { PlatformContext } from './platformContextService';
import { WorkflowContext } from './workflowOrchestrator';
import { IntelligentInsights } from './intelligentWorkflowService';

export interface SmartSuggestion {
  id: string;
  type: 'action' | 'optimization' | 'insight' | 'warning';
  category: 'content' | 'seo' | 'workflow' | 'productivity';
  title: string;
  description: string;
  actionText: string;
  actionType: 'function_call' | 'navigation' | 'external_link';
  actionData: any;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeEstimate?: string;
  expectedImpact?: string;
}

export interface SuggestionContext {
  userMessage: string;
  platformContext: PlatformContext;
  workflowContext: WorkflowContext;
  intelligentInsights: IntelligentInsights;
  recentActions: string[];
}

class SmartSuggestionEngine {
  generateContextualSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // Add workflow-based suggestions
    suggestions.push(...this.generateWorkflowSuggestions(context));
    
    // Add intelligence-based suggestions
    suggestions.push(...this.generateIntelligenceSuggestions(context));
    
    // Add performance-based suggestions
    suggestions.push(...this.generatePerformanceSuggestions(context));
    
    // Add proactive suggestions
    suggestions.push(...this.generateProactiveSuggestions(context));

    return suggestions
      .sort((a, b) => this.calculatePriorityScore(b) - this.calculatePriorityScore(a))
      .slice(0, 6); // Limit to top 6 suggestions
  }

  private generateWorkflowSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const { workflowContext } = context;

    // Content Builder suggestions
    if (workflowContext.contentBuilder) {
      const { state, insights } = workflowContext.contentBuilder;

      if (insights.blockers.length > 0) {
        suggestions.push({
          id: 'resolve_blockers',
          type: 'warning',
          category: 'workflow',
          title: 'Resolve Workflow Blockers',
          description: `You have ${insights.blockers.length} blockers preventing progress: ${insights.blockers.join(', ')}`,
          actionText: 'Show me how to resolve these',
          actionType: 'function_call',
          actionData: { function: 'resolveBlockers', blockers: insights.blockers },
          confidence: 0.95,
          priority: 'critical',
          timeEstimate: '5-10 minutes',
          expectedImpact: 'Unblock workflow progression'
        });
      }

      if (state.currentStep < state.stepNames.length - 1 && insights.blockers.length === 0) {
        suggestions.push({
          id: 'next_step',
          type: 'action',
          category: 'workflow',
          title: `Ready for ${insights.nextStepName}`,
          description: `You've completed the current step. Ready to move to ${insights.nextStepName}?`,
          actionText: `Proceed to ${insights.nextStepName}`,
          actionType: 'function_call',
          actionData: { function: 'proceedToNextStep' },
          confidence: 0.90,
          priority: 'high',
          timeEstimate: '15-30 minutes',
          expectedImpact: 'Progress workflow to completion'
        });
      }
    }

    // SERP Analysis suggestions
    if (!workflowContext.serpAnalysis?.state.hasResults && workflowContext.contentBuilder?.state.selectedKeywords.length > 0) {
      suggestions.push({
        id: 'run_serp_analysis',
        type: 'optimization',
        category: 'seo',
        title: 'Analyze SERP Results',
        description: 'Get competitive insights by analyzing search results for your keywords',
        actionText: 'Run SERP Analysis',
        actionType: 'function_call',
        actionData: { function: 'analyzeSerpResults' },
        confidence: 0.85,
        priority: 'high',
        timeEstimate: '5 minutes',
        expectedImpact: 'Improve content strategy with competitive insights'
      });
    }

    return suggestions;
  }

  private generateIntelligenceSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const { intelligentInsights } = context;

    // Convert high-impact predictions to suggestions
    intelligentInsights.predictions
      .filter(p => p.estimatedImpact === 'high' && p.confidence > 0.8)
      .forEach(prediction => {
        suggestions.push({
          id: `prediction_${prediction.id}`,
          type: prediction.type === 'blocker' ? 'warning' : 'optimization',
          category: 'productivity',
          title: prediction.title,
          description: prediction.description,
          actionText: prediction.suggestedActions[0],
          actionType: 'function_call',
          actionData: { function: 'executePredictionAction', predictionId: prediction.id },
          confidence: prediction.confidence,
          priority: prediction.type === 'blocker' ? 'critical' : 'high',
          expectedImpact: `${prediction.estimatedImpact} impact improvement`
        });
      });

    // Next best actions
    intelligentInsights.nextBestActions
      .slice(0, 2)
      .forEach((action, index) => {
        suggestions.push({
          id: `next_best_${index}`,
          type: 'action',
          category: 'productivity',
          title: `Recommended: ${action.action}`,
          description: action.reasoning,
          actionText: action.action,
          actionType: 'function_call',
          actionData: { function: 'executeRecommendedAction', action: action.action },
          confidence: action.impact / 100,
          priority: action.impact > 80 ? 'high' : 'medium',
          expectedImpact: `${Math.round(action.impact)}% productivity improvement`
        });
      });

    return suggestions;
  }

  private generatePerformanceSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const { workflowContext, intelligentInsights } = context;

    // Low productivity score suggestions
    if (intelligentInsights.productivityScore < 60) {
      suggestions.push({
        id: 'improve_productivity',
        type: 'insight',
        category: 'productivity',
        title: 'Productivity Improvement Needed',
        description: `Your productivity score is ${intelligentInsights.productivityScore}/100. Let me help optimize your workflow.`,
        actionText: 'Get Productivity Tips',
        actionType: 'function_call',
        actionData: { function: 'showProductivityTips' },
        confidence: 0.80,
        priority: 'medium',
        expectedImpact: 'Increase workflow efficiency'
      });
    }

    // Analytics-based suggestions
    if (workflowContext.analytics) {
      const { state } = workflowContext.analytics;
      
      if (state.averageSeoScore < 70) {
        suggestions.push({
          id: 'improve_seo',
          type: 'optimization',
          category: 'seo',
          title: 'SEO Score Needs Improvement',
          description: `Average SEO score is ${state.averageSeoScore}/100. Let's optimize your content for better search performance.`,
          actionText: 'Optimize SEO',
          actionType: 'function_call',
          actionData: { function: 'optimizeSeo' },
          confidence: 0.85,
          priority: 'high',
          timeEstimate: '20-30 minutes',
          expectedImpact: 'Improve search rankings and visibility'
        });
      }
    }

    return suggestions;
  }

  private generateProactiveSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const { platformContext, userMessage } = context;

    // Message-based proactive suggestions
    const messageLower = userMessage.toLowerCase();

    if (messageLower.includes('stuck') || messageLower.includes('help') || messageLower.includes('confused')) {
      suggestions.push({
        id: 'guided_assistance',
        type: 'action',
        category: 'workflow',
        title: 'Get Guided Assistance',
        description: 'Let me walk you through your current task step by step',
        actionText: 'Start Guided Mode',
        actionType: 'function_call',
        actionData: { function: 'startGuidedMode' },
        confidence: 0.90,
        priority: 'high',
        timeEstimate: '10-15 minutes',
        expectedImpact: 'Clear understanding and progress'
      });
    }

    if (messageLower.includes('content') && messageLower.includes('idea')) {
      suggestions.push({
        id: 'content_ideation',
        type: 'action',
        category: 'content',
        title: 'Generate Content Ideas',
        description: 'Get AI-powered content ideas based on your industry and audience',
        actionText: 'Generate Ideas',
        actionType: 'function_call',
        actionData: { function: 'generateContentIdeas' },
        confidence: 0.85,
        priority: 'medium',
        timeEstimate: '5 minutes',
        expectedImpact: 'Fresh content inspiration'
      });
    }

    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17 && context.recentActions.length === 0) {
      suggestions.push({
        id: 'daily_productivity',
        type: 'insight',
        category: 'productivity',
        title: 'Start Your Productive Day',
        description: 'Review your content pipeline and plan today\'s priorities',
        actionText: 'Show Daily Dashboard',
        actionType: 'navigation',
        actionData: { page: '/analytics' },
        confidence: 0.70,
        priority: 'low',
        expectedImpact: 'Better daily planning'
      });
    }

    return suggestions;
  }

  private calculatePriorityScore(suggestion: SmartSuggestion): number {
    const priorityValues = { critical: 100, high: 75, medium: 50, low: 25 };
    const typeMultipliers = { warning: 1.2, action: 1.0, optimization: 0.9, insight: 0.8 };
    
    const baseScore = priorityValues[suggestion.priority];
    const confidenceBoost = suggestion.confidence * 20;
    const typeMultiplier = typeMultipliers[suggestion.type];
    
    return (baseScore + confidenceBoost) * typeMultiplier;
  }

  generateQuickActions(context: SuggestionContext): SmartSuggestion[] {
    return [
      {
        id: 'create_content',
        type: 'action',
        category: 'content',
        title: 'Create New Content',
        description: 'Start building new content with AI assistance',
        actionText: 'Create Content',
        actionType: 'navigation',
        actionData: { page: '/content-builder' },
        confidence: 1.0,
        priority: 'high'
      },
      {
        id: 'analyze_performance',
        type: 'action',
        category: 'seo',
        title: 'Analyze Performance',
        description: 'Review your content performance and metrics',
        actionText: 'View Analytics',
        actionType: 'navigation',
        actionData: { page: '/analytics' },
        confidence: 1.0,
        priority: 'medium'
      },
      {
        id: 'optimize_existing',
        type: 'optimization',
        category: 'seo',
        title: 'Optimize Existing Content',
        description: 'Improve SEO and performance of published content',
        actionText: 'Optimize Content',
        actionType: 'function_call',
        actionData: { function: 'optimizeExistingContent' },
        confidence: 0.9,
        priority: 'medium'
      }
    ];
  }
}

export const smartSuggestionEngine = new SmartSuggestionEngine();
