
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
  const activeProvider = getActiveProvider();
  
  // If stored preference exists and has a valid API key, use it
  if (storedProvider) {
    const provider = storedProvider as SerpProvider;
    
    // Check if the preferred provider has an API key
    if (provider === 'mock') return provider;
    if (provider === 'serpapi' && localStorage.getItem('serp_api_key')) return provider;
    if (provider === 'dataforseo' && localStorage.getItem('dataforseo_api_key')) return provider;
  }
  
  // Return the active provider (the one that has an API key) or default to mock
  return activeProvider || 'mock';
};

/**
 * Set the preferred SERP provider in local storage
 */
export const setPreferredSerpProvider = (provider: SerpProvider): void => {
  localStorage.setItem('preferred_serp_provider', provider);
  console.log(`SERP provider set to ${provider}`);
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
    console.warn('No API keys found for SERP providers');
    return null;
  }
  
  try {
    // Forward to the implementation
    return await analyzeSerpKeywordImpl(keyword, refresh);
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return null;
  }
};

/**
 * Search for keywords - implementation forwarded to SerpApiService
 */
export const searchKeywords = async (params: { query: string, limit?: number, refresh?: boolean }) => {
  // Check if we have API keys
  const serpApiKey = localStorage.getItem('serp_api_key');
  const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
  
  // If no API keys, return empty array
  if (!serpApiKey && !dataForSeoKey) {
    console.warn('No API keys found for SERP providers');
    return [];
  }
  
  return searchSerpKeywordsImpl(params.query, params.refresh || false);
};

/**
 * Analyze a keyword and get SERP data for content
 * This is an alias for analyzeSerpKeyword to maintain backwards compatibility
 */
export const analyzeKeywordSerp = analyzeSerpKeyword;

// Re-export the type for backward compatibility
export type { SerpAnalysisResult };
