
/**
 * SERP API Usage Tracker
 * Tracks API usage for reporting and limits
 */
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

// Usage statistics storage key
const USAGE_STATS_KEY = 'serp_usage_stats';

// Usage tracker interface
interface UsageStats {
  total: number;
  providers: {
    [provider: string]: number;
  };
  queries: {
    [key: string]: number;
  };
}

// Get usage stats from storage
const getUsageStats = (): UsageStats => {
  try {
    const stats = localStorage.getItem(USAGE_STATS_KEY);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (e) {
    console.error('Error loading usage stats:', e);
  }
  
  return {
    total: 0,
    providers: {},
    queries: {}
  };
};

// Save usage stats to storage
const saveUsageStats = (stats: UsageStats): void => {
  try {
    localStorage.setItem(USAGE_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving usage stats:', e);
  }
};

// Export the UsageTracker utility
export const UsageTracker = {
  // Track a query
  trackQuery: (provider: string, queryType: string, keyword: string) => {
    const stats = getUsageStats();
    
    // Increment total counter
    stats.total += 1;
    
    // Increment provider counter
    if (!stats.providers[provider]) {
      stats.providers[provider] = 0;
    }
    stats.providers[provider] += 1;
    
    // Increment query type counter
    const queryKey = `${provider}:${queryType}:${keyword}`;
    if (!stats.queries[queryKey]) {
      stats.queries[queryKey] = 0;
    }
    stats.queries[queryKey] += 1;
    
    // Save updated stats
    saveUsageStats(stats);
  },
  
  // Get total queries made
  getTotalQueries: (): number => {
    const stats = getUsageStats();
    return stats.total;
  },
  
  // Get queries made with a specific provider
  getProviderQueries: (provider: SerpProvider): number => {
    const stats = getUsageStats();
    return stats.providers[provider] || 0;
  }
};
