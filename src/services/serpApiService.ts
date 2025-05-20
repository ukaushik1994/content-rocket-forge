
/**
 * Re-export from SerpApiService implementation
 */
export { 
  analyzeSerpKeyword,
  searchSerpKeywords,
  searchRelatedKeywords,
  getActiveProvider,
  setPreferredSerpProvider,
  type SerpAnalysisResult,
  type SerpApiOptions,
  analyzeKeywordSerp,    // Legacy export alias
  searchKeywords         // Legacy export alias
} from './serp/SerpApiService';

// Re-export for backward compatibility
export const getPreferredSerpProvider = () => {
  const provider = localStorage.getItem('preferred_serp_provider');
  return provider as 'serpapi' | 'mock' || 'serpapi';
};
