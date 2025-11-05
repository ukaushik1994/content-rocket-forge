export interface CompetitorAutoFillPayload {
  // Basic Intelligence
  description: string;
  market_position: string;
  strengths: string[];
  weaknesses: string[];
  resources: Array<{
    title: string;
    url: string;
    category: 'website' | 'social_media' | 'documentation' | 'case_studies' | 'marketing' | 'pricing' | 'features' | 'comparison' | 'other';
    description?: string;
  }>;
  notes: string;
  
  // Company Intelligence
  company_size?: string;
  founded_year?: string;
  headquarters?: string;
  funding_stage?: string;
  employee_count?: string;
  customer_count?: string;
  
  // Product Intelligence
  product_categories?: string[];
  key_features?: string[];
  integrations_count?: number;
  technology_stack?: string[];
  deployment_options?: string[];
  
  // Pricing Intelligence
  pricing_model?: string;
  pricing_tiers?: Array<{
    name: string;
    price?: string;
    features?: string[];
  }>;
  has_free_trial?: boolean;
  has_free_plan?: boolean;
  
  // Target Market
  target_industries?: string[];
  target_company_size?: string[];
  primary_use_cases?: string[];
  ideal_customer_profile?: string;
  
  // Social Proof & Credibility
  notable_customers?: string[];
  case_study_count?: number;
  testimonial_highlights?: string[];
  awards_certifications?: string[];
  partnerships?: string[];
  
  // Competitive Differentiation
  unique_value_propositions?: string[];
  competitive_moats?: string[];
  key_differentiators?: string[];
  
  // Market Insights
  recent_developments?: string[];
  growth_indicators?: string;
  market_sentiment?: string;
}

export interface CompetitorIntelDiagnostics {
  used_sitemap: boolean;
  used_serp: boolean;
  pages_fetched: number;
  pages_skipped: number;
  ai_calls: number;
  cache_hit: boolean;
  
  // Quality Metrics
  completeness_score?: number;
  confidence_score?: number;
  fields_extracted?: number;
  fields_missing?: string[];
  extraction_time_ms?: number;
  pricing_found?: boolean;
  quantitative_data_found?: boolean;
  quality_rating?: 'excellent' | 'good' | 'fair' | 'poor';
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
