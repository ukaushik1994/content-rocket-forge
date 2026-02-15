import { EnhancedOffering } from '@/contexts/content-builder/types/enhanced-offering-types';

export interface OfferingIntelRequest {
  userId: string;
  website: string;
  maxPages?: number;
  detectMultiple?: boolean;
  recrawl?: boolean;
}

export interface OfferingIntelDiagnostics {
  used_sitemap: boolean;
  used_serp: boolean;
  pages_fetched: number;
  products_detected: number;
  confidence: number;
  cache_hit?: boolean;
}

export interface OfferingIntelResponse {
  success: boolean;
  multipleDetected?: boolean;
  solutions: Array<Partial<EnhancedOffering>>;
  diagnostics: OfferingIntelDiagnostics;
}

export interface OfferingAutoFillResult {
  solutions: Array<Partial<EnhancedOffering>>;
  multipleDetected: boolean;
  diagnostics: OfferingIntelDiagnostics;
}

// Backward-compatible aliases
export type SolutionIntelRequest = OfferingIntelRequest;
export type SolutionIntelDiagnostics = OfferingIntelDiagnostics;
export type SolutionIntelResponse = OfferingIntelResponse;
export type SolutionAutoFillResult = OfferingAutoFillResult;
