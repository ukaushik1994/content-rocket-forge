
/**
 * SERP API Service main entry point
 * This file re-exports functionality from the smaller modules
 */

// Export core functionality from SerpCore
import { 
  analyzeSerpKeyword,
  searchSerpKeywords,
  searchRelatedKeywords,
  getActiveProvider,
  setPreferredSerpProvider,
  type SerpApiOptions
} from './core/SerpCore';

// Export these functions and types directly
export { 
  analyzeSerpKeyword,
  searchSerpKeywords,
  searchRelatedKeywords,
  getActiveProvider,
  setPreferredSerpProvider,
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

// Export SerpAnalysisResult type for external use
export type { SerpAnalysisResult } from '@/types/serp';

// Legacy aliases for backward compatibility
export const analyzeKeywordSerp = analyzeSerpKeyword;
export const searchKeywords = searchSerpKeywords;
