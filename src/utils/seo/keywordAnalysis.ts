
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
  if (!content || !content.trim()) return [];
  
  // Get word count - filter empty strings and handle edge cases
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 0); // Remove empty strings
  const wordCount = words.length;
  
  // Combined unique keywords list
  const uniqueKeywords = Array.from(new Set([mainKeyword, ...selectedKeywords]))
    .filter(Boolean) // Remove empty strings
    .filter(keyword => keyword.trim().length > 0); // Remove whitespace-only strings
  
  if (uniqueKeywords.length === 0) return [];
  
  // Calculate usage for each keyword
  return uniqueKeywords.map(keyword => {
    const keywordLower = keyword.toLowerCase().trim();
    
    // Count occurrences with more precise matching
    const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    const matches = content.toLowerCase().match(regex);
    const count = matches ? matches.length : 0;
    
    // Calculate density percentage (rounded to 2 decimal places)
    const densityPercent = wordCount > 0
      ? ((count / wordCount) * 100).toFixed(2) + '%'
      : '0.00%';
    
    return {
      keyword,
      count,
      density: densityPercent
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
  const density = parseFloat(densityStr.replace('%', ''));
  
  // Calculate score based on ideal density range (1% - 3%)
  if (density < 0.5) return 40; // Too low
  if (density < 1) return 60; // Below optimal
  if (density <= 3) return 100; // Optimal
  if (density <= 5) return 70; // Above optimal but acceptable
  return 40; // Too high, keyword stuffing
};
