
/**
 * This file previously contained mock data generation functions.
 * Now it returns null to comply with the "Can't find data" requirement.
 */

import { SerpAnalysisResult } from "@/types/serp";

/**
 * Helper function that now returns null instead of generating mock data
 */
export function generateMockSerpData(): null {
  return null;
}

/**
 * Generate mock keyword results that now returns an empty array
 */
export const getMockKeywordResults = (): any[] => {
  return [];
};
