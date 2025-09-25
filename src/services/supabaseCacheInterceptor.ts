import { supabase } from '@/integrations/supabase/client';
import { cacheService, CacheConfig } from './cacheService';

interface QueryCacheConfig extends CacheConfig {
  table?: string;
  invalidateOnMutation?: boolean;
  dependencies?: string[];
}

class SupabaseCacheInterceptor {
  private readonly defaultTTL = 300000; // 5 minutes
  private queryCount = 0;
  private cacheHits = 0;

  /**
   * Cached query executor with intelligent invalidation
   */
  async cachedQuery<T>(
    queryBuilder: any,
    config: QueryCacheConfig = {}
  ): Promise<T> {
    const queryKey = this.generateQueryKey(queryBuilder, config);
    const cacheConfig: CacheConfig = {
      ttl: config.ttl || this.defaultTTL,
      namespace: 'supabase',
      ...config
    };

    this.queryCount++;

    // Try to get from cache first
    const cached = await cacheService.get<T>(queryKey, cacheConfig);
    if (cached) {
      this.cacheHits++;
      return cached;
    }

    // Execute query
    const { data, error } = await queryBuilder;
    if (error) {
      throw error;
    }

    // Cache the result
    await cacheService.set(queryKey, data, cacheConfig);

    return data;
  }

  /**
   * Preload common queries into cache
   */
  async preloadCommonQueries(userId: string): Promise<void> {
    const commonQueries = [
      {
        key: `user_profile_${userId}`,
        fetcher: async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (error) throw error;
          return data;
        },
        config: { ttl: 600000, namespace: 'profiles' } // 10 minutes
      },
      {
        key: `user_content_${userId}`,
        fetcher: async () => {
          const { data, error } = await supabase
            .from('content_items')
            .select('id, title, status, created_at')
            .eq('user_id', userId)
            .limit(20);
          if (error) throw error;
          return data;
        },
        config: { ttl: 300000, namespace: 'content' } // 5 minutes
      },
      {
        key: `user_keywords_${userId}`,
        fetcher: async () => {
          const { data, error } = await supabase
            .from('keywords')
            .select('*')
            .eq('user_id', userId)
            .limit(50);
          if (error) throw error;
          return data;
        },
        config: { ttl: 900000, namespace: 'keywords' } // 15 minutes
      }
    ];

    await cacheService.warmCache(commonQueries);
  }

  /**
   * Invalidate cache for specific tables
   */
  async invalidateTable(table: string, userId?: string): Promise<void> {
    const namespace = this.getTableNamespace(table);
    await cacheService.clear(namespace);
    
    if (userId) {
      // Also invalidate user-specific caches
      await cacheService.clear(`${namespace}_${userId}`);
    }
  }

  /**
   * Smart invalidation based on mutations
   */
  async handleMutation(
    operation: 'insert' | 'update' | 'delete',
    table: string,
    data?: any,
    userId?: string
  ): Promise<void> {
    // Always invalidate the main table cache
    await this.invalidateTable(table, userId);

    // Handle cascade invalidations
    const cascadeRules = this.getCascadeRules(table);
    for (const relatedTable of cascadeRules) {
      await this.invalidateTable(relatedTable, userId);
    }

    // Invalidate specific item caches if we have the data
    if (data && data.id) {
      const itemKey = `${table}_${data.id}`;
      await cacheService.delete(itemKey, { namespace: table });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cacheStats = cacheService.getStats();
    return {
      ...cacheStats,
      queryCount: this.queryCount,
      queryCacheHits: this.cacheHits,
      queryCacheRate: this.queryCount > 0 ? (this.cacheHits / this.queryCount) * 100 : 0
    };
  }

  /**
   * Batch cache operations for multiple queries
   */
  async batchCachedQueries(queries: Array<{
    queryBuilder: any;
    config?: QueryCacheConfig;
  }>): Promise<any[]> {
    const results = await Promise.allSettled(
      queries.map(({ queryBuilder, config }) =>
        this.cachedQuery(queryBuilder, config)
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Query ${index} failed:`, result.reason);
        return null;
      }
    });
  }

  /**
   * Cache warming for user session
   */
  async warmUserSession(userId: string): Promise<void> {
    try {
      await this.preloadCommonQueries(userId);
      console.log(`Cache warmed for user ${userId}`);
    } catch (error) {
      console.error('Error warming user cache:', error);
    }
  }

  private generateQueryKey(queryBuilder: any, config: QueryCacheConfig): string {
    // Generate a unique key based on query parameters
    const queryString = JSON.stringify({
      table: config.table || 'unknown',
      // This is a simplified key generation - in a real app, you'd parse the query builder
      timestamp: Math.floor(Date.now() / (config.ttl || this.defaultTTL))
    });
    
    return btoa(queryString).slice(0, 32); // Base64 encoded, truncated
  }

  private getTableNamespace(table: string): string {
    const namespaceMap: Record<string, string> = {
      'content_items': 'content',
      'content_approvals': 'approvals',
      'ai_conversations': 'conversations',
      'ai_messages': 'messages',
      'keywords': 'keywords',
      'profiles': 'profiles',
      'raw_serp_data': 'serp'
    };
    
    return namespaceMap[table] || table;
  }

  private getCascadeRules(table: string): string[] {
    const cascadeMap: Record<string, string[]> = {
      'content_items': ['content_approvals', 'content_analytics', 'content_keywords'],
      'ai_conversations': ['ai_messages'],
      'keywords': ['content_keywords', 'cluster_keywords'],
      'profiles': ['content_items', 'ai_conversations']
    };
    
    return cascadeMap[table] || [];
  }
}

// Create enhanced Supabase client with caching
export const createCachedSupabaseClient = () => {
  const interceptor = new SupabaseCacheInterceptor();
  
  return {
    ...supabase,
    cached: {
      from: (table: string) => ({
        select: (columns = '*') => ({
          eq: (column: string, value: any) => ({
            single: () => interceptor.cachedQuery(
              supabase.from(table as any).select(columns).eq(column, value).single(),
              { table, ttl: 300000 }
            ),
            limit: (count: number) => ({
              execute: () => interceptor.cachedQuery(
                supabase.from(table as any).select(columns).eq(column, value).limit(count),
                { table, ttl: 180000 }
              )
            })
          }),
          limit: (count: number) => ({
            execute: () => interceptor.cachedQuery(
              supabase.from(table as any).select(columns).limit(count),
              { table, ttl: 180000 }
            )
          }),
          execute: () => interceptor.cachedQuery(
            supabase.from(table as any).select(columns),
            { table, ttl: 180000 }
          )
        })
      })
    },
    interceptor
  };
};

export const supabaseCached = createCachedSupabaseClient();