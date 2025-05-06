
/**
 * Utility for analyzing solution integration in content
 */

interface SolutionData {
  name: string;
  features: string[];
}

interface SolutionMetrics {
  featureIncorporation: number;
  positioningScore: number;
  nameMentions: number;
  painPointsAddressed: number;
  audienceAlignment: number;
}

/**
 * Analyze solution integration within the content
 */
export const analyzeSolutionIntegration = (content: string, selectedSolution: SolutionData): SolutionMetrics => {
  const { name, features } = selectedSolution;
  
  // Calculate how many solution features are incorporated
  const featureIncorporation = features.reduce((count, feature) => {
    if (content.toLowerCase().includes(feature.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const featureIncorporationPercentage = (featureIncorporation / features.length) * 100;
  
  // Calculate how well the solution is positioned (e.g., mentioned early, often, and in a positive context)
  let positioningScore = 50;
  
  if (content.toLowerCase().indexOf(name.toLowerCase()) < content.length / 3) {
    positioningScore += 20; // Mentioned early in content
  }
  
  const nameMentions = (content.toLowerCase().match(new RegExp(name.toLowerCase(), 'g')) || []).length;
  if (nameMentions >= 3) {
    positioningScore += 15; // Mentioned multiple times
  }
  
  // Create positive word mapping to check context
  const positiveWords = ['best', 'great', 'excellent', 'solution', 'recommended', 'powerful', 'effective'];
  let positiveContexts = 0;
  
  // Check if solution is mentioned in a positive context
  const sentences = content.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(name.toLowerCase())) {
      for (const word of positiveWords) {
        if (sentence.toLowerCase().includes(word)) {
          positiveContexts++;
          break;
        }
      }
    }
  }
  
  if (positiveContexts >= 2) {
    positioningScore += 15; // Mentioned in positive contexts
  }
  
  // Simple estimate for pain points addressed and audience alignment
  const painPointsAddressed = Math.min(100, Math.round(featureIncorporationPercentage * 1.2));
  const audienceAlignment = Math.min(100, Math.round((positioningScore + featureIncorporationPercentage) / 2));
  
  return {
    featureIncorporation: Math.round(featureIncorporationPercentage),
    positioningScore,
    nameMentions,
    painPointsAddressed,
    audienceAlignment
  };
};
