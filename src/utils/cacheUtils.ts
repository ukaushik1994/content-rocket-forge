
/**
 * Simple cache implementation with expiry
 */
export class SimpleCache<T> {
  private cache: Record<string, { data: T; timestamp: number }> = {};
  private readonly defaultExpiry: number;

  constructor(defaultExpiryMs = 3600000) { // Default: 1 hour
    this.defaultExpiry = defaultExpiryMs;
  }

  /**
   * Get item from cache if it exists and is not expired
   */
  get(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.defaultExpiry) {
      // Item is expired, remove it
      this.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set item to cache
   */
  set(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  /**
   * Remove item from cache
   */
  delete(key: string): void {
    delete this.cache[key];
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache = {};
  }
}

// Create cache instances
export const serpResultsCache = new SimpleCache<any>(60 * 60 * 1000); // 1 hour

/**
 * Helper function to simulate API delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
