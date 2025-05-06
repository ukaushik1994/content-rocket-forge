
/**
 * Solution related type definitions
 */

export interface SolutionResource {
  title: string;
  url: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  category: string; // Added category property
  logoUrl: string | null;
  externalUrl: string | null;
  resources: SolutionResource[];
}

export interface SolutionIntegrationMetrics {
  featureIncorporation: number;
  positioningScore: number;
  painPointsAddressed: string[];
  ctaEffectiveness: number;
  overallScore: number;
  mentions: number | string;
  audienceAlignment: number;
  nameMentions: number;
  ctaMentions: number;
  mentionedFeatures: string[]; // Added mentionedFeatures property
}
