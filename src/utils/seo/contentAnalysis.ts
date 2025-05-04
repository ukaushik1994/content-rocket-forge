
/**
 * Utility functions for content analysis
 */

/**
 * Calculate content length score
 */
export const calculateContentLengthScore = (content: string) => {
  if (!content) return 0;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // Score based on content length
  if (wordCount < 300) return 30;
  if (wordCount >= 300 && wordCount < 600) return 50;
  if (wordCount >= 600 && wordCount < 1200) return 80;
  if (wordCount >= 1200) return 100;
  return 0;
};

/**
 * Calculate readability score
 */
export const calculateReadabilityScore = (content: string) => {
  if (!content) return 0;
  
  // Simple readability calculation based on:
  // - Sentence length (shorter is better)
  // - Word length (shorter is better)
  // - Paragraph length (shorter is better)
  
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const words = content.split(/\s+/).filter(Boolean);
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
  
  // Average sentence length (in words)
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  // Average word length (in characters)
  const avgWordLength = words.join('').length / Math.max(words.length, 1);
  // Average paragraph length (in sentences)
  const avgParagraphLength = sentences.length / Math.max(paragraphs.length, 1);
  
  let readabilityScore = 100;
  
  // Penalize for long sentences (ideal: 15-20 words)
  if (avgSentenceLength > 25) readabilityScore -= 20;
  else if (avgSentenceLength > 20) readabilityScore -= 10;
  else if (avgSentenceLength < 10) readabilityScore -= 5; // Too short can be choppy
  
  // Penalize for long words (ideal: ~5 characters)
  if (avgWordLength > 7) readabilityScore -= 15;
  else if (avgWordLength > 6) readabilityScore -= 5;
  
  // Penalize for long paragraphs (ideal: 3-5 sentences)
  if (avgParagraphLength > 7) readabilityScore -= 15;
  else if (avgParagraphLength > 5) readabilityScore -= 5;
  
  return Math.max(Math.min(readabilityScore, 100), 0);
};

/**
 * Get recommendations for content length and structure
 */
export const getContentRecommendations = (content: string, lengthScore: number, readabilityScore: number) => {
  const recommendations: string[] = [];
  
  // Content length recommendations
  if (lengthScore < 80) {
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
    if (wordCount < 300) {
      recommendations.push('Content is too short. Aim for at least 600 words for better search ranking');
    } else if (wordCount < 600) {
      recommendations.push('Consider expanding your content to at least 600 words for better search ranking');
    }
  }
  
  // Readability recommendations
  if (readabilityScore < 70) {
    const sentences = content?.split(/[.!?]+/).filter(Boolean) || [];
    const avgSentenceLength = sentences.reduce((sum, sent) => sum + sent.split(/\s+/).filter(Boolean).length, 0) / Math.max(sentences.length, 1);
    
    if (avgSentenceLength > 20) {
      recommendations.push('Your sentences are too long. Consider breaking them into shorter, more digestible sentences');
    }
    
    const paragraphs = content?.split(/\n\s*\n/).filter(Boolean) || [];
    if (paragraphs.some(p => p.split(/\s+/).filter(Boolean).length > 100)) {
      recommendations.push('Some paragraphs are too long. Break them into smaller paragraphs for better readability');
    }
  }
  
  return recommendations;
};

/**
 * Get general SEO recommendations
 */
export const getGeneralRecommendations = () => {
  return [
    'Add a compelling meta description that includes your main keyword',
    'Use your main keyword in the title, preferably near the beginning',
    'Add internal links to other relevant content on your site',
    'Add external links to authoritative sources to boost credibility',
    'Use headings (H2, H3) to structure your content and include keywords in them',
  ];
};

/**
 * Generate all recommendations based on analysis scores
 */
export const generateRecommendations = (
  content: string,
  keywordScore: number,
  lengthScore: number,
  readabilityScore: number, 
  keywordUsage: { keyword: string; count: number; density: string }[],
  mainKeyword: string
) => {
  // Get recommendations from different categories
  const keywordRecs = getKeywordRecommendations(keywordUsage, mainKeyword);
  const contentRecs = getContentRecommendations(content, lengthScore, readabilityScore);
  const generalRecs = getGeneralRecommendations();
  
  // Combine all recommendations
  const allRecommendations = [...keywordRecs, ...contentRecs, ...generalRecs];
  
  // Return a maximum of 8 recommendations
  return allRecommendations.slice(0, 8);
};
