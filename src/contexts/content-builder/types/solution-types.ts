
/**
 * Solution-related type definitions
 */

// Solution Type
export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits?: string[]; // Making this optional
  tags?: string[];     // Making this optional
  category: string;
  url?: string;
  imageUrl?: string;
  logoUrl?: string;
  externalUrl?: string;
  useCases?: string[];
  painPoints?: string[];
  targetAudience?: string[];
  resources?: any[];
}

// Solution Integration Metrics
export interface SolutionIntegrationMetrics {
  keywordMatches: number;
  featureCoverage: number;
  naturalIntegration: number;
  overallScore?: number;
  featureIncorporation?: number;
  positioningScore?: number;
  mentionedFeatures?: string[];
  painPointsAddressed?: string[] | any; // Adding missing property
  ctaEffectiveness?: number;
  audienceAlignment?: number;
  nameMentions?: number;
  ctaMentions?: number;
  mentions?: string;
}

// Solution Analysis Result
export interface SolutionAnalysisResult {
  solutionMentioned: boolean;
  keywordMatches: number;
  featuresCovered: number;
  naturalIntegration: number;
  recommendations: string[];
}
