
/**
 * Content-related type definitions
 */

// Content Type Options
export type ContentType = 'article' | 'blog' | 'landingPage' | 'productDescription' | 'glossary';

// Content Format Options
export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'how-to' | 'list';

// Content Intent Options
export type ContentIntent = 'inform' | 'convert' | 'entertain' | 'educate';

// Save Content Params
export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  contentType: ContentType;
  metaTitle: string | null;
  metaDescription: string | null;
  status: 'draft' | 'published' | 'archived';
  notes: string;
  // Optional fields
  seoScore?: number;
  outlineJson?: string;
  
  // Adding missing properties
  outline?: string[];
  serpSelections?: any[];
  serpData?: any;
}
