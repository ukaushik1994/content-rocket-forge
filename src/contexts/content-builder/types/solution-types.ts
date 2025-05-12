
/**
 * Solution-related type definitions
 */

// Solution Type
export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits: string[];
  category: string;
  tags: string[];
  url?: string;
  imageUrl?: string;
  logoUrl?: string;
}

// Solution Integration Metrics
export interface SolutionIntegrationMetrics {
  keywordMatches: number;
  featureCoverage: number;
  naturalIntegration: number;
}

// Solution Analysis Result
export interface SolutionAnalysisResult {
  solutionMentioned: boolean;
  keywordMatches: number;
  featuresCovered: number;
  naturalIntegration: number;
  recommendations: string[];
}
