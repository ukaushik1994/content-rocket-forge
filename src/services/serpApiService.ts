
import { SerpAnalysisResult } from '@/types/serp';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { analyzeSerpKeyword as analyzeSerpKeywordImpl } from './serp/SerpApiService';

/**
 * Get the preferred SERP provider from local storage or return default
 */
export const getPreferredSerpProvider = (): SerpProvider => {
  const storedProvider = localStorage.getItem('preferred_serp_provider');
  return (storedProvider as SerpProvider) || 'serpapi';
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
  // Check if we have API keys
  const serpApiKey = localStorage.getItem('serp_api_key');
  const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
  
  // If no API keys, return null
  if (!serpApiKey && !dataForSeoKey) {
    return null;
  }
  
  // Forward to the implementation
  return analyzeSerpKeywordImpl(keyword, refresh);
};

/**
 * Search for keywords - stub implementation
 */
export const searchKeywords = async (params: { query: string, limit?: number, refresh?: boolean }) => {
  console.log('Search keywords called with:', params);
  // Return empty array for now
  return [];
};

/**
 * Analyze a keyword and get SERP data for content
 * This is an alias for analyzeSerpKeyword to maintain backwards compatibility
 */
export const analyzeKeywordSerp = analyzeSerpKeyword;

// Re-export the type for backward compatibility
export type { SerpAnalysisResult };
