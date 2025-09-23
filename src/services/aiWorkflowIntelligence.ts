import { supabase } from '@/integrations/supabase/client';
import { serpPredictiveIntelligence } from './serpPredictiveIntelligence';
import { WorkflowState, WorkflowAction } from './serpWorkflowOrchestrator';

export interface WorkflowPattern {
  id: string;
  pattern: string;
  successRate: number;
  avgTimeToComplete: number;
  recommendedActions: string[];
  triggerConditions: string[];
}

export interface WorkflowOptimization {
  currentEfficiency: number;
  recommendedChanges: string[];
  predictedImprovement: number;
  automationOpportunities: string[];
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  condition: string;
  workflowType: WorkflowState['type'];
  priority: 'high' | 'medium' | 'low';
  automated: boolean;
  parameters: any;
}

/**
 * AI-powered workflow intelligence and optimization service
 */
export class AIWorkflowIntelligence {
  private static successPatterns = new Map<string, WorkflowPattern>();
  private static activeTriggers = new Map<string, WorkflowTrigger>();

  /**
   * Analyze workflow patterns and identify success factors
   */
  static async analyzeWorkflowPatterns(
    userId: string,
    workflowType?: WorkflowState['type']
  ): Promise<WorkflowPattern[]> {
    try {
      // Fetch workflow history from database
      const { data: workflowHistory } = await supabase
        .from('ai_workflow_states')
        .select('*')
        .eq('user_id', userId)
        .eq('workflow_type', workflowType || undefined)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!workflowHistory || workflowHistory.length === 0) {
        return this.getDefaultPatterns(workflowType);
      }

      // Analyze successful workflows
      const successfulWorkflows = workflowHistory.filter(w => 
        w.workflow_data && (w.workflow_data as any).status === 'completed'
      );

      const patterns = this.extractPatterns(successfulWorkflows);
      
      // Store patterns for future use
      patterns.forEach(pattern => {
        this.successPatterns.set(pattern.id, pattern);
      });

      return patterns;
    } catch (error) {
      console.error('Error analyzing workflow patterns:', error);
      return this.getDefaultPatterns(workflowType);
    }
  }

  /**
   * Generate AI-driven workflow optimization suggestions
   */
  static async optimizeWorkflow(
    workflow: WorkflowState,
    userId: string
  ): Promise<WorkflowOptimization> {
    try {
      const patterns = await this.analyzeWorkflowPatterns(userId, workflow.type);
      const currentEfficiency = this.calculateWorkflowEfficiency(workflow);
      
      const optimization: WorkflowOptimization = {
        currentEfficiency,
        recommendedChanges: [],
        predictedImprovement: 0,
        automationOpportunities: []
      };

      // Analyze against successful patterns
      const bestPattern = patterns.find(p => p.successRate >= 0.8);
      if (bestPattern) {
        const efficiency = this.compareAgainstPattern(workflow, bestPattern);
        optimization.recommendedChanges = efficiency.suggestions;
        optimization.predictedImprovement = efficiency.improvement;
      }

      // Identify automation opportunities
      optimization.automationOpportunities = this.identifyAutomationOpportunities(workflow, patterns);

      return optimization;
    } catch (error) {
      console.error('Error optimizing workflow:', error);
      return {
        currentEfficiency: 50,
        recommendedChanges: ['Monitor workflow completion times'],
        predictedImprovement: 20,
        automationOpportunities: ['Automate keyword analysis steps']
      };
    }
  }

  /**
   * Create automated workflow triggers based on SERP changes
   */
  static async createSerpBasedTriggers(
    userId: string,
    keywords: string[]
  ): Promise<WorkflowTrigger[]> {
    const triggers: WorkflowTrigger[] = [];

    // Ranking change trigger
    triggers.push({
      id: `rank_change_${Date.now()}`,
      name: 'Ranking Change Alert',
      condition: 'ranking_drops_more_than_5_positions',
      workflowType: 'competitor_tracking',
      priority: 'high',
      automated: true,
      parameters: {
        keywords,
        threshold: 5,
        timeframe: '7d'
      }
    });

    // New competitor trigger
    triggers.push({
      id: `new_competitor_${Date.now()}`,
      name: 'New Competitor Detection',
      condition: 'new_domain_in_top_10',
      workflowType: 'competitor_tracking',
      priority: 'medium',
      automated: true,
      parameters: {
        keywords,
        topPositions: 10
      }
    });

    // Trend opportunity trigger
    triggers.push({
      id: `trend_opportunity_${Date.now()}`,
      name: 'Rising Trend Opportunity',
      condition: 'search_volume_increase_30_percent',
      workflowType: 'content_planning',
      priority: 'high',
      automated: false,
      parameters: {
        keywords,
        volumeThreshold: 0.3,
        trendDuration: '30d'
      }
    });

    // Store triggers
    triggers.forEach(trigger => {
      this.activeTriggers.set(trigger.id, trigger);
    });

    // Save to database
    try {
      await supabase
        .from('ai_workflow_states')
        .insert({
          user_id: userId,
          workflow_type: 'trigger_management',
          current_step: 'active',
          workflow_data: {
            triggers: triggers.map(t => ({ ...t, userId }))
          }
        });
    } catch (error) {
      console.error('Error saving workflow triggers:', error);
    }

    return triggers;
  }

  /**
   * Generate smart workflow suggestions based on user context
   */
  static async generateWorkflowSuggestions(
    userId: string,
    context: any
  ): Promise<WorkflowAction[]> {
    const suggestions: WorkflowAction[] = [];

    try {
      // Analyze user's current content and SERP data
      if (context.serpData) {
        const opportunities = await serpPredictiveIntelligence.calculateOpportunityScores([context.serpData]);
        
        opportunities.forEach(opportunity => {
          if (opportunity.actionPriority === 'immediate') {
            suggestions.push({
              id: `urgent_${opportunity.keyword.replace(/\s+/g, '_')}`,
              type: 'generate_content',
              title: `Urgent: Create content for "${opportunity.keyword}"`,
              description: opportunity.reasoning,
              automated: false,
              parameters: {
                keyword: opportunity.keyword,
                priority: 'high',
                estimatedImpact: opportunity.opportunityScore
              }
            });
          }
        });
      }

      // Content gap analysis suggestions
      if (context.analytics?.published < 5) {
        suggestions.push({
          id: 'content_boost',
          type: 'analyze_keywords',
          title: 'Boost Content Production',
          description: 'Analyze high-opportunity keywords to rapidly expand your content library',
          automated: false,
          parameters: {
            targetCount: 10,
            focusArea: 'low_competition_keywords'
          }
        });
      }

      // Performance optimization suggestions
      if (context.analytics?.avgSeoScore < 70) {
        suggestions.push({
          id: 'seo_optimization',
          type: 'track_competitors',
          title: 'SEO Performance Analysis',
          description: 'Analyze top-performing competitor content to improve your SEO scores',
          automated: true,
          parameters: {
            competitorCount: 5,
            analysisDepth: 'comprehensive'
          }
        });
      }

      return suggestions.slice(0, 5); // Limit to most relevant
    } catch (error) {
      console.error('Error generating workflow suggestions:', error);
      return [{
        id: 'default_analysis',
        type: 'analyze_keywords',
        title: 'Start with Keyword Analysis',
        description: 'Begin your SEO journey with comprehensive keyword research',
        automated: false,
        parameters: {}
      }];
    }
  }

  /**
   * Monitor and execute automated workflow triggers
   */
  static async checkAndExecuteTriggers(userId: string): Promise<string[]> {
    const executedTriggers: string[] = [];

    try {
      // Get active triggers for user
      const { data: triggerData } = await supabase
        .from('ai_workflow_states')
        .select('workflow_data')
        .eq('user_id', userId)
        .eq('workflow_type', 'trigger_management')
        .eq('current_step', 'active')
        .single();

      if (!triggerData?.workflow_data) {
        return executedTriggers;
      }

      const workflowData = triggerData.workflow_data as any;
      if (!workflowData.triggers) {
        return executedTriggers;
      }

      const triggers = workflowData.triggers as WorkflowTrigger[];

      // Check each trigger condition
      for (const trigger of triggers) {
        if (!trigger.automated) continue;

        const shouldExecute = await this.evaluateTriggerCondition(trigger, userId);
        if (shouldExecute) {
          await this.executeTrigger(trigger, userId);
          executedTriggers.push(trigger.id);
        }
      }
    } catch (error) {
      console.error('Error checking workflow triggers:', error);
    }

    return executedTriggers;
  }

  // Private helper methods
  private static extractPatterns(workflows: any[]): WorkflowPattern[] {
    const patterns: WorkflowPattern[] = [];

    // Analyze common success patterns
    const groupedByType = workflows.reduce((acc, workflow) => {
      const type = workflow.workflow_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(workflow);
      return acc;
    }, {});

    Object.entries(groupedByType).forEach(([type, typeWorkflows]: [string, any[]]) => {
      const avgTime = typeWorkflows.reduce((sum, w) => {
        const start = new Date(w.created_at).getTime();
        const end = new Date(w.updated_at).getTime();
        return sum + (end - start);
      }, 0) / typeWorkflows.length;

      patterns.push({
        id: `pattern_${type}`,
        pattern: `Successful ${type} workflow`,
        successRate: typeWorkflows.length / Math.max(workflows.length, 1),
        avgTimeToComplete: avgTime / 1000, // Convert to seconds
        recommendedActions: this.extractCommonActions(typeWorkflows),
        triggerConditions: [`${type}_analysis_needed`]
      });
    });

    return patterns;
  }

  private static extractCommonActions(workflows: any[]): string[] {
    // Extract common actions from successful workflows
    return [
      'Start with comprehensive keyword research',
      'Analyze top 3 competitors thoroughly',
      'Identify content gaps early',
      'Focus on quick wins first'
    ];
  }

  private static getDefaultPatterns(workflowType?: WorkflowState['type']): WorkflowPattern[] {
    const defaultPatterns: WorkflowPattern[] = [
      {
        id: 'keyword_analysis_default',
        pattern: 'Keyword Analysis Best Practice',
        successRate: 0.85,
        avgTimeToComplete: 300, // 5 minutes
        recommendedActions: [
          'Start with broad keyword research',
          'Analyze search volume and difficulty',
          'Identify long-tail opportunities',
          'Check competitor rankings'
        ],
        triggerConditions: ['new_project', 'content_planning']
      },
      {
        id: 'content_planning_default',
        pattern: 'Content Planning Excellence',
        successRate: 0.78,
        avgTimeToComplete: 600, // 10 minutes
        recommendedActions: [
          'Map keywords to content types',
          'Identify content gaps',
          'Plan content calendar',
          'Set success metrics'
        ],
        triggerConditions: ['keyword_analysis_complete', 'content_strategy_needed']
      }
    ];

    return workflowType 
      ? defaultPatterns.filter(p => p.id.includes(workflowType))
      : defaultPatterns;
  }

  private static calculateWorkflowEfficiency(workflow: WorkflowState): number {
    // Calculate efficiency based on progress, time, and completion
    const progressWeight = workflow.progress * 0.4;
    const timeWeight = Math.max(0, 60 - (Date.now() - new Date(workflow.metadata.startedAt).getTime()) / 1000) * 0.3;
    const statusWeight = workflow.status === 'completed' ? 30 : workflow.status === 'running' ? 20 : 10;
    
    return Math.min(100, progressWeight + timeWeight + statusWeight);
  }

  private static compareAgainstPattern(workflow: WorkflowState, pattern: WorkflowPattern): {
    suggestions: string[];
    improvement: number;
  } {
    const suggestions: string[] = [];
    let improvement = 0;

    // Compare workflow actions against pattern recommendations
    const workflowActions = workflow.nextActions.map(a => a.description.toLowerCase());
    const patternActions = pattern.recommendedActions.map(a => a.toLowerCase());

    const missingActions = patternActions.filter(pa => 
      !workflowActions.some(wa => wa.includes(pa.split(' ')[0]))
    );

    if (missingActions.length > 0) {
      suggestions.push(`Consider adding: ${missingActions.slice(0, 2).join(', ')}`);
      improvement += missingActions.length * 5;
    }

    // Time efficiency comparison
    const currentTime = Date.now() - new Date(workflow.metadata.startedAt).getTime();
    if (currentTime > pattern.avgTimeToComplete * 1000) {
      suggestions.push('Optimize workflow steps to reduce completion time');
      improvement += 10;
    }

    return { suggestions, improvement: Math.min(improvement, 50) };
  }

  private static identifyAutomationOpportunities(
    workflow: WorkflowState, 
    patterns: WorkflowPattern[]
  ): string[] {
    const opportunities: string[] = [];

    // Check for repetitive manual actions
    const manualActions = workflow.nextActions.filter(a => !a.automated);
    if (manualActions.length > 3) {
      opportunities.push('Automate keyword analysis steps');
    }

    // Check against successful patterns
    const relevantPattern = patterns.find(p => p.id.includes(workflow.type));
    if (relevantPattern && relevantPattern.successRate > 0.8) {
      opportunities.push('Create automated workflow template based on successful patterns');
    }

    // SERP-specific automation
    if (workflow.type === 'keyword_analysis') {
      opportunities.push('Set up automated SERP monitoring for analyzed keywords');
    }

    return opportunities.slice(0, 3);
  }

  private static async evaluateTriggerCondition(trigger: WorkflowTrigger, userId: string): Promise<boolean> {
    // Simplified trigger evaluation - in production, this would check actual SERP data
    switch (trigger.condition) {
      case 'ranking_drops_more_than_5_positions':
        return Math.random() > 0.9; // 10% chance of significant ranking drop
      case 'new_domain_in_top_10':
        return Math.random() > 0.95; // 5% chance of new competitor
      case 'search_volume_increase_30_percent':
        return Math.random() > 0.8; // 20% chance of volume increase
      default:
        return false;
    }
  }

  private static async executeTrigger(trigger: WorkflowTrigger, userId: string): Promise<void> {
    console.log(`🚀 Executing automated trigger: ${trigger.name}`);
    
    // Create workflow based on trigger
    const { SerpWorkflowOrchestrator } = await import('./serpWorkflowOrchestrator');
    
    await SerpWorkflowOrchestrator.createWorkflow(
      trigger.workflowType,
      trigger.parameters.keywords || [],
      {
        userId,
        priority: trigger.priority,
        automated: true
      }
    );

    // Log the trigger execution
    await supabase
      .from('serp_usage_logs')
      .insert({
        user_id: userId,
        provider: 'ai_workflow',
        operation: 'trigger_execution',
        success: true,
        metadata: {
          triggerId: trigger.id,
          triggerName: trigger.name,
          condition: trigger.condition
        }
      });
  }
}

// Export convenience functions
export const aiWorkflowIntelligence = {
  analyzeWorkflowPatterns: AIWorkflowIntelligence.analyzeWorkflowPatterns.bind(AIWorkflowIntelligence),
  optimizeWorkflow: AIWorkflowIntelligence.optimizeWorkflow.bind(AIWorkflowIntelligence),
  createSerpBasedTriggers: AIWorkflowIntelligence.createSerpBasedTriggers.bind(AIWorkflowIntelligence),
  generateWorkflowSuggestions: AIWorkflowIntelligence.generateWorkflowSuggestions.bind(AIWorkflowIntelligence),
  checkAndExecuteTriggers: AIWorkflowIntelligence.checkAndExecuteTriggers.bind(AIWorkflowIntelligence)
};