import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

export interface SolutionIntelRequest {
  userId: string;
  website: string;
  maxPages?: number;
  detectMultiple?: boolean;
  recrawl?: boolean;
}

export interface SolutionIntelDiagnostics {
  used_sitemap: boolean;
  used_serp: boolean;
  pages_fetched: number;
  products_detected: number;
  confidence: number;
  cache_hit?: boolean;
}

export interface SolutionIntelResponse {
  success: boolean;
  multipleDetected?: boolean;
  solutions: Array<Partial<EnhancedSolution>>;
  diagnostics: SolutionIntelDiagnostics;
}

export interface SolutionAutoFillResult {
  solutions: Array<Partial<EnhancedSolution>>;
  multipleDetected: boolean;
  diagnostics: SolutionIntelDiagnostics;
}
