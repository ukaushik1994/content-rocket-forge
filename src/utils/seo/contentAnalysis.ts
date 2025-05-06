
/**
 * Utility functions for content analysis
 */

import { KeywordUsage } from '@/hooks/seo-analysis/types';

/**
 * Calculate content length score
 */
export const calculateContentLengthScore = (content: string): number => {
  if (!content) return 0;
  
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Score based on word count
  if (wordCount < 300) return 30; // Too short
  if (wordCount < 600) return 50; // Short
  if (wordCount < 1000) return 70; // Good
  if (wordCount < 1500) return 85; // Very good
  return 100; // Excellent
};

/**
 * Calculate readability score (simplified Flesch reading ease)
 */
export const calculateReadabilityScore = (content: string): number => {
  if (!content) return 0;
  
  // Split content into sentences and words
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const words = content.split(/\s+/).filter(Boolean);
  
  if (sentences.length === 0 || words.length === 0) return 50;
  
  // Calculate average sentence length
  const avgSentenceLength = words.length / sentences.length;
  
  // Calculate average word length
  const chars = words.join('').length;
  const avgWordLength = chars / words.length;
  
  // Simplified readability calculation
  // Lower sentence length and word length = higher readability
  let readabilityScore = 100;
  
  // Penalize for long sentences
  if (avgSentenceLength > 20) readabilityScore -= 10;
  if (avgSentenceLength > 25) readabilityScore -= 10;
  if (avgSentenceLength > 30) readabilityScore -= 10;
  
  // Penalize for long words
  if (avgWordLength > 5) readabilityScore -= 10;
  if (avgWordLength > 6) readabilityScore -= 10;
  if (avgWordLength > 7) readabilityScore -= 10;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, readabilityScore));
};

/**
 * Generate content improvement recommendations
 */
export const generateRecommendations = (
  content: string,
  keywordScore: number,
  contentLengthScore: number,
  readabilityScore: number,
  keywordUsage: KeywordUsage[],
  mainKeyword: string
): string[] => {
  const recommendations: string[] = [];
  
  // Keyword usage recommendations
  if (keywordScore < 50) {
    const mainKeywordItem = keywordUsage.find(item => 
      item.keyword.toLowerCase() === mainKeyword.toLowerCase()
    );
    
    if (mainKeywordItem) {
      const density = parseFloat(mainKeywordItem.density.replace('%', ''));
      
      if (density < 1) {
        recommendations.push(`Increase main keyword "${mainKeyword}" usage. Current density is ${mainKeywordItem.density}.`);
      } else if (density > 3) {
        recommendations.push(`Reduce main keyword "${mainKeyword}" usage. Current density is ${mainKeywordItem.density}.`);
      }
    } else {
      recommendations.push(`Add main keyword "${mainKeyword}" to your content.`);
    }
  }
  
  // Content length recommendations
  if (contentLengthScore < 70) {
    const words = content.split(/\s+/).filter(Boolean).length;
    if (words < 300) {
      recommendations.push(`Add more content. Current content is too short (${words} words). Aim for at least 600 words.`);
    } else if (words < 600) {
      recommendations.push(`Expand your content. Current length is ${words} words. Aim for at least 1000 words for better SEO.`);
    } else if (words < 1000) {
      recommendations.push(`Consider adding more content. Current length is ${words} words.`);
    }
  }
  
  // Readability recommendations
  if (readabilityScore < 70) {
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const avgSentenceLength = sentences.length > 0 
      ? content.split(/\s+/).filter(Boolean).length / sentences.length 
      : 0;
    
    if (avgSentenceLength > 25) {
      recommendations.push(`Improve readability by using shorter sentences. Average sentence length is ${Math.round(avgSentenceLength)} words.`);
    }
    
    recommendations.push('Break up long paragraphs to improve readability.');
    recommendations.push('Use simpler words for better readability where possible.');
  }
  
  // Heading recommendations
  if (!content.includes('# ') && !content.includes('## ')) {
    recommendations.push('Add headings (starting with # or ##) to structure your content.');
  }
  
  return recommendations;
};
