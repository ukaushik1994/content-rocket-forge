
/**
 * SERP API Service main entry point
 * This file re-exports functionality from the smaller modules
 */

// Export core functionality
export { 
  analyzeSerpKeyword,
  searchSerpKeywords,
  searchRelatedKeywords,
  getActiveProvider,
  type SerpApiOptions
} from './core/SerpCore';

// Export usage statistics functionality
export {
  getTotalUsageStats,
  getProviderUsageStats,
  clearSerpCache
} from './stats/SerpStats';

// Export the UsageTracker for direct access if needed
export { UsageTracker } from './usage-tracking/UsageTracker';

// Re-export cache utilities if needed externally
export { getFromCache, saveToCache } from './cache/SerpCache';
