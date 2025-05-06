
/**
 * Content-related type definitions
 */

// Content Type Options
export type ContentType = 'article' | 'blog' | 'landing' | 'product' | 'landingPage' | 'productDescription' | 'email' | 'social';

// Content Format Options
export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'how-to';

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
}
