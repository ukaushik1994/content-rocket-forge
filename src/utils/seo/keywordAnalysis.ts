
/**
 * Utility functions for keyword analysis and density calculation
 */

/**
 * Calculate keyword usage statistics from content
 */
export const calculateKeywordUsage = (content: string, mainKeyword: string, selectedKeywords: string[]) => {
  if (!content || !mainKeyword) return [];
  
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const keywords = [mainKeyword, ...(selectedKeywords || []).filter(k => k !== mainKeyword)];
  
  return keywords.map(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = content.match(regex) || [];
    const count = matches.length;
    const density = ((count / wordCount) * 100).toFixed(1);
    
    return { keyword, count, density: `${density}%` };
  });
};

/**
 * Calculate keyword usage score based on density
 */
export const calculateKeywordUsageScore = (keywordUsage: { keyword: string; count: number; density: string }[], mainKeyword: string) => {
  // Calculate based on keyword presence and density
  const mainKeywordUsage = keywordUsage.find(k => k.keyword === mainKeyword);
  if (!mainKeywordUsage) return 50;
  
  const density = parseFloat(mainKeywordUsage.density);
  
  // Optimal density is around 1-3%
  if (density < 0.5) return 50;
  if (density >= 0.5 && density < 1) return 70;
  if (density >= 1 && density <= 3) return 100;
  if (density > 3 && density <= 5) return 75;
  return 50; // Over 5% is keyword stuffing
};

/**
 * Get recommendations based on keyword usage analysis
 */
export const getKeywordRecommendations = (keywordUsage: { keyword: string; count: number; density: string }[], mainKeyword: string) => {
  const recommendations: string[] = [];
  const mainKeywordUsage = keywordUsage.find(k => k.keyword === mainKeyword);
  
  if (mainKeywordUsage) {
    const density = parseFloat(mainKeywordUsage.density);
    
    if (density < 0.5) {
      recommendations.push(`Increase usage of your main keyword "${mainKeyword}" (current density: ${density}%, aim for 1-2%)`);
    } else if (density > 5) {
      recommendations.push(`Reduce usage of your main keyword "${mainKeyword}" as it appears too frequently (current density: ${density}%, aim for 1-2%)`);
    }
  }
  
  return recommendations;
};
