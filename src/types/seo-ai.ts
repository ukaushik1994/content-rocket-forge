
export interface SeoIssue {
  id: string;
  type: 'seo' | 'readability' | 'quality';
  severity: 'high' | 'medium' | 'low';
  message: string;
  evidence?: string;
}

export interface SeoRecommendation {
  id: string;
  action: 'improve_title' | 'rewrite_meta' | 'add_internal_links' | 'fix_headings' | 'improve_readability' | 'expand_topic' | 'add_schema';
  target: 'title' | 'meta' | 'content' | 'links' | 'schema';
  snippet?: string;
  rationale?: string;
  estimatedImpact?: string;
}

export interface SeoMetaProposal {
  title?: string;
  description?: string;
  schema?: string;
}

export interface SeoOpportunities {
  internalLinks?: string[];
  entitiesToAdd?: string[];
  questionsToAnswer?: string[];
}

export interface SeoRisks {
  duplicate?: number; // 0-100
  thinContent?: number; // 0-100
  overOptimization?: number; // 0-100
}

export interface SeoAiResult {
  overallScore: number; // 0-100
  scores: {
    seo: number;
    readability: number;
    quality: number;
  };
  issues: SeoIssue[];
  recommendations: SeoRecommendation[];
  meta: SeoMetaProposal;
  opportunities?: SeoOpportunities;
  risks?: SeoRisks;
}
