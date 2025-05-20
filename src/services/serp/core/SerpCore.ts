
/**
 * SERP API Core Functionality
 */
import { toast } from 'sonner';
import { AdapterFactory } from '../adapters/AdapterFactory';
import { saveToCache, getFromCache } from '../cache/SerpCache';
import { UsageTracker } from '../usage-tracking/UsageTracker';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import type { SerpAnalysisResult } from '@/types/serp';

export interface SerpApiOptions {
  provider?: SerpProvider;
  cache?: boolean;
  refresh?: boolean;
  keyword?: string;
  location?: string;
  language?: string;
  limit?: number;
}

// Get the currently active provider
export const getActiveProvider = (): SerpProvider => {
  const serpApiKey = localStorage.getItem('serp_api_key');
  
  if (serpApiKey) {
    return 'serpapi';
  }
  
  return 'mock';
};

// Set preferred SERP provider
export const setPreferredSerpProvider = (provider: SerpProvider): void => {
  localStorage.setItem('preferred_serp_provider', provider);
};

// Analyze a keyword and get SERP data
export const analyzeSerpKeyword = async (
  keyword: string,
  refresh: boolean = false
): Promise<SerpAnalysisResult | null> => {
  if (!keyword.trim()) {
    console.warn('Empty keyword provided to analyzeSerpKeyword');
    return null;
  }

  // Check cache if refresh is not requested
  if (!refresh) {
    const cachedResult = getFromCache(keyword);
    if (cachedResult) {
      return cachedResult;
    }
  }
  
  try {
    // Get the correct adapter
    const provider = getActiveProvider();
    const adapter = AdapterFactory.getAdapter(provider);

    // Track usage
    UsageTracker.trackQuery(provider, 'analyze_keyword', keyword);

    // Get data from API
    const result = await adapter.analyzeKeyword({ keyword });

    // Save to cache
    saveToCache(keyword, result);

    return result;
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    toast.error('Failed to analyze keyword. Please check your API key and try again.');
    return null;
  }
};

// Search for keywords related to a query
export const searchSerpKeywords = async (
  query: string,
  refresh: boolean = false
): Promise<string[]> => {
  if (!query.trim()) {
    return [];
  }

  // Check cache if refresh is not requested
  if (!refresh) {
    const cacheKey = `search_${query}`;
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult && Array.isArray(cachedResult)) {
      return cachedResult;
    }
  }

  try {
    // Get the correct adapter
    const provider = getActiveProvider();
    const adapter = AdapterFactory.getAdapter(provider);

    // Track usage
    UsageTracker.trackQuery(provider, 'keyword_search', query);

    // Get data from API
    const results = await adapter.searchKeywords({ keyword: query });

    // Save to cache
    const cacheKey = `search_${query}`;
    saveToCache(cacheKey, results);

    return results;
  } catch (error) {
    console.error('Error searching for keywords:', error);
    toast.error('Failed to search keywords. Please check your API key and try again.');
    return [];
  }
};

// Get related keywords for a seed keyword
export const searchRelatedKeywords = async (
  keyword: string,
  refresh: boolean = false
): Promise<string[]> => {
  if (!keyword.trim()) {
    return [];
  }

  // Check cache if refresh is not requested
  if (!refresh) {
    const cacheKey = `related_${keyword}`;
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult && Array.isArray(cachedResult)) {
      return cachedResult;
    }
  }

  try {
    // Get the correct adapter
    const provider = getActiveProvider();
    const adapter = AdapterFactory.getAdapter(provider);

    // Track usage
    UsageTracker.trackQuery(provider, 'related_keywords', keyword);

    // Get data from API
    const results = await adapter.getRelatedKeywords({ keyword });

    // Save to cache
    const cacheKey = `related_${keyword}`;
    saveToCache(cacheKey, results);

    return results;
  } catch (error) {
    console.error('Error getting related keywords:', error);
    toast.error('Failed to get related keywords. Please check your API key and try again.');
    return [];
  }
};

