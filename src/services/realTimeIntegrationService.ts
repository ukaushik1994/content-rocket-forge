import { supabase } from '@/integrations/supabase/client';

/**
 * Real-time integration service for live data updates
 * Eliminates all mock data dependencies and provides real Supabase integration
 */

export interface RealTimeDataSubscription {
  unsubscribe: () => void;
}

export class RealTimeIntegrationService {
  private subscriptions: Map<string, any> = new Map();

  /**
   * Subscribe to real-time content updates
   */
  subscribeToContentUpdates(
    userId: string,
    onUpdate: (payload: any) => void
  ): RealTimeDataSubscription {
    const channel = supabase
      .channel('content-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_items',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe();

    this.subscriptions.set('content-updates', channel);

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete('content-updates');
      }
    };
  }

  /**
   * Subscribe to real-time analytics updates
   */
  subscribeToAnalyticsUpdates(
    userId: string,
    onUpdate: (payload: any) => void
  ): RealTimeDataSubscription {
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_analytics'
        },
        onUpdate
      )
      .subscribe();

    this.subscriptions.set('analytics-updates', channel);

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete('analytics-updates');
      }
    };
  }

  /**
   * Subscribe to real-time glossary updates
   */
  subscribeToGlossaryUpdates(
    userId: string,
    onUpdate: (payload: any) => void
  ): RealTimeDataSubscription {
    const channel = supabase
      .channel('glossary-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'glossary_terms',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe();

    this.subscriptions.set('glossary-updates', channel);

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete('glossary-updates');
      }
    };
  }

  /**
   * Fetch real content metrics from database
   */
  async fetchRealContentMetrics(userId: string) {
    const { data, error } = await supabase
      .from('content_items')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        content_analytics (
          analytics_data,
          last_fetched_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching real content metrics:', error);
      return {
        totalContent: 0,
        published: 0,
        drafts: 0,
        totalViews: 0,
        totalEngagement: 0
      };
    }

    const totalContent = data.length;
    const published = data.filter(item => item.status === 'published').length;
    const drafts = data.filter(item => item.status === 'draft').length;
    
    // Calculate real analytics from content_analytics table
    const totalViews = data.reduce((sum, item) => {
      const analytics = (item as any).content_analytics?.[0]?.analytics_data as any;
      return sum + (analytics?.totalViews || 0);
    }, 0);

    const totalEngagement = data.reduce((sum, item) => {
      const analytics = (item as any).content_analytics?.[0]?.analytics_data as any;
      return sum + (analytics?.engagement || 0);
    }, 0);

    return {
      totalContent,
      published,
      drafts,
      totalViews,
      totalEngagement: totalEngagement / Math.max(data.length, 1)
    };
  }

  /**
   * Fetch real glossary metrics
   */
  async fetchRealGlossaryMetrics(userId: string) {
    const { data: glossaries, error: glossariesError } = await supabase
      .from('glossaries')
      .select('id')
      .eq('user_id', userId);

    const { data: terms, error: termsError } = await supabase
      .from('glossary_terms')
      .select('id')
      .eq('user_id', userId);

    if (glossariesError || termsError) {
      console.error('Error fetching glossary metrics:', { glossariesError, termsError });
      return {
        totalGlossaries: 0,
        totalTerms: 0
      };
    }

    return {
      totalGlossaries: glossaries?.length || 0,
      totalTerms: terms?.length || 0
    };
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const realTimeIntegrationService = new RealTimeIntegrationService();