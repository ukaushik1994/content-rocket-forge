
/**
 * Utility functions for SEO analysis
 */

/**
 * Get appropriate color based on score
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-green-400';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
};

/**
 * Determine impact level of SEO improvement
 */
export const determineImpact = (
  type: string,
  keywordScore: number
): 'high' | 'medium' | 'low' => {
  // Keywords are critical if keyword score is low
  if (type === 'keyword' && keywordScore < 50) {
    return 'high';
  }
  
  // Heading structure issues are generally high impact
  if (type === 'heading') {
    return 'high';
  }
  
  // Content readability and length issues are medium impact
  if (type === 'content' || type === 'readability') {
    return 'medium';
  }
  
  // Default to low impact for other types
  return 'low';
};
