
/**
 * SEO related type definitions
 */

export interface SeoImprovement {
  id: string;
  type: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
}

export interface SeoAnalysisResult {
  seoScore: number;
  keywordScore: number;
  readabilityScore: number;
  contentLengthScore: number;
  structureScore: number;
  keywordUsage: KeywordUsage[];
  improvements: SeoImprovement[];
}

export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string;
  prominence?: number;
  qualityScore?: number;
}

export interface SeoOptimizationMetrics {
  originalScore: number;
  currentScore: number;
  appliedImprovements: number;
  totalImprovements: number;
  lastUpdated: Date;
}
