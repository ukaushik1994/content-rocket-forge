/**
 * Utility functions for SEO analysis
 */

/**
 * Gets the appropriate color class based on a score
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * Determine impact level based on improvement type and current score
 */
export const determineImpact = (
  improvementType: string, 
  currentScore: number
): 'high' | 'medium' | 'low' => {
  // If score is already high, impact will be lower
  if (currentScore >= 85) return 'low';
  
  // If score is very low, most improvements will be high impact
  if (currentScore <= 40) return 'high';
  
  // Otherwise base it on the type
  switch (improvementType) {
    case 'keyword':
      return currentScore < 60 ? 'high' : 'medium';
    case 'structure':
      return 'medium';
    case 'readability':
      return currentScore < 50 ? 'high' : 'medium';
    default:
      return 'medium';
  }
};
