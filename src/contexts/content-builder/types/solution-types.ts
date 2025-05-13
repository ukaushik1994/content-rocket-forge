
export interface SolutionResource {
  title: string;
  url: string;
  type: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  benefits?: string[];  // Add benefits as an optional property
  category: string;
  type: string;
  isConnected: boolean;
  logoUrl: string;
  externalUrl: string;
  resources: SolutionResource[];
}

export interface SolutionIntegrationMetrics {
  matchScore: number;
  keywordUsage: number;
  contentRelevance: number;
  potentialImpact: number;
  overallScore: number;
  featureIncorporation: number;
  positioningScore: number;
  recommendations: string[];
  keywordMatches: number;
  mentionedFeatures: string[];
  nameMentions: number;
  painPointsAddressed: number;
  audienceAlignment: number;
}
