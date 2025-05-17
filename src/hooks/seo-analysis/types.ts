
/**
 * Type definitions for SEO analysis
 */

export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string;
}

export interface SeoAnalysisScores {
  keywordUsage: number;
  contentLength: number;
  readability: number;
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
