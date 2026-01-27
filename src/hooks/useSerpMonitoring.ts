import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SerpMonitoringMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  dailyUsage: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
  providerStats: {
    serp: { requests: number; errors: number; avgTime: number };
    serpstack: { requests: number; errors: number; avgTime: number };
  };
}

type SerpErrorType = 'no-auth' | 'no-api-keys' | 'api-error' | 'database-error' | 'no-data';

interface SerpMonitoringError {
  type: SerpErrorType;
  message: string;
  actionable?: boolean;
}

interface SerpApiCall {
  id: string;
  provider: 'serp' | 'serpstack';
  endpoint: string;
  keyword: string;
  responseTime: number;
  status: 'success' | 'error';
  timestamp: Date;
  error?: string;
}

/**
 * Hook to monitor SERP API usage and performance
 * Adds monitoring layer without modifying existing API calls
 */
export function useSerpMonitoring() {
  const [metrics, setMetrics] = useState<SerpMonitoringMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    dailyUsage: [],
    providerStats: {
      serp: { requests: 0, errors: 0, avgTime: 0 },
      serpstack: { requests: 0, errors: 0, avgTime: 0 }
    }
  });
  
  const [recentCalls, setRecentCalls] = useState<SerpApiCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SerpMonitoringError | null>(null);

  // Log API call for monitoring
  const logApiCall = useCallback(async (call: Omit<SerpApiCall, 'id' | 'timestamp'>) => {
    try {
      const apiCall: SerpApiCall = {
        ...call,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      // Add to recent calls (keep last 50)
      setRecentCalls(prev => [apiCall, ...prev.slice(0, 49)]);

      // Update metrics in memory for now
      await refreshMetrics();
    } catch (error) {
      console.warn('Error logging SERP API call:', error);
    }
  }, []);

  // Refresh metrics from in-memory data
  const refreshMetrics = useCallback(async () => {
    try {
      // Calculate metrics from recent calls in memory
      const totalRequests = recentCalls.length;
      const successfulRequests = recentCalls.filter(c => c.status === 'success').length;
      const failedRequests = totalRequests - successfulRequests;
      const avgResponseTime = totalRequests > 0 
        ? recentCalls.reduce((sum, c) => sum + c.responseTime, 0) / totalRequests 
        : 0;

      // Calculate daily usage from recent calls
      const dailyUsage = calculateDailyUsage(recentCalls);
      
      // Calculate provider stats from recent calls  
      const providerStats = calculateProviderStats(recentCalls);

      setMetrics({
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0,
        dailyUsage,
        providerStats
      });
    } catch (error) {
      console.error('Error refreshing SERP metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recentCalls]);

  // Calculate daily usage from API calls
  const calculateDailyUsage = (calls: SerpApiCall[]) => {
    const dailyMap = new Map<string, { requests: number; errors: number }>();
    
    calls.forEach(call => {
      const date = call.timestamp.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { requests: 0, errors: 0 };
      dailyMap.set(date, {
        requests: existing.requests + 1,
        errors: existing.errors + (call.status === 'error' ? 1 : 0)
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days
  };

  // Calculate provider-specific stats
  const calculateProviderStats = (calls: SerpApiCall[]) => {
    const stats = {
      serp: { requests: 0, errors: 0, avgTime: 0, totalTime: 0 },
      serpstack: { requests: 0, errors: 0, avgTime: 0, totalTime: 0 }
    };

    calls.forEach(call => {
      const provider = call.provider;
      if (stats[provider]) {
        stats[provider].requests++;
        if (call.status === 'error') stats[provider].errors++;
        stats[provider].totalTime += call.responseTime || 0;
      }
    });

    // Calculate averages
    Object.keys(stats).forEach(key => {
      const provider = key as 'serp' | 'serpstack';
      if (stats[provider].requests > 0) {
        stats[provider].avgTime = Math.round(stats[provider].totalTime / stats[provider].requests);
      }
      delete stats[provider].totalTime; // Remove intermediate field
    });

    return stats;
  };

  // Load initial data with proper error handling
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check authentication first
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError({
            type: 'no-auth',
            message: 'Please sign in to view SERP monitoring data',
            actionable: true
          });
          setIsLoading(false);
          return;
        }

        // Check if API keys are configured (use metadata view for security)
        const { data: apiKeys, error: apiError } = await supabase
          .from('api_keys_metadata')
          .select('service, is_active')
          .in('service', ['serp', 'serpstack'])
          .eq('is_active', true);

        if (apiError) {
          setError({
            type: 'database-error',
            message: 'Failed to check API key configuration',
            actionable: false
          });
          setIsLoading(false);
          return;
        }

        if (!apiKeys || apiKeys.length === 0) {
          setError({
            type: 'no-api-keys',
            message: 'No SERP API keys configured. Add your API keys in Settings to start monitoring.',
            actionable: true
          });
          setIsLoading(false);
          return;
        }

        // Try to load real monitoring data
        const { data: usageLogs, error: dataError } = await supabase
          .from('serp_usage_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (dataError) {
          setError({
            type: 'database-error',
            message: 'Failed to load monitoring data from database',
            actionable: false
          });
          setIsLoading(false);
          return;
        }

        if (!usageLogs || usageLogs.length === 0) {
          setError({
            type: 'no-data',
            message: 'No SERP monitoring data available yet. Start using SERP APIs to see monitoring data.',
            actionable: false
          });
          setIsLoading(false);
          return;
        }

        // Convert database logs to SerpApiCall format
        const apiCalls: SerpApiCall[] = usageLogs.map(log => {
          const metadata = log.metadata as any || {};
          return {
            id: log.id,
            provider: log.provider as 'serp' | 'serpstack',
            endpoint: log.operation,
            keyword: metadata.keyword || 'Unknown',
            responseTime: metadata.response_time || 0,
            status: log.success ? 'success' : 'error',
            timestamp: new Date(log.created_at),
            error: metadata.error
          };
        });
        
        setRecentCalls(apiCalls);
        await refreshMetrics();
        
      } catch (error) {
        console.error('Error loading SERP monitoring data:', error);
        setError({
          type: 'api-error',
          message: 'An unexpected error occurred while loading monitoring data',
          actionable: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    metrics,
    recentCalls,
    isLoading,
    error,
    logApiCall,
    refreshMetrics
  };
}
