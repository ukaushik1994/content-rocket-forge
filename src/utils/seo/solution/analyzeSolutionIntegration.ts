
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
export const analyzeSolutionIntegration = (content: string, selectedSolution: SolutionData): any => {
  if (!content || !selectedSolution) {
    return {
      featureIncorporation: 0,
      positioningScore: 0,
      nameMentions: 0,
      painPointsAddressed: 0,
      audienceAlignment: 0,
      mentionedFeatures: []
    };
  }
  
  const { name, features, painPoints = [], targetAudience = [] } = selectedSolution;
  const contentLower = content.toLowerCase();
  
  // Calculate how many solution features are incorporated and track which ones
  const mentionedFeatures: string[] = [];
  features.forEach(feature => {
    // Check for different forms of the feature
    const featureTerms = feature.toLowerCase().split(/\s+/).filter(term => term.length > 3);
    
    // If any of the key terms from the feature are found in the content,
    // consider the feature to be mentioned
    if (featureTerms.some(term => contentLower.includes(term.toLowerCase()))) {
      mentionedFeatures.push(feature);
    }
  });
  
  const featureIncorporation = features.length > 0 ? 
    (mentionedFeatures.length / features.length) * 100 : 0;
  
  // Calculate pain points addressed
  const painPointsAddressed = painPoints.reduce((count, painPoint) => {
    // Get key terms from the pain point
    const painPointTerms = painPoint.toLowerCase().split(/\s+/).filter(term => term.length > 3);
    
    // Check if any of the key terms are present
    if (painPointTerms.some(term => contentLower.includes(term.toLowerCase()))) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const painPointsAddressedPercentage = painPoints.length > 0 ?
    (painPointsAddressed / painPoints.length) * 100 : 0;
    
  // Calculate audience targeting alignment
  const audienceAlignmentCount = targetAudience.reduce((count, audience) => {
    // Get key terms from the target audience
    const audienceTerms = audience.toLowerCase().split(/\s+/).filter(term => term.length > 3);
    
    // Check if any of the key terms are present
    if (audienceTerms.some(term => contentLower.includes(term.toLowerCase()))) {
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
  return {
    featureIncorporation: Math.min(100, Math.round(featureIncorporation)),
    positioningScore: Math.min(100, positioningScore),
    nameMentions,
    painPointsAddressed: Math.min(100, Math.round(painPointsAddressedPercentage)),
    audienceAlignment: Math.min(100, Math.round((positioningScore + audienceAlignmentPercentage) / 2)),
    mentionedFeatures
  };
};
