
/**
 * Cache implementation for SERP API results
 */

// Cache for SERP results
const resultCache = new Map<string, any>();

/**
 * Get item from cache
 */
export const getFromCache = (key: string): any | null => {
  if (!resultCache.has(key)) {
    return null;
  }
  
  return resultCache.get(key);
};

/**
 * Save item to cache
 */
export const saveToCache = (key: string, data: any): void => {
  resultCache.set(key, data);
};

/**
 * Clear the SERP cache
 */
export const clearSerpCache = (): void => {
  resultCache.clear();
  console.log('SERP cache cleared');
};
