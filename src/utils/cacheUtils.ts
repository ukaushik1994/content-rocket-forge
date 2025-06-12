
/**
 * Enhanced cache implementation with better invalidation and monitoring
 */
export class SimpleCache<T> {
  private cache: Record<string, { data: T; timestamp: number; keyHash?: string }> = {};
  private readonly defaultExpiry: number;

  constructor(defaultExpiryMs = 3600000) { // Default: 1 hour
    this.defaultExpiry = defaultExpiryMs;
  }

  /**
   * Generate a hash of the API key for cache invalidation
   */
  private hashApiKey(apiKey: string): string {
    // Simple hash function for cache invalidation
    let hash = 0;
    for (let i = 0; i < apiKey.length; i++) {
      const char = apiKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Get item from cache if it exists and is not expired
   */
  get(key: string, currentApiKey?: string): T | null {
    const item = this.cache[key];
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.defaultExpiry) {
      console.log('🗑️ Cache item expired, removing:', key);
      this.delete(key);
      return null;
    }
    
    // Check if API key has changed (for SERP data)
    if (currentApiKey && item.keyHash) {
      const currentKeyHash = this.hashApiKey(currentApiKey);
      if (item.keyHash !== currentKeyHash) {
        console.log('🔄 API key changed, invalidating cache:', key);
        this.delete(key);
        return null;
      }
    }
    
    console.log('💾 Cache hit for:', key);
    return item.data;
  }

  /**
   * Save item to cache with optional API key hash
   */
  set(key: string, data: T, apiKey?: string): void {
    const keyHash = apiKey ? this.hashApiKey(apiKey) : undefined;
    
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      keyHash
    };
    
    console.log('💾 Cached item:', key, keyHash ? 'with key hash' : 'without key hash');
  }

  /**
   * Remove item from cache
   */
  delete(key: string): void {
    delete this.cache[key];
    console.log('🗑️ Removed from cache:', key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const count = Object.keys(this.cache).length;
    this.cache = {};
    console.log('🗑️ Cleared entire cache, removed', count, 'items');
  }

  /**
   * Clear all cache items with a specific key hash (when API key changes)
   */
  clearByApiKey(apiKey: string): void {
    const keyHash = this.hashApiKey(apiKey);
    const keysToDelete: string[] = [];
    
    Object.entries(this.cache).forEach(([key, item]) => {
      if (item.keyHash === keyHash) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.delete(key));
    console.log('🔄 Cleared cache for API key change, removed', keysToDelete.length, 'items');
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; expired: number; fresh: number } {
    const now = Date.now();
    let expired = 0;
    let fresh = 0;
    
    Object.values(this.cache).forEach(item => {
      if (now - item.timestamp > this.defaultExpiry) {
        expired++;
      } else {
        fresh++;
      }
    });
    
    return {
      total: Object.keys(this.cache).length,
      expired,
      fresh
    };
  }
}

// Create enhanced cache instances
export const serpResultsCache = new SimpleCache<any>(60 * 60 * 1000); // 1 hour

// Utility to clear SERP cache when API key changes
export const clearSerpCacheForApiKey = (apiKey: string) => {
  serpResultsCache.clearByApiKey(apiKey);
};

// Utility to get cache stats for debugging
export const getSerpCacheStats = () => {
  return serpResultsCache.getStats();
};
