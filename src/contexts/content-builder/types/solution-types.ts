
/**
 * Solution-related type definitions
 */

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  benefits?: string[];
  category: string;
  type: string;
  isConnected: boolean;
  logoUrl?: string;
  externalUrl?: string;
  resources?: any[];
}

export interface SolutionIntegrationMetrics {
  matchScore: number;
  keywordUsage: number;
  contentRelevance: number;
  potentialImpact: number;
  recommendations: any[];
  overallScore: number;
  featureIncorporation: number;
  positioningScore: number;
  mentionedFeatures: string[];
  keywordMatches: number;
  nameMentions: number;
  painPointsAddressed: number;
  audienceAlignment: number;
}
