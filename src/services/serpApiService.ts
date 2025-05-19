
import { SerpAnalysisResult } from '@/types/serp';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

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
 * This function now returns null instead of mock data
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
  
  // In a real implementation, this would actually call the API
  // For now, we're just returning null to indicate "no data"
  return null;
};
