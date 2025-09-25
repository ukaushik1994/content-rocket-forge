import { useState, useEffect, useCallback } from 'react';
import { cacheService, CacheConfig, CacheStats } from '@/services/cacheService';
import { supabaseCached } from '@/services/supabaseCacheInterceptor';

interface UseAdvancedCacheOptions extends CacheConfig {
  autoRefresh?: boolean;
  refreshInterval?: number;
  dependencies?: any[];
}

interface CacheHookReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => Promise<void>;
  stats: CacheStats;
}

export const useAdvancedCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseAdvancedCacheOptions = {}
): CacheHookReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<CacheStats>(cacheService.getStats());

  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    dependencies = [],
    ...cacheConfig
  } = options;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try cache first
      const cached = await cacheService.get<T>(key, cacheConfig);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      setData(freshData);
      
      // Cache the result
      await cacheService.set(key, freshData, cacheConfig);
      
      // Update stats
      setStats(cacheService.getStats());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cacheConfig]);

  const clearCache = useCallback(async () => {
    await cacheService.delete(key, cacheConfig);
    setStats(cacheService.getStats());
  }, [key, cacheConfig]);

  const refetch = useCallback(async () => {
    await clearCache();
    await fetchData();
  }, [clearCache, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache,
    stats
  };
};

export const useCachedSupabaseQuery = <T>(
  queryKey: string,
  queryBuilder: any,
  options: UseAdvancedCacheOptions = {}
): CacheHookReturn<T> => {
  return useAdvancedCache(
    queryKey,
    async () => {
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
    {
      namespace: 'supabase',
      ttl: 300000, // 5 minutes default
      ...options
    }
  );
};

export const useCacheStats = () => {
  const [stats, setStats] = useState<CacheStats>(cacheService.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheService.getStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const clearAllCache = useCallback(async () => {
    await cacheService.clear();
    setStats(cacheService.getStats());
  }, []);

  const warmCache = useCallback(async (userId: string) => {
    await supabaseCached.interceptor.warmUserSession(userId);
    setStats(cacheService.getStats());
  }, []);

  return {
    stats,
    clearAllCache,
    warmCache,
    supabaseStats: supabaseCached.interceptor.getStats()
  };
};

export const useCacheInvalidation = () => {
  const invalidateTable = useCallback(async (table: string, userId?: string) => {
    await supabaseCached.interceptor.invalidateTable(table, userId);
  }, []);

  const invalidatePattern = useCallback(async (pattern: string) => {
    // Invalidate all cache keys matching a pattern
    await cacheService.clear(pattern);
  }, []);

  const handleMutation = useCallback(async (
    operation: 'insert' | 'update' | 'delete',
    table: string,
    data?: any,
    userId?: string
  ) => {
    await supabaseCached.interceptor.handleMutation(operation, table, data, userId);
  }, []);

  return {
    invalidateTable,
    invalidatePattern,
    handleMutation
  };
};