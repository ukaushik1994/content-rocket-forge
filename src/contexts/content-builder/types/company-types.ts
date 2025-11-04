
/**
 * Company-related type definitions
 */

export interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  industry: string;
  founded: string;
  size: string;
  mission: string;
  values: string[];
  website: string | null;
  logoUrl: string | null;
}

export interface BrandGuidelines {
  id: string;
  companyId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string | null;
  neutralColor?: string | null;
  fontFamily: string;
  secondaryFontFamily?: string | null;
  tone: string[];
  keywords: string[];
  brandPersonality?: string | null;
  missionStatement?: string | null;
  doUse: string[];
  dontUse: string[];
  logoUsageNotes: string;
  imageryGuidelines?: string | null;
  targetAudience?: string | null;
  brandStory?: string | null;
  brandValues?: string | null;
  brandAssetsUrl: string | null;
}

export interface CompetitorResource {
  title: string;
  url: string;
  category: 'website' | 'social_media' | 'documentation' | 'case_studies' | 'marketing' | 'other';
}

export interface CompanyCompetitor {
  id: string;
  userId: string;
  name: string;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  resources: CompetitorResource[];
  marketPosition?: string | null;
  strengths: string[];
  weaknesses: string[];
  notes?: string | null;
  priorityOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorSolution {
  id: string;
  competitorId: string;
  userId: string;
  name: string;
  category: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  externalUrl: string | null;
  logoUrl: string | null;
  positioning: string | null;
  uniqueValuePropositions: any[];
  keyDifferentiators: any[];
  features: any[];
  useCases: any[];
  painPoints: any[];
  targetAudience: any[];
  benefits: any[];
  pricing: any;
  technicalSpecs: any;
  integrations: any[];
  caseStudies: any[];
  resources: any[];
  tags: any[];
  marketData: any;
  discoverySource: string | null;
  lastAnalyzedAt: string | null;
  metadata?: {
    extraction_status?: string;
    extraction_timestamp?: string;
    extraction_time_ms?: number;
    data_quality?: 'high' | 'medium' | 'low';
    completeness_score?: number;
    confidence_score?: number;
    fields_extracted?: number;
    source_page?: string;
    extraction_error?: string;
  };
  createdAt: string;
  updatedAt: string;
}
