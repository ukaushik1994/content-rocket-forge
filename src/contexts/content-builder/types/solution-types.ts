
/**
 * Solution-related type definitions
 */

// Solution Type
export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits?: string[];
  category: string;
  tags?: string[];
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
  featureIncorporation: number;
  positioningScore: number;
  audienceAlignment: number;
  overall: number;  // Added missing property
  keywordMatches?: number;
  featureCoverage?: number;
  naturalIntegration?: number;
  mentionedFeatures?: string[];
  painPointsAddressed?: string[] | number;
  nameMentions?: number;
  ctaEffectiveness?: number;
  ctaMentions?: number;
  mentions?: string;
  overallScore?: number;
}

// Solution Analysis Result
export interface SolutionAnalysisResult {
  solutionMentioned: boolean;
  keywordMatches: number;
  featuresCovered: number;
  naturalIntegration: number;
  recommendations: string[];
}

