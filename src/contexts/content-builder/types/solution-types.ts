
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
  category: string;
  logoUrl: string | null;
  externalUrl: string | null;
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  benefits?: any[];
  tags?: any[];
  type: string;
  isConnected: boolean;
}

export interface SolutionIntegrationMetrics {
  totalScore: number;
  featuresIncluded: number;
  useCasesAddressed: number;
  painPointsAddressed: number;
  audienceTargeting: number;
  contentQuality: number;
  recommendationCount: number;
  keywordIntegrationScore: number;
}

export type SolutionCategory = 'analytics' | 'seo' | 'content' | 'social' | 'ecommerce' | 'automation' | 'other';
