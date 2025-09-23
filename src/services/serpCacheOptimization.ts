import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  memoryUsage: number;
}

/**
 * Advanced SERP data caching and optimization service
 */
export class SerpCacheOptimization {
  private static cache = new Map<string, CacheEntry>();
  private static stats: CacheStats = {
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    memoryUsage: 0
  };
  private static maxCacheSize = 1000; // Maximum number of entries
  private static defaultTTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Intelligent cache retrieval with priority-based eviction
   */
  static async get(key: string, fetchFunction?: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    // Check memory cache first
    const cachedEntry = this.cache.get(key);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      cachedEntry.accessCount++;
      cachedEntry.lastAccessed = Date.now();
      this.stats.cacheHits++;
      this.updateStats(Date.now() - startTime);
      
      console.log(`🎯 Cache HIT for key: ${key}`);
      return cachedEntry.data;
    }

    // Check database cache if not in memory
    try {
      const { data: dbCache } = await supabase
        .from('raw_serp_data')
        .select('*')
        .eq('keyword', key.replace('serp_', '').replace(/_/g, ' '))
        .gt('expires_at', new Date().toISOString())
        .single();

      if (dbCache && dbCache.serp_response) {
        // Restore to memory cache
        this.set(key, dbCache.serp_response, 'medium');
        this.stats.cacheHits++;
        this.updateStats(Date.now() - startTime);
        
        console.log(`💾 Database cache HIT for key: ${key}`);
        return dbCache.serp_response;
      }
    } catch (error) {
      // Database cache miss, continue to fetch
    }

    // Cache miss - fetch new data if function provided
    if (fetchFunction) {
      this.stats.cacheMisses++;
      
      try {
        console.log(`🔄 Cache MISS - fetching data for key: ${key}`);
        const freshData = await fetchFunction();
        
        // Cache the fresh data with intelligent prioritization
        const priority = this.determinePriority(key, freshData);
        this.set(key, freshData, priority);
        this.saveToDatabaseCache(key, freshData);
        
        this.updateStats(Date.now() - startTime);
        return freshData;
      } catch (error) {
        console.error(`❌ Failed to fetch data for key: ${key}`, error);
        this.updateStats(Date.now() - startTime);
        throw error;
      }
    }

