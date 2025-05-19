
/**
 * Content-related type definitions
 */

export type ContentType = 
  | 'article' 
  | 'blog'
  | 'landing'
  | 'product'
  | 'guide'
  | 'review'
  | 'news'
  | 'other'
  | 'glossary' 
  | 'landingPage'
  | 'productDescription';

export type ContentFormat = 'short-form' | 'long-form' | 'listicle' | 'how-to' | 'comparison' | 'case-study' | 'interview' | 'other';
export type ContentIntent = 'inform' | 'convert' | 'entertain' | 'persuade' | 'educate' | 'inspire' | 'other';

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords?: string[];
  contentType?: ContentType;
  seoScore?: number;
  metaTitle?: string;
  metaDescription?: string;
  outline?: any[];
  serpSelections?: any[];
  serpData?: any;
  status?: string;
  notes?: string; // Add notes field to fix useSaveContent.ts errors
}

export interface ContentGenerationParams {
  outline: any[];
  keywords: string[];
  mainKeyword: string;
  contentType: ContentType;
  contentFormat: ContentFormat;
  wordCount?: number;
  title?: string;
  additionalInstructions?: string;
}

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
  mainKeyword: string;
  volume?: number;
  competition?: number;
}
