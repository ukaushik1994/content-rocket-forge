
/**
 * Solution-related type definitions
 */

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  type: string;
  isConnected: boolean;
  
  // Extended fields
  useCases?: string[];
  painPoints?: string[];
  targetAudience?: string[];
  category?: string;
  logoUrl?: string | null;
  externalUrl?: string | null;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  benefits?: any[];
  tags?: any[];
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
  keywordMatches?: number;
  mentionedFeatures?: string[];
  nameMentions?: number;
}
