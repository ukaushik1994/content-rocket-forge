
/**
 * Type definitions for SEO analysis functionality
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

export interface SeoImprovement {
  id: string;
  type: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
}

export interface UseSeoAnalysisReturn {
  isAnalyzing: boolean;
  keywordUsage: KeywordUsage[];
  recommendations: string[];
  scores: SeoAnalysisScores;
  improvements: SeoImprovement[];
  analysisError: string | null;
  runSeoAnalysis: () => void;
  getScoreColor: (score: number) => string;
  forceSkipAnalysis: () => void;
}

export const ANALYSIS_TIMEOUT = 20000; // 20 seconds
