
/**
 * Solution-related type definitions
 */

// Solution Type
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
  resources: SolutionResource[];
}

// Solution Resource Type
export interface SolutionResource {
  id: string;
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'video' | 'case-study' | 'other';
}

// Solution Integration Metrics
export interface SolutionIntegrationMetrics {
  integrationScore: number;
  recommendations: SolutionRecommendation[];
  integrationPoints: number;
  totalPossiblePoints: number;
}

// Solution Recommendation
export interface SolutionRecommendation {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  applied: boolean;
}
