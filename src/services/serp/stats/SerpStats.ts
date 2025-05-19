
/**
 * SERP Usage Statistics
 */
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { UsageTracker } from '../usage-tracking/UsageTracker';
import { clearSerpCache as clearCache } from '../cache/SerpCache';

/**
 * Get total SERP usage statistics
 */
export const getTotalUsageStats = (): number => {
  return UsageTracker.getTotalQueries();
};

/**
 * Get provider-specific SERP usage statistics
 */
export const getProviderUsageStats = (provider: SerpProvider): number => {
  return UsageTracker.getProviderQueries(provider);
};

/**
 * Clear the SERP cache
 */
export const clearSerpCache = (): void => {
  clearCache();
};
