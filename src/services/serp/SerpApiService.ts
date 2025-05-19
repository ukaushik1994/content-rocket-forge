
/**
 * SERP API Service 
 */

import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { SerpApiAdapter } from './adapters/types';
import { AdapterFactory } from './adapters/AdapterFactory';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpApiError, SerpErrorType } from './error-handling/ErrorTypes';
import { UsageTracker } from './usage-tracking/UsageTracker';

// Cache for SERP results
const resultCache = new Map<string, any>();

/**
 * Get the active SERP provider or use mock if none available
 */
const getActiveProvider = (): SerpProvider => {
  // Check if any API key exists
  const serpApiKey = localStorage.getItem('serp_api_key');
  const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
  
  if (serpApiKey) {
    return 'serpapi';
  } else if (dataForSeoKey) {
    return 'dataforseo';
  }
  
  // Fallback to mock provider
  return 'mock';
};

/**
 * Analyze keyword using the active SERP provider
 */
export const analyzeSerpKeyword = async (keyword: string, refresh: boolean = false): Promise<SerpAnalysisResult> => {
  if (!keyword) {
    throw new SerpApiError({
      type: SerpErrorType.INVALID_KEYWORD,
      message: 'Keyword is required',
      provider: 'unknown',
      timestamp: new Date(),
      recoverable: true
    });
  }
  
  // Check cache first unless refresh is requested
  const cacheKey = `serp_analysis_${keyword}`;
  if (!refresh && resultCache.has(cacheKey)) {
    return resultCache.get(cacheKey);
  }
  
  try {
    const provider = getActiveProvider();
    const adapter = AdapterFactory.getAdapter(provider);
    
    // Create the default result in case of errors
    const defaultResult: SerpAnalysisResult = {
      keyword,
      searchVolume: 0,
      keywordDifficulty: 0,
      competitionScore: 0,
      cpc: 0,
      provider,
      relatedKeywords: [],
      questions: [],
      topResults: [],
      entities: [],
      headings: [],
      snippets: [],
      timestamp: new Date().toISOString(),
    };
    
    // Get actual result from the adapter
    const options = { 
      keyword, 
      refresh
    };
    
    const result = await adapter.analyzeKeyword(options);
    
    // Track usage
    UsageTracker.trackQuery(provider, 'analyze_keyword', keyword);
    
    // Cache the result
    resultCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error analyzing SERP keyword:', error);
    
    if (error instanceof SerpApiError) {
      throw error;
    }
    
    throw new SerpApiError({
      type: SerpErrorType.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'Unknown error analyzing keyword',
      provider: 'unknown',
      timestamp: new Date(),
      recoverable: false,
      details: error
    });
  }
};

/**
 * Search for keywords using the active SERP provider
 */
export const searchSerpKeywords = async (keyword: string, refresh: boolean = false) => {
  if (!keyword) {
    throw new Error('Keyword is required');
  }
  
  const provider = getActiveProvider();
  const adapter = AdapterFactory.getAdapter(provider);
  
  const options = { 
    keyword, 
    refresh, 
    limit: 10
  };
  
  const result = await adapter.searchKeywords(options);
  
  // Track usage
  UsageTracker.trackQuery(provider, 'search_keywords', keyword);
  
  return result;
};

/**
 * Search for related keywords using the active SERP provider
 */
export const searchRelatedKeywords = async (keyword: string, refresh: boolean = false) => {
  if (!keyword) {
    throw new Error('Keyword is required');
  }
  
  const provider = getActiveProvider();
  const adapter = AdapterFactory.getAdapter(provider);
  
  const options = { 
    keyword, 
    refresh, 
    limit: 20
  };
  
  const result = await adapter.searchRelatedKeywords(options);
  
  // Track usage
  UsageTracker.trackQuery(provider, 'search_related', keyword);
  
  return result;
};

/**
 * Clear the SERP cache
 */
export const clearSerpCache = () => {
  resultCache.clear();
  console.log('SERP cache cleared');
};

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
