/**
 * Workflow Analytics Dashboard Service
 * Provides comprehensive analytics and insights for intelligent workflows
 */

import { supabase } from '@/integrations/supabase/client';
import { WorkflowExecution, IntelligentWorkflow } from '@/hooks/useWorkflowData';
import { CrossWorkflowIntelligence } from './crossWorkflowIntelligence';
import { WorkflowErrorRecovery } from './workflowErrorRecovery';

export interface WorkflowAnalytics {
  performance: PerformanceMetrics;
  usage: UsageMetrics;
  trends: TrendAnalysis;
  insights: WorkflowInsights;
  recommendations: Recommendation[];
}

export interface PerformanceMetrics {
  successRate: number;
  avgExecutionTime: number;
  errorRate: number;
  recoveryRate: number;
  throughput: number;
  qualityScore: number;
}

export interface UsageMetrics {
  totalExecutions: number;
  executionsThisMonth: number;
  mostUsedWorkflows: Array<{ type: string; count: number; successRate: number }>;
  peakUsageHours: number[];
  userEngagement: number;
}

export interface TrendAnalysis {
  performanceTrend: Array<{ date: string; value: number }>;
  usageTrend: Array<{ date: string; value: number }>;
  errorTrend: Array<{ date: string; value: number }>;
  improvementAreas: string[];
}

export interface WorkflowInsights {
  topPerformers: string[];
  underPerformers: string[];
  optimalSequences: string[][];
  resourceUtilization: any;
  userSatisfaction: number;
}

export interface Recommendation {
  id: string;
  type: 'performance' | 'usage' | 'optimization' | 'cost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  actionRequired: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

export class WorkflowAnalyticsDashboard {
  
  /**
   * Get comprehensive workflow analytics for a user
   */
  static async getWorkflowAnalytics(userId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<WorkflowAnalytics> {
    const startDate = this.getStartDate(timeRange);
    
    const [
      executions,
      workflows,
      performanceData,
      recoveryStats
    ] = await Promise.all([
      this.getExecutions(userId, startDate),
      this.getWorkflows(userId),
      this.getPerformanceData(userId, startDate),
      WorkflowErrorRecovery.getRecoveryStats(userId)
    ]);

    const performance = this.calculatePerformanceMetrics(executions, recoveryStats);
    const usage = this.calculateUsageMetrics(executions, workflows);
    const trends = await this.analyzeTrends(userId, startDate);
    const insights = await this.generateInsights(executions, workflows);
    const recommendations = this.generateRecommendations(performance, usage, trends, insights);

    return {
      performance,
      usage,
      trends,
      insights,
      recommendations
    };
  }

  /**
   * Generate real-time performance dashboard data
   */
  static async getRealTimeMetrics(userId: string): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const { data: recentExecutions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo.toISOString());

      const running = recentExecutions?.filter(e => e.status === 'running').length || 0;
      const completed = recentExecutions?.filter(e => e.status === 'completed').length || 0;
      const failed = recentExecutions?.filter(e => e.status === 'failed').length || 0;

      return {
        activeWorkflows: running,
        completedLastHour: completed,
        failedLastHour: failed,
        avgResponseTime: this.calculateAvgResponseTime(recentExecutions || []),
        systemHealth: this.calculateSystemHealth(recentExecutions || []),
        lastUpdate: now.toISOString()
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return null;
    }
  }

