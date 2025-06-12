
import { workflowOrchestrator, type WorkflowContext } from './workflowOrchestrator';
import { PlatformContext } from './platformContextService';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowPrediction {
  id: string;
  type: 'blocker' | 'opportunity' | 'optimization' | 'risk';
  confidence: number;
  title: string;
  description: string;
  suggestedActions: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  priority: number;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  lastExecuted?: string;
}

export interface IntelligentInsights {
  predictions: WorkflowPrediction[];
  automations: WorkflowAutomation[];
  productivityScore: number;
  timeToCompletion: {
    estimated: string;
    confidence: number;
  };
  nextBestActions: {
    action: string;
    reasoning: string;
    impact: number;
  }[];
}

class IntelligentWorkflowService {
  async analyzeWorkflowIntelligence(
    platformContext: PlatformContext,
    workflowContext: WorkflowContext
  ): Promise<IntelligentInsights> {
    const predictions = await this.generatePredictions(platformContext, workflowContext);
    const automations = await this.getAvailableAutomations(platformContext);
    const productivityScore = this.calculateProductivityScore(workflowContext);
    const timeToCompletion = this.estimateTimeToCompletion(workflowContext);
    const nextBestActions = this.suggestNextBestActions(workflowContext, predictions);

    return {
      predictions,
      automations,
      productivityScore,
      timeToCompletion,
      nextBestActions
    };
  }

  private async generatePredictions(
    platformContext: PlatformContext,
    workflowContext: WorkflowContext
  ): Promise<WorkflowPrediction[]> {
    const predictions: WorkflowPrediction[] = [];

    // Content Builder predictions
    if (workflowContext.contentBuilder) {
      const { state, insights } = workflowContext.contentBuilder;
      
      // Predict blockers
      if (state.currentStep === 1 && !state.mainKeyword) {
        predictions.push({
          id: 'keyword_selection_delay',
          type: 'blocker',
          confidence: 0.85,
          title: 'Keyword Selection Delay',
          description: 'Without a main keyword, content creation will be unfocused and SEO performance may suffer.',
          suggestedActions: [
            'Research high-volume, low-competition keywords',
            'Use keyword research tools',
            'Analyze competitor keywords'
          ],
          estimatedImpact: 'high',
          priority: 1
        });
      }

      // Predict opportunities
      if (state.selectedKeywords.length > 0 && state.selectedSerpItems.length === 0) {
        predictions.push({
          id: 'serp_analysis_opportunity',
          type: 'opportunity',
          confidence: 0.75,
          title: 'SERP Analysis Opportunity',
          description: 'Analyzing SERP results could reveal content gaps and competitive advantages.',
          suggestedActions: [
            'Run SERP analysis for selected keywords',
            'Identify content gaps in top-ranking pages',
            'Find unique angles for your content'
          ],
          estimatedImpact: 'medium',
          priority: 2
        });
      }
    }

    // Analytics-based predictions
    if (workflowContext.analytics) {
      const { state } = workflowContext.analytics;
      
      if (state.averageSeoScore < 60) {
        predictions.push({
          id: 'seo_optimization_risk',
          type: 'risk',
          confidence: 0.90,
          title: 'SEO Performance Risk',
          description: 'Low average SEO scores indicate content may not perform well in search results.',
          suggestedActions: [
            'Audit existing content for SEO issues',
            'Implement keyword optimization strategy',
            'Improve content structure and meta tags'
          ],
          estimatedImpact: 'high',
          priority: 1
        });
      }

      if (state.draftContent > state.publishedContent * 2) {
        predictions.push({
          id: 'publishing_bottleneck',
          type: 'optimization',
          confidence: 0.80,
          title: 'Publishing Bottleneck',
          description: 'High draft-to-published ratio suggests a publishing workflow bottleneck.',
          suggestedActions: [
            'Streamline content approval process',
            'Set up automated publishing schedules',
            'Review and improve content quality standards'
          ],
          estimatedImpact: 'medium',
          priority: 3
        });
      }
    }

    return predictions.sort((a, b) => b.priority - a.priority);
  }

  private async getAvailableAutomations(platformContext: PlatformContext): Promise<WorkflowAutomation[]> {
    const automations: WorkflowAutomation[] = [
      {
        id: 'auto_keyword_research',
        name: 'Auto Keyword Research',
        description: 'Automatically suggest related keywords when a main keyword is selected',
        trigger: 'main_keyword_selected',
        actions: ['fetch_related_keywords', 'analyze_keyword_difficulty', 'suggest_long_tail_variations'],
        enabled: true
      },
      {
        id: 'auto_serp_analysis',
        name: 'Auto SERP Analysis',
        description: 'Automatically analyze SERP results when keywords are finalized',
        trigger: 'keywords_finalized',
        actions: ['analyze_top_10_results', 'extract_content_gaps', 'identify_ranking_factors'],
        enabled: false
      },
      {
        id: 'auto_seo_optimization',
        name: 'Auto SEO Optimization',
        description: 'Automatically suggest SEO improvements during content creation',
        trigger: 'content_written',
        actions: ['analyze_keyword_density', 'suggest_meta_tags', 'check_readability'],
        enabled: true
      },
      {
        id: 'auto_content_promotion',
        name: 'Auto Content Promotion',
        description: 'Automatically suggest promotion strategies when content is published',
        trigger: 'content_published',
        actions: ['suggest_social_posts', 'identify_outreach_targets', 'schedule_follow_ups'],
        enabled: false
      }
    ];

    return automations;
  }

