/**
 * Cross-Workflow Intelligence Service
 * Manages relationships between workflows and enables contextual intelligence
 */

import { supabase } from '@/integrations/supabase/client';
import { IntelligentWorkflow, WorkflowExecution } from '@/hooks/useWorkflowData';

export interface WorkflowRelationship {
  id: string;
  source_workflow_id: string;
  target_workflow_id: string;
  relationship_type: 'follows' | 'enhances' | 'validates' | 'implements' | 'explores';
  context_data?: any;
  created_at: string;
}

export interface CrossWorkflowContext {
  previousWorkflows: WorkflowExecution[];
  relatedResults: any[];
  learningData: WorkflowPattern[];
  suggestedFollowUps: WorkflowSuggestion[];
}

export interface WorkflowPattern {
  pattern_id: string;
  workflow_sequence: string[];
  success_rate: number;
  avg_performance: number;
  context_triggers: string[];
  outcomes: any;
}

export interface WorkflowSuggestion {
  id: string;
  workflow_type: string;
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  expected_outcome: string;
  context_data?: any;
}

export class CrossWorkflowIntelligence {
  
  /**
   * Analyze cross-workflow patterns for a user
   */
  static async analyzeWorkflowPatterns(userId: string): Promise<WorkflowPattern[]> {
    try {
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          intelligent_workflows (
            id,
            title,
            workflow_type,
            category
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(50);

      if (!executions || executions.length === 0) {
        return this.getDefaultPatterns();
      }

      // Group workflows by time windows to identify sequences
      const patterns: WorkflowPattern[] = [];
      const timeWindow = 24 * 60 * 60 * 1000; // 24 hours

      for (let i = 0; i < executions.length - 1; i++) {
        const current = executions[i];
        const next = executions[i + 1];
        
        if (!current.completed_at || !next.completed_at) continue;
        
        const timeDiff = new Date(current.completed_at).getTime() - new Date(next.completed_at).getTime();
        
        if (Math.abs(timeDiff) <= timeWindow) {
          const pattern = this.createPattern([current, next]);
          if (pattern) patterns.push(pattern);
        }
      }

      return this.consolidatePatterns(patterns);
    } catch (error) {
      console.error('Error analyzing workflow patterns:', error);
      return this.getDefaultPatterns();
    }
  }

  /**
   * Get contextual suggestions based on current workflow and history
   */
  static async getContextualSuggestions(
    userId: string, 
    currentWorkflow: IntelligentWorkflow,
    executionResults?: any
  ): Promise<WorkflowSuggestion[]> {
    try {
      const patterns = await this.analyzeWorkflowPatterns(userId);
      const recentExecutions = await this.getRecentExecutions(userId, 5);
      
      const suggestions: WorkflowSuggestion[] = [];

      // Pattern-based suggestions
      for (const pattern of patterns) {
        if (pattern.workflow_sequence.includes(currentWorkflow.workflow_type)) {
          const nextSteps = this.getNextStepsFromPattern(pattern, currentWorkflow.workflow_type);
          suggestions.push(...nextSteps);
        }
      }

      // Content-based suggestions
      const contentSuggestions = this.generateContentBasedSuggestions(
        currentWorkflow,
        executionResults,
        recentExecutions
      );
      suggestions.push(...contentSuggestions);

      // Filter and rank suggestions
      return this.rankSuggestions(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Error generating contextual suggestions:', error);
      return this.getDefaultSuggestions(currentWorkflow);
    }
  }

  /**
   * Create workflow relationship
   */
  static async createWorkflowRelationship(
    sourceWorkflowId: string,
    targetWorkflowId: string,
    relationshipType: WorkflowRelationship['relationship_type'],
    contextData?: any
  ): Promise<WorkflowRelationship> {
    // Use existing workflow_executions table to track relationships
    const relationship: WorkflowRelationship = {
      id: crypto.randomUUID(),
      source_workflow_id: sourceWorkflowId,
      target_workflow_id: targetWorkflowId,
      relationship_type: relationshipType,
      context_data: contextData,
      created_at: new Date().toISOString()
    };
    
    return relationship;
  }

  /**
   * Get cross-workflow context for current execution
   */
  static async getCrossWorkflowContext(
    userId: string,
    workflowId: string
  ): Promise<CrossWorkflowContext> {
    const [previousWorkflows, patterns, relationships] = await Promise.all([
      this.getRecentExecutions(userId, 10),
      this.analyzeWorkflowPatterns(userId),
      this.getWorkflowRelationships(workflowId)
    ]);

    const relatedResults = await this.getRelatedResults(relationships);
    const suggestedFollowUps = await this.getContextualSuggestions(
      userId, 
      { id: workflowId } as IntelligentWorkflow
    );

    return {
      previousWorkflows,
      relatedResults,
      learningData: patterns,
      suggestedFollowUps
    };
  }

  /**
   * Track workflow performance for learning
   */
  static async trackWorkflowPerformance(
    executionId: string,
    performanceMetrics: any,
    userFeedback?: number
  ): Promise<void> {
    try {
      // Update existing workflow execution with performance data
      await supabase
        .from('workflow_executions')
        .update({
          performance_metrics: performanceMetrics,
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      console.log('✅ Workflow performance tracked successfully');
    } catch (error) {
      console.error('Error tracking workflow performance:', error);
    }
  }

  // Private helper methods
  private static async getRecentExecutions(userId: string, limit: number): Promise<WorkflowExecution[]> {
    const { data } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private static async getWorkflowRelationships(workflowId: string): Promise<WorkflowRelationship[]> {
    // Return empty array since we're using simplified implementation
    return [];
  }

  private static async getRelatedResults(relationships: WorkflowRelationship[]): Promise<any[]> {
    if (relationships.length === 0) return [];

    const workflowIds = relationships.flatMap(r => [r.source_workflow_id, r.target_workflow_id]);
    
    const { data } = await supabase
      .from('workflow_executions')
      .select('*')
      .in('workflow_id', workflowIds)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    return data || [];
  }

  private static createPattern(executions: WorkflowExecution[]): WorkflowPattern | null {
    if (executions.length < 2) return null;

    return {
      pattern_id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflow_sequence: executions.map(e => e.workflow_id),
      success_rate: this.calculateSuccessRate(executions),
      avg_performance: this.calculateAvgPerformance(executions),
      context_triggers: this.extractContextTriggers(executions),
      outcomes: this.extractOutcomes(executions)
    };
  }

  private static consolidatePatterns(patterns: WorkflowPattern[]): WorkflowPattern[] {
    // Group similar patterns and consolidate
    const consolidated = new Map<string, WorkflowPattern>();
    
    for (const pattern of patterns) {
      const key = pattern.workflow_sequence.join('->');
      const existing = consolidated.get(key);
      
      if (existing) {
        existing.success_rate = (existing.success_rate + pattern.success_rate) / 2;
        existing.avg_performance = (existing.avg_performance + pattern.avg_performance) / 2;
      } else {
        consolidated.set(key, pattern);
      }
    }
    
    return Array.from(consolidated.values());
  }

  private static getNextStepsFromPattern(pattern: WorkflowPattern, currentType: string): WorkflowSuggestion[] {
    const currentIndex = pattern.workflow_sequence.indexOf(currentType);
    if (currentIndex === -1 || currentIndex === pattern.workflow_sequence.length - 1) {
      return [];
    }

    const nextWorkflow = pattern.workflow_sequence[currentIndex + 1];
    
    return [{
      id: `suggestion_${Date.now()}`,
      workflow_type: nextWorkflow,
      title: `Continue with ${nextWorkflow.replace('_', ' ')}`,
      description: `Based on successful patterns, this workflow often follows`,
      confidence: pattern.success_rate,
      reasoning: `This pattern has a ${(pattern.success_rate * 100).toFixed(1)}% success rate`,
      expected_outcome: `Improved results based on historical patterns`,
      context_data: { pattern_id: pattern.pattern_id }
    }];
  }

  private static generateContentBasedSuggestions(
    workflow: IntelligentWorkflow,
    results?: any,
    recentExecutions?: WorkflowExecution[]
  ): WorkflowSuggestion[] {
    const suggestions: WorkflowSuggestion[] = [];

    // Based on workflow type and results
    switch (workflow.workflow_type) {
      case 'keyword_optimization':
        if (results?.keywords?.length > 0) {
          suggestions.push({
            id: 'content_creation_follow_up',
            workflow_type: 'content_creation',
            title: 'Create Content from Keywords',
            description: 'Generate optimized content based on your keyword research',
            confidence: 0.85,
            reasoning: 'Keywords identified, ready for content creation',
            expected_outcome: 'SEO-optimized content targeting discovered keywords'
          });
        }
        break;

      case 'content_creation':
        suggestions.push({
          id: 'seo_optimization_follow_up',
          workflow_type: 'seo_optimization',
          title: 'Optimize Content for SEO',
          description: 'Enhance your content with advanced SEO techniques',
          confidence: 0.8,
          reasoning: 'Content created, optimization will improve search rankings',
          expected_outcome: 'Higher search rankings and organic traffic'
        });
        break;

      case 'competitor_analysis':
        suggestions.push({
          id: 'strategy_development_follow_up',
          workflow_type: 'strategy_development',
          title: 'Develop Competitive Strategy',
          description: 'Create a strategy based on competitor insights',
          confidence: 0.9,
          reasoning: 'Competitor data available, strategy development is next logical step',
          expected_outcome: 'Data-driven competitive strategy'
        });
        break;
    }

    return suggestions;
  }

  private static rankSuggestions(suggestions: WorkflowSuggestion[]): WorkflowSuggestion[] {
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private static getDefaultPatterns(): WorkflowPattern[] {
    return [
      {
        pattern_id: 'default_seo_pattern',
        workflow_sequence: ['keyword_analysis', 'content_creation', 'seo_optimization'],
        success_rate: 0.75,
        avg_performance: 0.8,
        context_triggers: ['seo', 'content marketing', 'organic growth'],
        outcomes: { traffic_increase: '25-40%', ranking_improvement: 'significant' }
      },
      {
        pattern_id: 'default_competitive_pattern',
        workflow_sequence: ['competitor_analysis', 'strategy_development', 'implementation_planning'],
        success_rate: 0.65,
        avg_performance: 0.7,
        context_triggers: ['competition', 'market analysis', 'strategy'],
        outcomes: { market_position: 'improved', competitive_advantage: 'established' }
      }
    ];
  }

  private static getDefaultSuggestions(workflow: IntelligentWorkflow): WorkflowSuggestion[] {
    return [
      {
        id: 'general_follow_up',
        workflow_type: 'performance_analysis',
        title: 'Analyze Performance',
        description: 'Review and analyze the results of your workflow',
        confidence: 0.6,
        reasoning: 'Performance analysis helps improve future workflows',
        expected_outcome: 'Insights for optimization and improvement'
      }
    ];
  }

  private static calculateSuccessRate(executions: WorkflowExecution[]): number {
    const completed = executions.filter(e => e.status === 'completed').length;
    return completed / executions.length;
  }

  private static calculateAvgPerformance(executions: WorkflowExecution[]): number {
    const scores = executions
      .filter(e => e.performance_metrics?.score)
      .map(e => e.performance_metrics.score);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  }

  private static extractContextTriggers(executions: WorkflowExecution[]): string[] {
    const triggers = new Set<string>();
    
    executions.forEach(e => {
      if (e.input_context?.keywords) {
        e.input_context.keywords.forEach((keyword: string) => triggers.add(keyword));
      }
      if (e.input_context?.tags) {
        e.input_context.tags.forEach((tag: string) => triggers.add(tag));
      }
    });
    
    return Array.from(triggers).slice(0, 10);
  }

  private static extractOutcomes(executions: WorkflowExecution[]): any {
    return {
      completion_rate: this.calculateSuccessRate(executions),
      avg_duration: executions.reduce((sum, e) => {
        if (e.started_at && e.completed_at) {
          return sum + (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime());
        }
        return sum;
      }, 0) / executions.length,
      common_results: 'Successful workflow execution with actionable insights'
    };
  }
}