  /**
   * Generate workflow optimization suggestions
   */
  static async getOptimizationSuggestions(userId: string): Promise<Recommendation[]> {
    const analytics = await this.getWorkflowAnalytics(userId);
    const suggestions: Recommendation[] = [];

    // Performance-based suggestions
    if (analytics.performance.successRate < 0.8) {
      suggestions.push({
        id: 'improve_success_rate',
        type: 'performance',
        priority: 'high',
        title: 'Improve Workflow Success Rate',
        description: `Your current success rate is ${(analytics.performance.successRate * 100).toFixed(1)}%. Consider reviewing failed executions and optimizing error handling.`,
        expectedImpact: 'Increase success rate by 15-25%',
        actionRequired: 'Review error logs and implement better error handling',
        estimatedEffort: 'medium'
      });
    }

    // Usage-based suggestions
    if (analytics.usage.userEngagement < 0.5) {
      suggestions.push({
        id: 'increase_engagement',
        type: 'usage',
        priority: 'medium',
        title: 'Increase Workflow Engagement',
        description: 'Low engagement detected. Consider creating more intuitive workflows or providing better user guidance.',
        expectedImpact: 'Improve user satisfaction and workflow adoption',
        actionRequired: 'Review user experience and add guided workflows',
        estimatedEffort: 'high'
      });
    }

    // Trend-based suggestions
    const performanceTrend = analytics.trends.performanceTrend;
    if (performanceTrend.length > 5) {
      const recent = performanceTrend.slice(-3);
      const older = performanceTrend.slice(-6, -3);
      const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length;
      
      if (recentAvg < olderAvg * 0.9) {
        suggestions.push({
          id: 'performance_declining',
          type: 'performance',
          priority: 'critical',
          title: 'Performance Decline Detected',
          description: 'Workflow performance has declined recently. Immediate attention required.',
          expectedImpact: 'Prevent further performance degradation',
          actionRequired: 'Investigate recent changes and optimize workflows',
          estimatedEffort: 'high'
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Export analytics data
   */
  static async exportAnalyticsData(
    userId: string, 
    format: 'json' | 'csv' = 'json',
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<string> {
    const analytics = await this.getWorkflowAnalytics(userId, timeRange);
    
    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }
    
    return JSON.stringify(analytics, null, 2);
  }

  // Private helper methods
  private static getStartDate(timeRange: '7d' | '30d' | '90d'): string {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  }

  private static async getExecutions(userId: string, startDate: string): Promise<WorkflowExecution[]> {
    const { data } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });
    
    return data || [];
  }

  private static async getWorkflows(userId: string): Promise<IntelligentWorkflow[]> {
    const { data } = await supabase
      .from('intelligent_workflows')
      .select('*')
      .eq('user_id', userId);
    
    return (data || []) as IntelligentWorkflow[];
  }

  private static async getPerformanceData(userId: string, startDate: string): Promise<any> {
    // Use existing action_analytics table instead of non-existent workflow_performance_logs
    const { data } = await supabase
      .from('action_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate);
    
    return data || [];
  }

  private static calculatePerformanceMetrics(executions: any[], recoveryStats: any): PerformanceMetrics {
    const total = executions.length;
    if (total === 0) {
      return {
        successRate: 0,
        avgExecutionTime: 0,
        errorRate: 0,
        recoveryRate: 0,
        throughput: 0,
        qualityScore: 0
      };
    }

    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    
    const executionTimes = executions
      .filter(e => e.started_at && e.completed_at)
      .map(e => new Date(e.completed_at!).getTime() - new Date(e.started_at!).getTime());
    
    const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / Math.max(executionTimes.length, 1);

    return {
      successRate: completed / total,
      avgExecutionTime: avgExecutionTime / (1000 * 60), // Convert to minutes
      errorRate: failed / total,
      recoveryRate: recoveryStats?.recoveryRate || 0,
      throughput: total / 24, // Executions per day (assuming 24 hour period)
      qualityScore: this.calculateQualityScore(executions)
    };
  }

  private static calculateUsageMetrics(executions: any[], workflows: IntelligentWorkflow[]): UsageMetrics {
    const now = new Date();
    const thisMonth = executions.filter(e => {
      const created = new Date(e.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });

    const workflowCounts = new Map<string, { count: number; completed: number }>();
    executions.forEach(e => {
      const current = workflowCounts.get(e.workflow_id) || { count: 0, completed: 0 };
      current.count++;
      if (e.status === 'completed') current.completed++;
      workflowCounts.set(e.workflow_id, current);
    });

    const mostUsedWorkflows = Array.from(workflowCounts.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        successRate: stats.count > 0 ? stats.completed / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const peakUsageHours = this.calculatePeakUsageHours(executions);

    return {
      totalExecutions: executions.length,
      executionsThisMonth: thisMonth.length,
      mostUsedWorkflows,
      peakUsageHours,
      userEngagement: this.calculateUserEngagement(executions, workflows)
    };
  }

  private static async analyzeTrends(userId: string, startDate: string): Promise<TrendAnalysis> {
    const { data: dailyStats } = await supabase
      .from('workflow_executions')
      .select('created_at, status, performance_metrics')
      .eq('user_id', userId)
      .gte('created_at', startDate);

    if (!dailyStats) {
      return {
        performanceTrend: [],
        usageTrend: [],
        errorTrend: [],
        improvementAreas: []
      };
    }

    const dailyGroups = this.groupByDate(dailyStats);
    
    const performanceTrend = Object.entries(dailyGroups).map(([date, executions]) => ({
      date,
      value: executions.filter(e => e.status === 'completed').length / executions.length
    }));

    const usageTrend = Object.entries(dailyGroups).map(([date, executions]) => ({
      date,
      value: executions.length
    }));

    const errorTrend = Object.entries(dailyGroups).map(([date, executions]) => ({
      date,
      value: executions.filter(e => e.status === 'failed').length
    }));

    return {
      performanceTrend,
      usageTrend,
      errorTrend,
      improvementAreas: this.identifyImprovementAreas(performanceTrend, usageTrend, errorTrend)
    };
  }

  private static async generateInsights(executions: WorkflowExecution[], workflows: IntelligentWorkflow[]): Promise<WorkflowInsights> {
    const workflowPerformance = new Map<string, { success: number; total: number; avgTime: number }>();
    
    executions.forEach(e => {
      const current = workflowPerformance.get(e.workflow_id) || { success: 0, total: 0, avgTime: 0 };
      current.total++;
      if (e.status === 'completed') {
        current.success++;
        if (e.started_at && e.completed_at) {
          const duration = new Date(e.completed_at).getTime() - new Date(e.started_at).getTime();
          current.avgTime = (current.avgTime * (current.success - 1) + duration) / current.success;
        }
      }
      workflowPerformance.set(e.workflow_id, current);
    });

    const performers = Array.from(workflowPerformance.entries())
      .map(([id, stats]) => ({
        id,
        successRate: stats.total > 0 ? stats.success / stats.total : 0,
        avgTime: stats.avgTime
      }))
      .sort((a, b) => b.successRate - a.successRate);

    return {
      topPerformers: performers.slice(0, 3).map(p => p.id),
      underPerformers: performers.slice(-3).map(p => p.id),
      optimalSequences: await this.findOptimalSequences(executions),
      resourceUtilization: this.calculateResourceUtilization(executions),
      userSatisfaction: this.calculateUserSatisfaction(executions)
    };
  }

  private static generateRecommendations(
    performance: PerformanceMetrics,
    usage: UsageMetrics,
    trends: TrendAnalysis,
    insights: WorkflowInsights
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Add recommendation logic based on metrics
    if (performance.errorRate > 0.2) {
      recommendations.push({
        id: 'reduce_errors',
        type: 'performance',
        priority: 'high',
        title: 'Reduce Error Rate',
        description: 'High error rate detected. Focus on improving error handling and validation.',
        expectedImpact: 'Reduce errors by 50%',
        actionRequired: 'Review and optimize error-prone workflows',
        estimatedEffort: 'medium'
      });
    }

    return recommendations;
  }

  // Additional helper methods
  private static calculateQualityScore(executions: WorkflowExecution[]): number {
    // Implement quality scoring based on multiple factors
    return 0.75; // Placeholder
  }

  private static calculatePeakUsageHours(executions: WorkflowExecution[]): number[] {
    const hourCounts = new Array(24).fill(0);
    executions.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      hourCounts[hour]++;
    });
    return hourCounts;
  }

  private static calculateUserEngagement(executions: WorkflowExecution[], workflows: IntelligentWorkflow[]): number {
    // Implement engagement calculation
    return 0.65; // Placeholder
  }

  private static groupByDate(data: any[]): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      groups[date] = groups[date] || [];
      groups[date].push(item);
      return groups;
    }, {});
  }

  private static identifyImprovementAreas(performanceTrend: any[], usageTrend: any[], errorTrend: any[]): string[] {
    const areas: string[] = [];
    
    // Analyze trends to identify improvement areas
    if (performanceTrend.some(p => p.value < 0.7)) {
      areas.push('Performance Optimization');
    }
    
    if (errorTrend.some(e => e.value > 5)) {
      areas.push('Error Reduction');
    }
    
    return areas;
  }

  private static async findOptimalSequences(executions: WorkflowExecution[]): Promise<string[][]> {
    // Implement sequence analysis
    return [['keyword_analysis', 'content_creation', 'seo_optimization']];
  }

  private static calculateResourceUtilization(executions: WorkflowExecution[]): any {
    return {
      cpuUsage: 0.45,
      memoryUsage: 0.32,
      apiCalls: executions.length * 1.5
    };
  }

  private static calculateUserSatisfaction(executions: WorkflowExecution[]): number {
    return 0.78; // Placeholder
  }

  private static calculateAvgResponseTime(executions: WorkflowExecution[]): number {
    const times = executions
      .filter(e => e.started_at && e.completed_at)
      .map(e => new Date(e.completed_at!).getTime() - new Date(e.started_at!).getTime());
    
    return times.reduce((sum, time) => sum + time, 0) / Math.max(times.length, 1);
  }

  private static calculateSystemHealth(executions: WorkflowExecution[]): number {
    const completed = executions.filter(e => e.status === 'completed').length;
    const total = executions.length;
    return total > 0 ? completed / total : 1;
  }

  private static convertToCSV(analytics: WorkflowAnalytics): string {
    // Implement CSV conversion
    return 'CSV export not implemented yet';
  }
}