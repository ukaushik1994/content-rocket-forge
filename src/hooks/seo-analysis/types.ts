
/**
 * SEO analysis types
 */

// Analysis timeout in milliseconds
export const ANALYSIS_TIMEOUT = 45000;

// Keyword usage metrics
export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string; // Formatted as percentage string with %
}

// Analysis scores for different content aspects
export interface ContentScores {
  keywordUsage: number;
  contentLength: number;
  readability: number;
}

// For backward compatibility with existing code
export interface SeoAnalysisScores {
  keywordUsage: number;
  contentLength: number;
  readability: number;
}

// Return type for the useSeoAnalysis hook
export interface UseSeoAnalysisReturn {
  isAnalyzing: boolean;
  keywordUsage: KeywordUsage[];
  recommendations: string[];
  scores: SeoAnalysisScores;
  improvements: any[]; // Using any[] to match existing implementation
  analysisError: string | null;
  runSeoAnalysis: () => void;
  getScoreColor: (score: number) => string;
  forceSkipAnalysis: () => void;
}

// SEO analysis operation types
export type AnalysisOperation = 
  | 'start'
  | 'analyze'
  | 'cancel'
  | 'reset'
  | 'apply';
