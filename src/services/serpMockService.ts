
/**
 * Mock SERP service - DISABLED to prevent data contamination
 * All functions now return null to force proper "No Data Available" handling
 */

import { SerpAnalysisResult } from '@/types/serp';

/**
 * DISABLED: No longer generates mock SERP data to prevent contamination
 */
export const getMockSerpData = (keyword: string): SerpAnalysisResult | null => {
  console.warn('🚫 Mock SERP data generation disabled to prevent contamination');
  console.log('💡 Add your SERP API key in Settings to get real data');
  return null;
};

/**
 * DISABLED: No longer generates mock keyword results
 */
export const getMockKeywordResults = (query: string): any[] => {
  console.warn('🚫 Mock keyword results disabled to prevent contamination');
  console.log('💡 Add your SERP API key in Settings to get real keyword data');
  return [];
};
