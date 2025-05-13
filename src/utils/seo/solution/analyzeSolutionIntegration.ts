
/**
 * Utility for analyzing solution integration in content
 */

import { SolutionIntegrationMetrics } from "@/contexts/content-builder/types";

interface SolutionData {
  name: string;
  features: string[];
  painPoints?: string[];
  targetAudience?: string[];
}

/**
 * Analyze solution integration within the content
 */
export const analyzeSolutionIntegration = (content: string, selectedSolution: SolutionData): SolutionIntegrationMetrics => {
  if (!content || !selectedSolution) {
    return {
      matchScore: 0,
      keywordUsage: 0,
      contentRelevance: 0,
      potentialImpact: 0,
      recommendations: [],
      overallScore: 0,
      featureIncorporation: 0,
      positioningScore: 0,
      mentionedFeatures: []
    };
  }
  
  const { name, features, painPoints = [], targetAudience = [] } = selectedSolution;
  const contentLower = content.toLowerCase();
  
  // Calculate how many solution features are incorporated
  const featureIncorporation = features.reduce((count, feature) => {
    if (contentLower.includes(feature.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  // Track which features are mentioned
  const mentionedFeatures = features.filter(feature => 
    contentLower.includes(feature.toLowerCase())
  );
  
  const featureIncorporationPercentage = features.length > 0 ? 
    (featureIncorporation / features.length) * 100 : 0;
  
  // Calculate pain points addressed
  const painPointsAddressed = painPoints.reduce((count, painPoint) => {
    if (contentLower.includes(painPoint.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const painPointsAddressedPercentage = painPoints.length > 0 ?
    (painPointsAddressed / painPoints.length) * 100 : 0;
    
  // Calculate audience targeting alignment
  const audienceAlignmentCount = targetAudience.reduce((count, audience) => {
    if (contentLower.includes(audience.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const audienceAlignmentPercentage = targetAudience.length > 0 ?
    (audienceAlignmentCount / targetAudience.length) * 100 : 0;
  
  // Calculate how well the solution is positioned
  let positioningScore = 50; // Default middle score
  
  // Check if solution is mentioned early in the content
  if (contentLower.indexOf(name.toLowerCase()) < content.length / 3) {
    positioningScore += 20; // Mentioned early in content
  }
  
  // Count name mentions
  const nameMentionMatches = contentLower.match(new RegExp(name.toLowerCase(), 'g'));
  const nameMentions = nameMentionMatches ? nameMentionMatches.length : 0;
  
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
  
  // Calculate overall metrics with caps to ensure values are within 0-100 range
  const overallScore = Math.min(100, Math.round((featureIncorporationPercentage + positioningScore + audienceAlignmentPercentage) / 3));
  
  return {
    matchScore: Math.min(100, Math.round(featureIncorporationPercentage * 0.7 + audienceAlignmentPercentage * 0.3)),
    keywordUsage: nameMentions,
    contentRelevance: Math.min(100, Math.round(painPointsAddressedPercentage * 0.5 + audienceAlignmentPercentage * 0.5)),
    potentialImpact: Math.min(100, Math.round(positioningScore * 0.6 + featureIncorporationPercentage * 0.4)),
    recommendations: [],
    overallScore,
    featureIncorporation: Math.min(100, Math.round(featureIncorporationPercentage)),
    positioningScore: Math.min(100, positioningScore),
    mentionedFeatures,
    nameMentions,
    painPointsAddressed: Math.min(100, Math.round(painPointsAddressedPercentage)),
    audienceAlignment: Math.min(100, Math.round((positioningScore + audienceAlignmentPercentage) / 2))
  };
};
