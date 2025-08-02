
/**
 * Mock SERP service - FULLY DISABLED
 * All mock data generation removed to force real API integration
 */

import { SerpAnalysisResult } from '@/types/serp';

/**
 * REMOVED: Mock SERP data generation completely eliminated
 */
export const getMockSerpData = (keyword: string): null => {
  console.error('🚫 Mock SERP data completely disabled');
  console.error('🔑 SERP API key required in Settings for data analysis');
  return null;
};

/**
 * REMOVED: Mock keyword results completely eliminated  
 */
export const getMockKeywordResults = (query: string): never[] => {
  console.error('🚫 Mock keyword data completely disabled');
  console.error('🔑 SERP API key required in Settings for keyword research');
  return [];
};
