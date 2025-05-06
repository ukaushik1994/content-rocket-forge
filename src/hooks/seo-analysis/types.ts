
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

// SEO analysis operation types
export type AnalysisOperation = 
  | 'start'
  | 'analyze'
  | 'cancel'
  | 'reset'
  | 'apply';
