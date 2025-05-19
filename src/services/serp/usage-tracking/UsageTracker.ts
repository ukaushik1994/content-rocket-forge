
/**
 * Usage tracking for SERP API requests
 */
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

export const UsageTracker = {
  trackQuery: (provider: string, queryType: string, keyword: string) => {
    // Get existing stats
    const statsKey = `serp_usage_stats`;
    const statsJson = localStorage.getItem(statsKey) || '{}';
    const stats = JSON.parse(statsJson);
    
    // Update stats
    if (!stats[provider]) {
      stats[provider] = { count: 0, queries: {} };
    }
    
    stats[provider].count = (stats[provider].count || 0) + 1;
    
    if (!stats[provider].queries[queryType]) {
      stats[provider].queries[queryType] = [];
    }
    
    // Add query with timestamp
    stats[provider].queries[queryType].push({
      keyword,
      timestamp: new Date().toISOString()
    });
    
    // Save updated stats
    localStorage.setItem(statsKey, JSON.stringify(stats));
  },
  
  getTotalQueries: (): number => {
    const statsKey = `serp_usage_stats`;
    const statsJson = localStorage.getItem(statsKey) || '{}';
    const stats = JSON.parse(statsJson);
    
    let total = 0;
    Object.keys(stats).forEach(provider => {
      total += stats[provider].count || 0;
    });
    
    return total;
  },
  
  getProviderQueries: (provider: SerpProvider): number => {
    const statsKey = `serp_usage_stats`;
    const statsJson = localStorage.getItem(statsKey) || '{}';
    const stats = JSON.parse(statsJson);
    
    return (stats[provider]?.count || 0);
  }
};
