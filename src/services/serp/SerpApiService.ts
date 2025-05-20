
/**
 * SERP API service - exports from core/SerpCore
 */
export {
  analyzeSerpKeyword,
  searchSerpKeywords,
  searchRelatedKeywords,
  getActiveProvider,
} from './core/SerpCore';

// Export stats functions
export {
  getTotalUsageStats,
  getProviderUsageStats,
  clearSerpCache
} from './stats/SerpStats';

// Export the isAnyProviderAvailable function
export const isAnyProviderAvailable = (): boolean => {
  // Check if any API key exists or mock mode is enabled
  const serpApiKey = localStorage.getItem('serp_api_key');
  const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
  const useMockMode = localStorage.getItem('use_mock_serp') === 'true';
  
  return !!serpApiKey || !!dataForSeoKey || useMockMode;
};
