
/**
 * Utility functions for keyword analysis
 */

import { KeywordUsage } from '@/hooks/seo-analysis/types';

/**
 * Calculate keyword usage in content
 */
export const calculateKeywordUsage = (
  content: string,
  mainKeyword: string,
  selectedKeywords: string[]
): KeywordUsage[] => {
  if (!content) return [];
  
  // Get word count
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Ensure we have the main keyword first, followed by secondary keywords
  const orderedKeywords = [
    mainKeyword,
    ...selectedKeywords.filter(kw => kw !== mainKeyword)
  ].filter(Boolean); // Remove empty strings
  
  // Calculate usage for each keyword
  return orderedKeywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Count occurrences (including partial word matches)
    const regex = new RegExp(keywordLower, 'gi');
    const count = (content.toLowerCase().match(regex) || []).length;
    
    // Calculate density percentage (rounded to 2 decimal places)
    const densityPercent = wordCount > 0
      ? ((count / wordCount) * 100).toFixed(2) + '%'
      : '0.00%';
    
    // Determine if this is the primary keyword
    const isPrimary = keyword === mainKeyword;
    
    // For primary keyword, check if density is within optimal range (0.5% - 3%)
    const densityValue = parseFloat(densityPercent);
    const isOptimalDensity = isPrimary ? (densityValue >= 0.5 && densityValue <= 3) : true;
    
    return {
      keyword,
      count,
      density: densityPercent,
      isPrimary,
      isOptimalDensity
    };
  });
};

/**
 * Calculate keyword usage score based on density
 */
export const calculateKeywordUsageScore = (
  keywordUsage: KeywordUsage[],
  mainKeyword: string
): number => {
  // If no keywords or content, return 0
  if (keywordUsage.length === 0) return 0;
  
  // Find main keyword usage
  const mainKeywordUsage = keywordUsage.find(item => 
    item.keyword.toLowerCase() === mainKeyword.toLowerCase()
  );
  
  // If main keyword not found, penalize the score
  if (!mainKeywordUsage) return 30;
  
  // Get density as number
  const densityStr = mainKeywordUsage.density;
  const density = parseFloat(densityStr);
  
  // Calculate score based on ideal density range (0.5% - 3%)
  if (density < 0.5) return 40; // Too low
  if (density < 1) return 60; // Below optimal
  if (density <= 3) return 100; // Optimal
  if (density <= 5) return 70; // Above optimal but acceptable
  return 40; // Too high, keyword stuffing
};

/**
 * Check if all secondary keywords are present in content
 */
export const checkSecondaryKeywordsPresence = (
  keywordUsage: KeywordUsage[],
  mainKeyword: string
): { allPresent: boolean; missingKeywords: string[] } => {
  // Filter out the main keyword and check which secondary keywords are missing
  const secondaryKeywordUsage = keywordUsage.filter(item => 
    item.keyword.toLowerCase() !== mainKeyword.toLowerCase()
  );
  
  const missingKeywords = secondaryKeywordUsage
    .filter(item => item.count === 0)
    .map(item => item.keyword);
    
  return {
    allPresent: missingKeywords.length === 0,
    missingKeywords
  };
};
