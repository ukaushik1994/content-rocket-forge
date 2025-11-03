export interface CompetitorAutoFillPayload {
  description: string;
  market_position: string;
  strengths: string[];
  weaknesses: string[];
  resources: Array<{
    title: string;
    url: string;
    category: 'website' | 'social_media' | 'documentation' | 'case_studies' | 'marketing' | 'other';
  }>;
  notes: string;
}

export interface CompetitorIntelDiagnostics {
  used_sitemap: boolean;
  used_serp: boolean;
  pages_fetched: number;
  pages_skipped: number;
  ai_calls: number;
  cache_hit: boolean;
}

export interface CompetitorIntelRequest {
  userId: string;
  website: string;
  maxPages?: number;
  recrawl?: boolean;
}

export interface CompetitorIntelResponse {
  success: boolean;
  profile: CompetitorAutoFillPayload | null;
  diagnostics: CompetitorIntelDiagnostics;
}
