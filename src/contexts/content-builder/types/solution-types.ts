
/**
 * Solution-related type definitions
 */

// Solution Type
export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits: string[];
  category: string;
  tags: string[];
  url?: string;
  imageUrl?: string;
  logoUrl?: string | null;
  externalUrl?: string | null;
  useCases?: string[];
  painPoints?: string[];
  targetAudience?: string[];
  resources?: any[];
}

// Solution Integration Metrics
export interface SolutionIntegrationMetrics {
  keywordMatches?: number;
  featureCoverage?: number;
  naturalIntegration?: number;
  overallScore?: number;
  featureIncorporation: number;
  positioningScore: number;
  mentionedFeatures: string[];
  painPointsAddressed: number;
  audienceAlignment: number;
  ctaEffectiveness?: number;
  mentions?: string;
  nameMentions?: number;
  ctaMentions?: number;
}

// Solution Analysis Result
export interface SolutionAnalysisResult {
  solutionMentioned: boolean;
  keywordMatches: number;
  featuresCovered: number;
  naturalIntegration: number;
  recommendations: string[];
}
