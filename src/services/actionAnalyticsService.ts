import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

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
   * Track when an action is triggered - persists to database
   */
  async trackActionTrigger(
    action: ContextualAction,
    userId: string,
    conversationId?: string,
    additionalData?: Record<string, any>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('action_analytics')
        .insert({
          action_id: action.id,
          action_type: action.type,
          action_label: action.label,
          user_id: userId,
          conversation_id: conversationId || null,
          triggered_at: new Date().toISOString(),
          success: false,
          interaction_data: additionalData || {}
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking action trigger:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error tracking action trigger:', error);
      return null;
    }
  }

  /**
   * Track when an action is completed - updates database record
   */
  async trackActionCompletion(
    analyticsId: string,
    success: boolean,
    effectivenessScore?: number,
    completionData?: Record<string, any>
  ): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        completed_at: new Date().toISOString(),
        success,
        updated_at: new Date().toISOString()
      };

      if (effectivenessScore !== undefined) {
        updateData.effectiveness_score = effectivenessScore;
      }

      if (completionData) {
        // Merge with existing interaction_data
        const { data: existing } = await supabase
          .from('action_analytics')
          .select('interaction_data')
          .eq('id', analyticsId)
          .single();

        updateData.interaction_data = {
          ...(existing?.interaction_data as Record<string, any> || {}),
          ...completionData
        };
      }

      const { error } = await supabase
        .from('action_analytics')
        .update(updateData)
        .eq('id', analyticsId);

      if (error) {
        console.error('Error tracking action completion:', error);
      }
    } catch (error) {
      console.error('Error tracking action completion:', error);
    }
  }

  /**
   * Get action effectiveness data for a user from database
   */
  async getActionEffectiveness(userId: string, limit: number = 50): Promise<ActionEffectiveness[]> {
    try {
      const { data: analytics, error } = await supabase
        .from('action_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('triggered_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching action analytics:', error);
        return [];
      }

      if (!analytics || analytics.length === 0) {
        return [];
      }

      // Group by action_id and calculate effectiveness
      const actionGroups = analytics.reduce((acc: Record<string, any>, record) => {
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
   * Track action patterns for learning - persists to database
   */
  async trackActionPattern(
    userId: string,
    actionSequence: string[],
    outcome: 'success' | 'failure',
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('action_patterns')
        .insert({
          user_id: userId,
          action_sequence: actionSequence,
          outcome,
          context: context || {}
        });

      if (error) {
        console.error('Error tracking action pattern:', error);
      }
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
      const { data, error } = await supabase
        .from('action_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('triggered_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        action_id: item.action_id,
        action_type: item.action_type,
        action_label: item.action_label,
        user_id: item.user_id,
        conversation_id: item.conversation_id || undefined,
        triggered_at: item.triggered_at,
        completed_at: item.completed_at || undefined,
        success: item.success,
        interaction_data: item.interaction_data as Record<string, any> || undefined,
        effectiveness_score: item.effectiveness_score || undefined
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private async generateTrendData(userId: string, days: number): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('action_analytics')
        .select('triggered_at, success')
        .eq('user_id', userId)
        .gte('triggered_at', startDate.toISOString())
        .order('triggered_at', { ascending: true });

      if (error) {
        console.error('Error generating trend data:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by date
      const dailyData = data.reduce((acc: Record<string, any>, record) => {
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
