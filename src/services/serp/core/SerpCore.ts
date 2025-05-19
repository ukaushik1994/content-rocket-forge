
/**
 * Core SERP API service functionality
 */
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { SerpApiAdapter } from '../adapters/types';
import { AdapterFactory } from '../adapters/AdapterFactory';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpApiError, SerpErrorType } from '../error-handling/ErrorTypes';
import { UsageTracker } from '../usage-tracking/UsageTracker';
import { getFromCache, saveToCache } from '../cache/SerpCache';

// Add interface for SerpApiOptions
export interface SerpApiOptions {
  keyword: string;
  refresh?: boolean;
  provider?: SerpProvider;
  limit?: number;
  location?: string;
  language?: string;
}

/**
 * Get the active SERP provider or use mock if none available
 */
export const getActiveProvider = (): SerpProvider => {
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
export const analyzeSerpKeyword = async (keyword: string, refresh: boolean = false, provider?: SerpProvider): Promise<SerpAnalysisResult> => {
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
  if (!refresh && getFromCache(cacheKey)) {
    return getFromCache(cacheKey);
  }
  
  try {
    const activeProvider = provider || getActiveProvider();
    const adapter = AdapterFactory.getAdapter(activeProvider);
    
    // Create the default result in case of errors
    const defaultResult: SerpAnalysisResult = {
      keyword,
      searchVolume: 0,
      keywordDifficulty: 0,
      competitionScore: 0,
      provider: activeProvider,
      relatedSearches: [],
      questions: [],
      topResults: [],
      entities: [],
      headings: [],
      contentGaps: [],
      keywords: [],
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
    
    // Get actual result from the adapter
    const options: SerpApiOptions = { 
      keyword, 
      refresh,
      provider: activeProvider
    };
    
    const result = await adapter.analyzeKeyword(options);
    
    // Track usage
    UsageTracker.trackQuery(activeProvider, 'analyze_keyword', keyword);
    
    // Cache the result
    saveToCache(cacheKey, result);
    
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
