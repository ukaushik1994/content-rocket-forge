
/**
 * Utility functions for SEO analysis
 */

/**
 * Helper function to determine impact level of improvements
 */
export const determineImpact = (type: string, score: number): 'high' | 'medium' | 'low' => {
  if (type === 'keyword' && score < 50) return 'high';
  if (type === 'readability' && score < 60) return 'high';
  if (score < 50) return 'high';
  if (score < 70) return 'medium';
  return 'low';
};

/**
 * Get score color based on value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'stroke-green-500';
  if (score >= 70) return 'stroke-yellow-500';
  if (score >= 50) return 'stroke-orange-500';
  return 'stroke-red-500';
};
