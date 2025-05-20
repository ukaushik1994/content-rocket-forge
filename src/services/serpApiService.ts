
import { SerpAnalysisResult } from '@/types/serp';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { 
  analyzeSerpKeyword as analyzeSerpKeywordImpl,
  searchSerpKeywords as searchSerpKeywordsImpl,
  getActiveProvider
} from './serp/SerpApiService';

// Variable to cache key existence 
let cachedApiKeyCheck: boolean | null = null;

/**
 * Get the preferred SERP provider from local storage or return default
 */
export const getPreferredSerpProvider = (): SerpProvider => {
  const storedProvider = localStorage.getItem('preferred_serp_provider');
  const activeProvider = getActiveProvider();
  
  // If no active provider exists, return the stored preference or 'serpapi' as default
  if (!activeProvider) {
    return (storedProvider as SerpProvider) || 'serpapi';
  }
  
  // Return the active provider (the one that has an API key)
  return activeProvider;
};

/**
 * Set the preferred SERP provider in local storage
 */
export const setPreferredSerpProvider = (provider: SerpProvider): void => {
  localStorage.setItem('preferred_serp_provider', provider);
  // Clear cached check when changing provider
  cachedApiKeyCheck = null;
};

/**
 * Check if any valid SERP API key exists
 * This can be from any provider
 */
export const hasValidSerpApiKey = (): boolean => {
  // Return cached result if available to prevent repeated checks
  if (cachedApiKeyCheck !== null) {
    return cachedApiKeyCheck;
  }
  
  // Check for SerpApi key
  const serpApiKey = localStorage.getItem('serp_api_key');
  if (serpApiKey && serpApiKey.length > 10) {
    cachedApiKeyCheck = true;
    return true;
  }
  
  // Check for DataForSEO key
  const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
  if (dataForSeoKey && dataForSeoKey.length > 10) {
    cachedApiKeyCheck = true;
    return true;
  }
  
  cachedApiKeyCheck = false;
  return false;
};

/**
 * Clear the cached API key check
 * Call this when API keys change
 */
export const clearCachedApiKeyCheck = (): void => {
  cachedApiKeyCheck = null;
};

/**
 * Enable mock SERP data when no API keys are available
 * This is no longer needed as mock data is handled by the adapter
 */
export const enableMockSerpData = (enable: boolean = true): void => {
  localStorage.setItem('use_mock_serp', enable ? 'true' : 'false');
};

/**
 * Check if mock SERP data is enabled
 */
export const isMockSerpDataEnabled = (): boolean => {
  return localStorage.getItem('use_mock_serp') === 'true';
};

/**
 * Analyze a keyword and return SERP data
 */
export const analyzeSerpKeyword = async (
  keyword: string, 
  refresh?: boolean
): Promise<SerpAnalysisResult | null> => {
  // Make sure the code is using the API key if it exists
  clearCachedApiKeyCheck();
  
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
  // Make sure the code is using the API key if it exists
  clearCachedApiKeyCheck();
  
  return searchSerpKeywordsImpl(params.query, params.refresh || false);
};

/**
 * Analyze a keyword and get SERP data for content
 * This is an alias for analyzeSerpKeyword to maintain backwards compatibility
 */
export const analyzeKeywordSerp = analyzeSerpKeyword;

// Re-export the type for backward compatibility
export type { SerpAnalysisResult };