    this.stats.cacheMisses++;
    this.updateStats(Date.now() - startTime);
    return null;
  }

  /**
   * Intelligent cache storage with priority-based eviction
   */
  static set(key: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium', ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.getTTLForPriority(priority));

    // Check if we need to evict entries
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastValuable();
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: now,
      expiresAt,
      priority,
      accessCount: 1,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    this.updateMemoryUsage();
    
    console.log(`💾 Cached data for key: ${key} with priority: ${priority}`);
  }

  /**
   * Save to database for persistent caching
   */
  private static async saveToDatabaseCache(key: string, data: any): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase
        .from('raw_serp_data')
        .upsert({
          keyword: key.replace('serp_', '').replace(/_/g, ' '),
          serp_response: data,
          cached_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          search_engine: 'google',
          total_results: 0
        });
    } catch (error) {
      console.error('Failed to save to database cache:', error);
    }
  }

  /**
   * Intelligent cache eviction based on access patterns and priority
   */
  private static evictLeastValuable(): void {
    if (this.cache.size === 0) return;

    let leastValuable: string | null = null;
    let lowestScore = Infinity;

    // Calculate value score for each entry
    for (const [key, entry] of this.cache.entries()) {
      const now = Date.now();
      const age = now - entry.timestamp;
      const timeSinceAccess = now - entry.lastAccessed;
      
      // Value score calculation (lower = less valuable)
      let score = entry.accessCount * 1000; // Access frequency bonus
      score -= age / 1000; // Age penalty
      score -= timeSinceAccess / 1000; // Recency penalty
      
      // Priority multipliers
      const priorityMultiplier = {
        'high': 3,
        'medium': 2,
        'low': 1
      };
      score *= priorityMultiplier[entry.priority];
      
      if (score < lowestScore) {
        lowestScore = score;
        leastValuable = key;
      }
    }

    if (leastValuable) {
      this.cache.delete(leastValuable);
      console.log(`🗑️ Evicted cache entry: ${leastValuable} (score: ${lowestScore})`);
    }
  }

  /**
   * Determine priority based on data characteristics
   */
  private static determinePriority(key: string, data: any): 'high' | 'medium' | 'low' {
    // High priority for popular keywords or fresh data
    if (data.searchVolume > 10000 || key.includes('trending')) {
      return 'high';
    }
    
    // Medium priority for regular analysis
    if (data.searchVolume > 1000) {
      return 'medium';
    }
    
    // Low priority for long-tail or low-volume keywords
    return 'low';
  }

  /**
   * Get TTL based on priority
   */
  private static getTTLForPriority(priority: 'high' | 'medium' | 'low'): number {
    const ttlMap = {
      'high': 60 * 60 * 1000,    // 1 hour
      'medium': 30 * 60 * 1000,  // 30 minutes
      'low': 15 * 60 * 1000      // 15 minutes
    };
    return ttlMap[priority];
  }

  /**
   * Update performance statistics
   */
  private static updateStats(responseTime: number): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;
    
    // Update average response time (simple moving average)
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * 0.9) + (responseTime * 0.1);
    
    this.updateMemoryUsage();
  }

  /**
   * Update memory usage statistics
   */
  private static updateMemoryUsage(): void {
    let totalMemory = 0;
    for (const entry of this.cache.values()) {
      // Rough estimation of memory usage
      totalMemory += JSON.stringify(entry.data).length;
    }
    this.stats.memoryUsage = Math.round(totalMemory / 1024); // KB
  }

  /**
   * Get cache performance statistics
   */
  static getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear expired entries from cache
   */
  static clearExpired(): number {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Cleared ${removedCount} expired cache entries`);
      this.updateMemoryUsage();
    }
    
    return removedCount;
  }

  /**
   * Preload cache with high-priority data
   */
  static async preloadCache(keywords: string[]): Promise<void> {
    console.log(`🚀 Preloading cache for ${keywords.length} keywords`);
    
    const promises = keywords.map(async (keyword) => {
      const cacheKey = `serp_${keyword.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Check if already cached
      if (this.cache.has(cacheKey)) {
        return;
      }
      
      try {
        // Simulate SERP data fetch (replace with actual API call)
        const mockData = {
          keyword,
          searchVolume: Math.floor(Math.random() * 50000) + 1000,
          difficulty: Math.floor(Math.random() * 100),
          competitors: [],
          cached: true,
          preloaded: true
        };
        
        this.set(cacheKey, mockData, 'high');
        await this.saveToDatabaseCache(cacheKey, mockData);
      } catch (error) {
        console.error(`Failed to preload cache for keyword: ${keyword}`, error);
      }
    });
    
    await Promise.all(promises);
    console.log(`✅ Cache preloading completed`);
  }

  /**
   * Optimize cache based on usage patterns
   */
  static optimizeCache(): void {
    console.log('🔧 Optimizing cache based on usage patterns...');
    
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Promote frequently accessed entries
    for (const [key, entry] of entries) {
      if (entry.accessCount > 10 && entry.priority !== 'high') {
        entry.priority = 'high';
        entry.expiresAt = now + this.getTTLForPriority('high');
        console.log(`⬆️ Promoted ${key} to high priority`);
      }
    }
    
    // Clear expired entries
    this.clearExpired();
    
    // Log optimization results
    const stats = this.getStats();
    toast(`Cache optimized: ${stats.hitRate.toFixed(1)}% hit rate, ${this.cache.size} entries`);
  }

  /**
   * Clear all cache data
   */
  static clearAll(): void {
    this.cache.clear();
    this.stats = {
      hitRate: 0,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0
    };
    console.log('🗑️ Cache cleared completely');
  }
}

// Export convenience functions
export const serpCacheOptimization = {
  get: SerpCacheOptimization.get.bind(SerpCacheOptimization),
  set: SerpCacheOptimization.set.bind(SerpCacheOptimization),
  getStats: SerpCacheOptimization.getStats.bind(SerpCacheOptimization),
  clearExpired: SerpCacheOptimization.clearExpired.bind(SerpCacheOptimization),
  preloadCache: SerpCacheOptimization.preloadCache.bind(SerpCacheOptimization),
  optimizeCache: SerpCacheOptimization.optimizeCache.bind(SerpCacheOptimization),
  clearAll: SerpCacheOptimization.clearAll.bind(SerpCacheOptimization)
};