  private calculateProductivityScore(workflowContext: WorkflowContext): number {
    let score = 100;
    let factors = 0;

    // Content Builder productivity factors
    if (workflowContext.contentBuilder) {
      const { insights } = workflowContext.contentBuilder;
      factors++;
      
      // Deduct points for blockers
      score -= insights.blockers.length * 15;
      
      // Add points for progress
      score += insights.progress * 0.2;
    }

    // Analytics productivity factors
    if (workflowContext.analytics) {
      const { state } = workflowContext.analytics;
      factors++;
      
      // SEO score factor
      score += (state.averageSeoScore - 50) * 0.3;
      
      // Publishing efficiency factor
      const publishingRatio = state.publishedContent / Math.max(1, state.totalContent);
      score += publishingRatio * 20;
    }

    // SERP analysis factor
    if (workflowContext.serpAnalysis?.state.hasResults) {
      factors++;
      score += 10; // Bonus for having SERP insights
    }

    return Math.max(0, Math.min(100, Math.round(score / Math.max(1, factors))));
  }

  private estimateTimeToCompletion(workflowContext: WorkflowContext): { estimated: string; confidence: number } {
    if (!workflowContext.contentBuilder) {
      return { estimated: 'N/A', confidence: 0 };
    }

    const { state, insights } = workflowContext.contentBuilder;
    const remainingSteps = state.stepNames.length - state.currentStep - 1;
    const averageTimePerStep = 15; // minutes
    
    let estimatedMinutes = remainingSteps * averageTimePerStep;
    let confidence = 0.7;

    // Adjust for blockers
    estimatedMinutes += insights.blockers.length * 10;
    confidence -= insights.blockers.length * 0.1;

    // Adjust for complexity
    if (state.selectedKeywords.length > 5) {
      estimatedMinutes += 10;
    }

    if (estimatedMinutes < 60) {
      return { 
        estimated: `${estimatedMinutes} minutes`, 
        confidence: Math.max(0.3, confidence) 
      };
    } else {
      const hours = Math.round(estimatedMinutes / 60 * 10) / 10;
      return { 
        estimated: `${hours} hours`, 
        confidence: Math.max(0.3, confidence) 
      };
    }
  }

  private suggestNextBestActions(
    workflowContext: WorkflowContext,
    predictions: WorkflowPrediction[]
  ): { action: string; reasoning: string; impact: number; }[] {
    const actions: { action: string; reasoning: string; impact: number; }[] = [];

    // High-priority predictions become top actions
    predictions
      .filter(p => p.confidence > 0.7 && p.estimatedImpact === 'high')
      .forEach(prediction => {
        actions.push({
          action: prediction.suggestedActions[0],
          reasoning: prediction.description,
          impact: prediction.confidence * 100
        });
      });

    // Content Builder specific actions
    if (workflowContext.contentBuilder) {
      const { insights } = workflowContext.contentBuilder;
      
      insights.recommendedActions.forEach(action => {
        if (!actions.some(a => a.action === action)) {
          actions.push({
            action,
            reasoning: insights.contextualHelp,
            impact: 75
          });
        }
      });
    }

    // Available workflow actions
    workflowContext.availableActions
      .filter(action => action.priority === 'high' && action.enabled)
      .forEach(action => {
        if (!actions.some(a => a.action === action.name)) {
          actions.push({
            action: action.name,
            reasoning: action.description,
            impact: 60
          });
        }
      });

    return actions
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
  }

  async executeAutomation(automationId: string, context: any): Promise<any> {
    try {
      console.log(`Executing automation: ${automationId}`, context);
      
      switch (automationId) {
        case 'auto_keyword_research':
          return await this.executeKeywordResearch(context);
        
        case 'auto_serp_analysis':
          return await this.executeSerpAnalysis(context);
        
        case 'auto_seo_optimization':
          return await this.executeSeoOptimization(context);
        
        case 'auto_content_promotion':
          return await this.executeContentPromotion(context);
        
        default:
          throw new Error(`Unknown automation: ${automationId}`);
      }
    } catch (error) {
      console.error(`Automation ${automationId} failed:`, error);
      throw error;
    }
  }

  private async executeKeywordResearch(context: any): Promise<any> {
    // Implementation would integrate with keyword research APIs
    return {
      success: true,
      message: 'Keyword research automation executed',
      results: {
        relatedKeywords: ['example keyword 1', 'example keyword 2'],
        difficulty: 'medium',
        suggestions: ['Focus on long-tail variations', 'Consider seasonal trends']
      }
    };
  }

  private async executeSerpAnalysis(context: any): Promise<any> {
    // Implementation would trigger SERP analysis
    return {
      success: true,
      message: 'SERP analysis automation executed',
      results: {
        competitorsAnalyzed: 10,
        contentGaps: ['FAQ section', 'Visual content'],
        recommendations: ['Add more comprehensive examples', 'Include expert quotes']
      }
    };
  }

  private async executeSeoOptimization(context: any): Promise<any> {
    // Implementation would analyze content for SEO
    return {
      success: true,
      message: 'SEO optimization automation executed',
      results: {
        keywordDensity: 'optimal',
        readabilityScore: 85,
        suggestions: ['Add more subheadings', 'Include alt text for images']
      }
    };
  }

  private async executeContentPromotion(context: any): Promise<any> {
    // Implementation would suggest promotion strategies
    return {
      success: true,
      message: 'Content promotion automation executed',
      results: {
        socialPosts: ['LinkedIn post template', 'Twitter thread'],
        outreachTargets: ['Industry influencers', 'Related blogs'],
        scheduledTasks: ['Follow up in 1 week', 'Track performance metrics']
      }
    };
  }
}

export const intelligentWorkflowService = new IntelligentWorkflowService();
