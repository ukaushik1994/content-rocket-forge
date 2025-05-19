
// SEO-related type definitions

export interface SeoAnalysis {
  score: number;
  improvements: SeoImprovement[];
  strengths: string[];
}

export interface SeoImprovement {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  applied: boolean;
  type: 'content' | 'keyword' | 'structure' | 'meta';
  suggestedFix?: string;
}

export interface SolutionIntegrationMetrics {
  titleMatchScore: number;
  keywordDensityScore: number;
  headingStructureScore: number;
  readabilityScore: number;
  overallIntegrationScore: number;
  featureIncorporation: number;
  positioningScore: number;
  mentionedFeatures: string[];
  overallScore: number;
}
