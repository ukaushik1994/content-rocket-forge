import { ContextualAction } from '@/services/aiService';

export interface ActionAnalytics {
  id: string;
  action_id: string;
  action_type: string;
  action_label: string;
  user_id: string;
  conversation_id?: string;
  triggered_at: string;
  completed_at?: string;
  success: boolean;
  interaction_data?: Record<string, any>;
  effectiveness_score?: number;
}

export interface ActionEffectiveness {
  action_id: string;
  action_type: string;
  action_label: string;
  total_triggers: number;
  success_rate: number;
  avg_completion_time: number;
  effectiveness_score: number;
  last_triggered: string;
}

class ActionAnalyticsService {
  /**
   * Track when an action is triggered (mock implementation until Supabase types update)
   */
  async trackActionTrigger(
    action: ContextualAction,
    userId: string,
    conversationId?: string,
    additionalData?: Record<string, any>
  ): Promise<string | null> {
    try {
      // Mock implementation - store in localStorage temporarily
      const analyticsData = {
        id: `analytics-${Date.now()}`,
        action_id: action.id,
        action_type: action.type,
        action_label: action.label,
        user_id: userId,
        conversation_id: conversationId,
        triggered_at: new Date().toISOString(),
        success: false,
        interaction_data: additionalData || {}
      };

      const stored = localStorage.getItem('ai-action-analytics') || '[]';
      const analytics = JSON.parse(stored);
      analytics.push(analyticsData);
      localStorage.setItem('ai-action-analytics', JSON.stringify(analytics));

      return analyticsData.id;
    } catch (error) {
      console.error('Error tracking action trigger:', error);
      return null;
    }
  }

  /**
   * Track when an action is completed (mock implementation)
   */
  async trackActionCompletion(
    analyticsId: string,
    success: boolean,
    effectivenessScore?: number,
    completionData?: Record<string, any>
  ): Promise<void> {
    try {
      const stored = localStorage.getItem('ai-action-analytics') || '[]';
      const analytics = JSON.parse(stored);
      
      const index = analytics.findIndex((item: any) => item.id === analyticsId);
      if (index !== -1) {
        analytics[index].completed_at = new Date().toISOString();
        analytics[index].success = success;
        analytics[index].effectiveness_score = effectivenessScore;
        if (completionData) {
          analytics[index].interaction_data = { ...analytics[index].interaction_data, ...completionData };
        }
        localStorage.setItem('ai-action-analytics', JSON.stringify(analytics));
      }
    } catch (error) {
      console.error('Error tracking action completion:', error);
    }
  }

  /**
   * Get action effectiveness data for a user (mock implementation)
   */
  async getActionEffectiveness(userId: string, limit: number = 50): Promise<ActionEffectiveness[]> {
    try {
      const stored = localStorage.getItem('ai-action-analytics') || '[]';
      const analytics = JSON.parse(stored);
      
      const userAnalytics = analytics
        .filter((item: any) => item.user_id === userId)
        .slice(0, limit);

      // Group by action_id and calculate effectiveness
      const actionGroups = userAnalytics.reduce((acc: any, record: any) => {
        const key = record.action_id;
        if (!acc[key]) {
          acc[key] = {
            action_id: record.action_id,
            action_type: record.action_type,
            action_label: record.action_label,
            records: []
          };
        }
        acc[key].records.push(record);
        return acc;
      }, {});

      return Object.values(actionGroups).map((group: any) => {
        const records = group.records;
        const completedRecords = records.filter((r: any) => r.completed_at);
        const successfulRecords = completedRecords.filter((r: any) => r.success);
        
        const avgCompletionTime = completedRecords.length > 0
          ? completedRecords.reduce((sum: number, r: any) => {
              const triggered = new Date(r.triggered_at).getTime();
              const completed = new Date(r.completed_at).getTime();
              return sum + (completed - triggered);
            }, 0) / completedRecords.length
          : 0;

        const effectivenessScore = records.length > 0
          ? records.reduce((sum: number, r: any) => sum + (r.effectiveness_score || 0), 0) / records.length
          : 0;

        return {
          action_id: group.action_id,
          action_type: group.action_type,
          action_label: group.action_label,
          total_triggers: records.length,
          success_rate: completedRecords.length > 0 ? (successfulRecords.length / completedRecords.length) * 100 : 0,
          avg_completion_time: avgCompletionTime,
          effectiveness_score: effectivenessScore,
          last_triggered: records[0]?.triggered_at || ''
        };
      });
    } catch (error) {
      console.error('Error getting action effectiveness:', error);
      return [];
    }
  }

