
// Import the SolutionIntegrationMetrics interface
import { SolutionIntegrationMetrics } from './solution-types';

/**
 * Content Types
 */

// Content Type enum
export enum ContentType {
  BLOG_POST = 'blog_post',
  LANDING_PAGE = 'landing_page',
  PRODUCT_DESCRIPTION = 'product_description',
  ARTICLE = 'article',
  EMAIL = 'email',
  SOCIAL_POST = 'social_post'
}

// Content Format enum
export enum ContentFormat {
  ARTICLE = 'article',
  LISTICLE = 'listicle',
  HOW_TO = 'how_to',
  COMPARISON = 'comparison',
  CASE_STUDY = 'case_study',
  OPINION = 'opinion'
}

// Content Intent enum
export enum ContentIntent {
  INFORM = 'inform',
  CONVERT = 'convert',
  ENTERTAIN = 'entertain',
  EDUCATE = 'educate',
  INSPIRE = 'inspire'
}

// Parameters for saving content
export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  status: 'draft' | 'published';
  notes?: string;
  contentType: string;
  contentFormat?: string;
  contentIntent?: string;
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[];
  serpSelections?: any[];
  serpData?: any;
  seoScore?: number;
  headings?: {
    h1: string[];
    h2: string[];
  };
  solutionInfo?: {
    id: string;
    name: string;
    category?: string;
  } | null;
  solutionMetrics?: SolutionIntegrationMetrics;
}

// Simple content reference
export interface ContentReference {
  id: string;
  title: string;
  status: string;
  created_at: string;
}
