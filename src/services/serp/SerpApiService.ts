
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { SerpCore } from './core/SerpCore';
import { AdapterFactory } from './adapters/AdapterFactory';
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Get the active SERP provider based on available API keys
 */
export const getActiveProvider = (): SerpProvider => {
  const hasSerpapiKey = localStorage.getItem('serp_api_key') !== null;
  
  // If SERP API key exists, use it
  if (hasSerpapiKey) {
    return 'serpapi';
  }
  
  // Default to mock if no API keys exist
  return 'mock';
};

/**
 * Analyze a keyword using the active SERP provider
 */
export const analyzeSerpKeyword = async (
  keyword: string,
  refresh: boolean = false
): Promise<SerpAnalysisResult | null> => {
  try {
    const provider = getPreferredProvider();
    const adapter = AdapterFactory.getAdapter(provider);
    
    const core = new SerpCore(adapter);
    return await core.analyze(keyword, refresh);
  } catch (error: any) {
    console.error('Error in analyzeSerpKeyword:', error);
    return null;
  }
};

/**
 * Search for keywords related to a query
 */
export const searchSerpKeywords = async (
  query: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    const provider = getPreferredProvider();
    const adapter = AdapterFactory.getAdapter(provider);
    
    const core = new SerpCore(adapter);
    return await core.searchKeywords(query, limit);
  } catch (error: any) {
    console.error('Error in searchSerpKeywords:', error);
    return [];
  }
};

/**
 * Get the preferred SERP provider
 */
const getPreferredProvider = (): SerpProvider => {
  // Get the stored preference
  const storedPreference = localStorage.getItem('preferred_serp_provider');
  
  if (storedPreference === 'serpapi' && localStorage.getItem('serp_api_key')) {
    return 'serpapi';
  }
  
  // Fall back to any available provider
  return getActiveProvider();
};