  /**
   * Get top performing actions for a user
   */
  async getTopPerformingActions(userId: string, limit: number = 10): Promise<ActionEffectiveness[]> {
    const effectiveness = await this.getActionEffectiveness(userId, 100);
    
    return effectiveness
      .filter(action => action.total_triggers >= 2)
      .sort((a, b) => {
        if (b.effectiveness_score !== a.effectiveness_score) {
          return b.effectiveness_score - a.effectiveness_score;
        }
        if (b.success_rate !== a.success_rate) {
          return b.success_rate - a.success_rate;
        }
        return b.total_triggers - a.total_triggers;
      })
      .slice(0, limit);
  }

  /**
   * Generate smart action recommendations based on analytics
   */
  async generateSmartActionRecommendations(
    userId: string,
    currentContext: Record<string, any>
  ): Promise<ContextualAction[]> {
    try {
      const topActions = await this.getTopPerformingActions(userId, 5);
      
      const recommendations: ContextualAction[] = topActions
        .filter(action => action.success_rate > 50)
        .map(action => ({
          id: `recommended-${action.action_id}`,
          type: action.action_type as any,
          label: `${action.action_label} (${action.success_rate.toFixed(0)}% success)`,
          action: action.action_id,
          variant: 'outline' as const,
          description: `Previously successful action (used ${action.total_triggers} times)`,
          data: {
            isRecommendation: true,
            originalActionId: action.action_id,
            effectivenessScore: action.effectiveness_score,
            successRate: action.success_rate
          }
        }));

      return recommendations;
    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      return [];
    }
  }

  /**
   * Track action patterns for learning (mock implementation)
   */
  async trackActionPattern(
    userId: string,
    actionSequence: string[],
    outcome: 'success' | 'failure',
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const patternData = {
        user_id: userId,
        action_sequence: actionSequence,
        outcome,
        context: context || {},
        created_at: new Date().toISOString()
      };

      const stored = localStorage.getItem('ai-action-patterns') || '[]';
      const patterns = JSON.parse(stored);
      patterns.push(patternData);
      localStorage.setItem('ai-action-patterns', JSON.stringify(patterns));
    } catch (error) {
      console.error('Error tracking action pattern:', error);
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(userId: string): Promise<{
    totalActions: number;
    successRate: number;
    topActions: ActionEffectiveness[];
    recentActivity: ActionAnalytics[];
    trendData: any[];
  }> {
    try {
      const [effectiveness, recentActivity] = await Promise.all([
        this.getActionEffectiveness(userId, 100),
        this.getRecentActivity(userId, 20)
      ]);

      const totalActions = effectiveness.reduce((sum, action) => sum + action.total_triggers, 0);
      const totalSuccesses = effectiveness.reduce((sum, action) => 
        sum + (action.total_triggers * (action.success_rate / 100)), 0
      );
      const overallSuccessRate = totalActions > 0 ? (totalSuccesses / totalActions) * 100 : 0;

      const trendData = await this.generateTrendData(userId, 7);

      return {
        totalActions,
        successRate: overallSuccessRate,
        topActions: effectiveness.slice(0, 5),
        recentActivity,
        trendData
      };
    } catch (error) {
      console.error('Error getting analytics dashboard:', error);
      return {
        totalActions: 0,
        successRate: 0,
        topActions: [],
        recentActivity: [],
        trendData: []
      };
    }
  }

  private async getRecentActivity(userId: string, limit: number): Promise<ActionAnalytics[]> {
    try {
      const stored = localStorage.getItem('ai-action-analytics') || '[]';
      const analytics = JSON.parse(stored);
      
      return analytics
        .filter((item: any) => item.user_id === userId)
        .sort((a: any, b: any) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private async generateTrendData(userId: string, days: number): Promise<any[]> {
    try {
      const stored = localStorage.getItem('ai-action-analytics') || '[]';
      const analytics = JSON.parse(stored);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const filteredData = analytics.filter((item: any) => {
        const itemDate = new Date(item.triggered_at);
        return item.user_id === userId && itemDate >= startDate && itemDate <= endDate;
      });

      const dailyData = filteredData.reduce((acc: any, record: any) => {
        const date = new Date(record.triggered_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0, successful: 0 };
        }
        acc[date].total++;
        if (record.success) acc[date].successful++;
        return acc;
      }, {});

      return Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Error generating trend data:', error);
      return [];
    }
  }
}

export const actionAnalyticsService = new ActionAnalyticsService();