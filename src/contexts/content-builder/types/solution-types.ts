
export interface SolutionResource {
  title: string;
  url: string;
  type?: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  category?: string;
  logoUrl?: string | null;
  externalUrl?: string | null;
  resources?: SolutionResource[];
  type?: string;
  isConnected?: boolean;
}

export interface SolutionIntegrationMetrics {
  totalFeatures?: number;
  totalMentioned?: number;
  overallScore?: number;
  featureIncorporation?: number;
  positioningScore?: number;
  mentionedFeatures?: string[];
  notMentionedFeatures?: string[];
  recommendations?: string[];
}
