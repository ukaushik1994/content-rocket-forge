
/**
 * Advanced utility functions for keyword analysis
 */

import { KeywordUsage } from '@/hooks/seo-analysis/types';

/**
 * Calculate advanced keyword usage in content with proper NLP techniques
 */
export const calculateKeywordUsage = (
  content: string,
  mainKeyword: string,
  selectedKeywords: string[]
): KeywordUsage[] => {
  if (!content || !mainKeyword) return [];
  
  // Get word count for density calculations
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Combined unique keywords list
  const uniqueKeywords = Array.from(new Set([mainKeyword, ...selectedKeywords]))
    .filter(Boolean); // Remove empty strings
  
  // Calculate usage for each keyword
  return uniqueKeywords.map(keyword => {
    // Get exact matches with word boundaries for accurate counting
    const keywordLower = keyword.toLowerCase();
    
    // For multi-word keywords, need to handle differently
    const keywordWords = keywordLower.split(/\s+/);
    let count = 0;
    
    if (keywordWords.length > 1) {
      // For multi-word keywords, count exact phrase matches
      const phraseRegex = new RegExp(`\\b${keywordLower.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const exactMatches = (content.toLowerCase().match(phraseRegex) || []).length;
      
      // Also count close matches (with 1-word gap allowed)
      const keywordPattern = keywordWords.join('[\\s\\w]{0,15}');
      const looserRegex = new RegExp(keywordPattern, 'gi');
      const looseMatches = (content.toLowerCase().match(looserRegex) || []).length;
      
      // Use the exact match count, plus a portion of loose matches that aren't exact
      count = exactMatches + Math.floor((looseMatches - exactMatches) * 0.5);
    } else {
      // For single-word keywords, use word boundary regex
      const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
      count = (content.toLowerCase().match(regex) || []).length;
    }
    
    // Calculate keyword prominence
    const prominence = calculateKeywordProminence(content, keyword);
    
    // Calculate density percentage (rounded to 2 decimal places)
    const density = wordCount > 0
      ? ((count / wordCount) * 100).toFixed(2) + '%'
      : '0.00%';
    
    // Calculate the quality score for this keyword usage
    const qualityScore = calculateKeywordQualityScore(count, wordCount, prominence);
    
    return {
      keyword,
      count,
      density,
      prominence,
      qualityScore
    };
  });
};

/**
 * Calculate keyword prominence (where in the content the keyword appears)
 * Returns score 0-100 - higher means more prominent placement
 */
const calculateKeywordProminence = (content: string, keyword: string): number => {
  const contentLower = content.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  // Check if keyword exists in content
  if (!contentLower.includes(keywordLower)) {
    return 0;
  }
  
  let prominenceScore = 50; // Base score
  
  // Check if keyword is in first paragraph (high prominence)
  const paragraphs = content.split(/\n\n+/);
  if (paragraphs[0]?.toLowerCase().includes(keywordLower)) {
    prominenceScore += 20;
  }
  
  // Check if keyword is in first 100 characters
  if (contentLower.indexOf(keywordLower) < 100) {
    prominenceScore += 15;
  } 
  // Check if keyword is in first quarter of content
  else if (contentLower.indexOf(keywordLower) < content.length / 4) {
    prominenceScore += 10;
  }
  
  // Check if keyword is in headings (approximated by looking for markdown headings)
  const headingsMatch = content.match(/#+\s+[^\n]+|<h[1-6][^>]*>[^<]+<\/h[1-6]>/gi) || [];
  const headings = headingsMatch.map(h => h.toLowerCase());
  
  if (headings.some(h => h.includes(keywordLower))) {
    prominenceScore += 15;
  }
  
  return Math.min(100, prominenceScore);
};

/**
 * Calculate keyword usage score based on density and prominence
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
  
  // Base score on density (optimal range is 1-3%)
  let densityScore = 0;
  if (density < 0.3) densityScore = 30; // Too low
  else if (density < 0.7) densityScore = 50; // Below optimal
  else if (density <= 2.5) densityScore = 100; // Optimal
  else if (density <= 4) densityScore = 70; // Above optimal but acceptable
  else densityScore = 40; // Too high, keyword stuffing
  
  // Factor in prominence
  const prominenceScore = mainKeywordUsage.prominence || 50;
  
  // Calculate final score - weighted average
  const finalScore = Math.round((densityScore * 0.7) + (prominenceScore * 0.3));
  
  return Math.min(100, finalScore);
};

/**
 * Calculate quality score for a keyword's usage in content
 */
const calculateKeywordQualityScore = (count: number, wordCount: number, prominence: number): number => {
  if (count === 0 || wordCount === 0) return 0;
  
  // Calculate density
  const density = (count / wordCount) * 100;
  
  // Base score on density (optimal range is 0.7-2.5%)
  let densityScore = 0;
  if (density < 0.3) densityScore = 30; // Too low
  else if (density < 0.7) densityScore = 60; // Below optimal
  else if (density <= 2.5) densityScore = 100; // Optimal
  else if (density <= 4) densityScore = 70; // Above optimal but acceptable
  else densityScore = 40; // Too high, keyword stuffing
  
  // Factor in prominence - higher prominence improves score
  const prominenceWeight = 0.3;
  const densityWeight = 0.7;
  
  // Calculate final quality score - weighted average
  return Math.round((densityScore * densityWeight) + (prominence * prominenceWeight));
};

/**
 * Get semantic variations of a keyword
 */
export const getKeywordVariations = (keyword: string): string[] => {
  if (!keyword) return [];
  
  const variations: string[] = [keyword];
  const words = keyword.toLowerCase().split(/\s+/);
  
  // For multi-word keywords, create variations with different word order
  if (words.length > 1) {
    // Add singular/plural variations
    if (!keyword.endsWith('s')) {
      variations.push(`${keyword}s`);
    } else if (keyword.endsWith('s')) {
      variations.push(keyword.slice(0, -1));
    }
    
    // For 2-word keywords, add reverse order
    if (words.length === 2) {
      variations.push(`${words[1]} ${words[0]}`);
    }
  }
  
  return variations;
};

/**
 * Calculate overall SEO score based on multiple factors
 */
export const calculateOverallSeoScore = (
  keywordScore: number,
  readabilityScore: number,
  contentLengthScore: number,
  linkScore: number = 60, // Default if not provided
  structureScore: number = 70 // Default if not provided
): number => {
  // Weight each factor appropriately
  const weights = {
    keywordUsage: 0.3,
    readability: 0.2,
    contentLength: 0.2,
    links: 0.15,
    structure: 0.15
  };
  
  // Calculate weighted average
  const weightedScore = 
    (keywordScore * weights.keywordUsage) +
    (readabilityScore * weights.readability) +
    (contentLengthScore * weights.contentLength) +
    (linkScore * weights.links) +
    (structureScore * weights.structure);
  
  return Math.round(weightedScore);
};
