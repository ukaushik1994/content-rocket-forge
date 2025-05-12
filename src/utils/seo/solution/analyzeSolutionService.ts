
import { Solution } from '@/contexts/content-builder/types/solution-types';

/**
 * Analyzes how well a solution is integrated in the content
 */
export const analyzeSolution = (
  content: string,
  solution: Solution
): { score: number; details: any } => {
  // This is a placeholder implementation
  // In a real implementation, this would use NLP to analyze how well the solution is integrated
  
  // Check if solution name is mentioned in content
  const nameMentioned = content.toLowerCase().includes(solution.name.toLowerCase());
  
  // Check if features are mentioned
  const featureMentions = solution.features.filter(feature => 
    content.toLowerCase().includes(feature.toLowerCase())
  );
  
  // Calculate a basic score
  const nameScore = nameMentioned ? 25 : 0;
  const featureScore = Math.min(75, featureMentions.length / solution.features.length * 75);
  const totalScore = nameScore + featureScore;
  
  return {
    score: Math.round(totalScore),
    details: {
      nameMentioned,
      featureMentions,
      featureCoverage: `${Math.round(featureMentions.length / solution.features.length * 100)}%`
    }
  };
};
