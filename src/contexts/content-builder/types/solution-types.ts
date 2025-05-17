
/**
 * Solution related type definitions
 */

export interface SolutionResource {
  title: string;
  url: string;
  id?: string; // Added optional id property
  type?: string; // Added optional type property
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
  featureIncorporation: number; // Added missing properties
  positioningScore: number; // Added missing properties
  painPointsAddressed: string[];
  ctaEffectiveness: number;
  overallScore: number; // Added missing properties
  mentions: number | string;
  audienceAlignment: number;
  nameMentions: number;
  ctaMentions: number;
  mentionedFeatures: string[]; // Added mentionedFeatures property
}
