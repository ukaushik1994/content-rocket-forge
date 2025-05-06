
/**
 * Types for SEO analysis
 */

export interface SeoAnalysisScores {
  keywordUsage: number;
  contentLength: number;
  readability: number;
}

export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string;
}

export interface SeoAnalysisState {
  isAnalyzing: boolean;
  keywordUsage: KeywordUsage[];
  recommendations: string[];
  scores: SeoAnalysisScores;
  improvements: any[]; // Using the SeoImprovement type from content-builder/types
  analysisError: string | null;
}

export interface UseSeoAnalysisReturn {
  isAnalyzing: boolean;
  keywordUsage: KeywordUsage[];
  recommendations: string[];
  scores: SeoAnalysisScores;
  improvements: any[];
  analysisError: string | null;
  runSeoAnalysis: () => void;
  getScoreColor: (score: number) => string;
  forceSkipAnalysis: () => void;
}
