
/**
 * Mock data generation for SERP API
 */

import { SerpAnalysisResult } from "@/types/serp";
import { generateMockSerpData as generateMockSerpDataImpl } from "@/services/serpMockService";

/**
 * Generate mock SERP data
 */
export function generateMockSerpData(keyword: string): SerpAnalysisResult {
  return generateMockSerpDataImpl(keyword);
}

/**
 * Generate mock keyword results 
 */
export const getMockKeywordResults = (keyword: string): any[] => {
  return [
    { keyword: keyword, searchVolume: 5000, difficulty: 45 },
    { keyword: `${keyword} guide`, searchVolume: 3200, difficulty: 30 },
    { keyword: `${keyword} tutorial`, searchVolume: 2800, difficulty: 25 },
    { keyword: `best ${keyword}`, searchVolume: 4500, difficulty: 60 },
    { keyword: `${keyword} examples`, searchVolume: 1800, difficulty: 20 },
  ];
};
