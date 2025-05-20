
import { SerpAnalysisResult } from '@/types/serp';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { 
  analyzeSerpKeyword as analyzeSerpKeywordImpl,
  searchSerpKeywords as searchSerpKeywordsImpl,
  getActiveProvider
} from './serp/SerpApiService';

/**
 * Get the preferred SERP provider from local storage or return default
 */
export const getPreferredSerpProvider = (): SerpProvider => {
  const storedProvider = localStorage.getItem('preferred_serp_provider');
  
  if (storedProvider) {
    return storedProvider as SerpProvider;
  }
  
  // Default to SerpAPI if available, otherwise mock
  return localStorage.getItem('serp_api_key') ? 'serpapi' : 'mock';
};

/**
 * Set the preferred SERP provider in local storage
 */
export const setPreferredSerpProvider = (provider: SerpProvider): void => {
  localStorage.setItem('preferred_serp_provider', provider);
};

/**
 * Analyze a keyword and return SERP data
 */
export const analyzeSerpKeyword = async (
  keyword: string, 
  refresh?: boolean
): Promise<SerpAnalysisResult | null> => {
  return analyzeSerpKeywordImpl(keyword, refresh);
};

/**
 * Search for keywords related to a query
 */
export const searchSerpKeywords = async (
  query: string,
  limit: number = 10
): Promise<any[]> => {
  return searchSerpKeywordsImpl(query, limit);
};
