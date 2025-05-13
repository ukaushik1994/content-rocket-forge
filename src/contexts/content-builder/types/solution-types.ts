
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
  totalScore?: number;
  featuresIncluded?: number;
  useCasesAddressed?: number;
  painPointsAddressed?: number;
  audienceTargeting?: number;
  contentQuality?: number;
  recommendationCount?: number;
  keywordIntegrationScore?: number;
  
  // Add missing properties from SolutionIntegrationCard.tsx
  overallScore: number;
  featureIncorporation: number;
  positioningScore: number;
  mentionedFeatures: string[];
  
  // Original properties from analyzeSolutionIntegration.ts
  matchScore: number;
  keywordUsage: number;
  contentRelevance: number;
  potentialImpact: number;
  recommendations: string[];
  nameMentions?: number;
  audienceAlignment?: number;
}

export type SolutionCategory = 'analytics' | 'seo' | 'content' | 'social' | 'ecommerce' | 'automation' | 'other';
