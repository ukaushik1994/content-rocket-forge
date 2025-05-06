
/**
 * Type definitions for SEO analysis hooks
 */

export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string;
  prominence?: number;
  qualityScore?: number;
}

export interface ReadabilityMetrics {
  score: number;
  grade: string;
  simpleWords: number;
  complexWords: number;
  avgSentenceLength: number;
  avgWordLength: number;
}

export interface ContentAnalysis {
  seoScore: number;
  keywordUsage: KeywordUsage[];
  readabilityMetrics: ReadabilityMetrics;
  recommendations: string[];
  contentLengthScore: number;
  structureScore: number;
}

export interface UseSeoAnalysisProps {
  content: string;
  mainKeyword: string;
  selectedKeywords: string[];
}

export interface UseSeoAnalysisResult {
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
  analysis: ContentAnalysis | null;
  analyzeContent: () => Promise<void>;
  error: Error | null;
}
