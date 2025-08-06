import { supabase } from '@/integrations/supabase/client';

export interface UsageStats {
  provider: string;
  requestCount: number;
  totalTokens?: number;
  totalCost?: number;
  successRate: number;
  lastUsed?: string;
}

export interface UsagePeriod {
  label: string;
  value: string;
  hours: number;
}

export const USAGE_PERIODS: UsagePeriod[] = [
  { label: '24 Hours', value: '24h', hours: 24 },
  { label: '7 Days', value: '7d', hours: 168 },
  { label: '30 Days', value: '30d', hours: 720 }
];

export class UsageTrackingService {
  // Log SERP usage - temporarily disabled until migration is applied
  static async logSerpUsage(provider: string, operation: string, success: boolean, metadata?: any) {
    try {
      console.log('SERP usage:', { provider, operation, success, metadata });
      // TODO: Enable after serp_usage_logs table is created
      // const { data: userData } = await supabase.auth.getUser();
      // if (!userData.user) return;
      // await supabase.from('serp_usage_logs').insert({...});
    } catch (error) {
      console.error('Failed to log SERP usage:', error);
    }
  }

  // Get AI usage statistics by provider
  static async getAIUsageStats(period: string): Promise<UsageStats[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      const periodHours = USAGE_PERIODS.find(p => p.value === period)?.hours || 24;
      const startDate = new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('llm_usage_logs')
        .select('*')
        .eq('user_id', userData.user.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by provider
      const grouped = data?.reduce((acc: Record<string, any[]>, log) => {
        const provider = log.provider || 'unknown';
        if (!acc[provider]) acc[provider] = [];
        acc[provider].push(log);
        return acc;
      }, {}) || {};

      // Calculate stats for each provider
      return Object.entries(grouped).map(([provider, logs]) => {
        const totalRequests = logs.length;
        const successfulRequests = logs.filter(log => log.response_status?.includes('success') || log.status === 'success').length;
        const totalTokens = logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
        const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
        const lastUsed = logs[0]?.created_at;

        return {
          provider,
          requestCount: totalRequests,
          totalTokens,
          totalCost,
          successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
          lastUsed
        };
      });
    } catch (error) {
      console.error('Failed to get AI usage stats:', error);
      return [];
    }
  }

  // Get SERP usage statistics by provider
  static async getSerpUsageStats(period: string): Promise<UsageStats[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      const periodHours = USAGE_PERIODS.find(p => p.value === period)?.hours || 24;
      const startDate = new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();

      // Use raw_serp_data for now until serp_usage_logs is available
      const { data: serpData } = await supabase
        .from('raw_serp_data')
        .select('*')
        .gte('cached_at', startDate);
        
      if (!serpData) return [];

      // Group by search_engine (closest to provider concept)
      const grouped = serpData.reduce((acc: Record<string, any[]>, item) => {
        const provider = item.search_engine || 'serpstack';
        if (!acc[provider]) acc[provider] = [];
        acc[provider].push(item);
        return acc;
      }, {});

      // Calculate stats for each provider
      return Object.entries(grouped).map(([provider, items]) => {
        const totalRequests = items.length;
        const lastUsed = items[0]?.cached_at;

        return {
          provider,
          requestCount: totalRequests,
          successRate: 100, // Assume success if data exists
          lastUsed
        };
      });
    } catch (error) {
      console.error('Failed to get SERP usage stats:', error);
      return [];
    }
  }
}