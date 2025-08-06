
/**
 * Content-related type definitions
 */

// Content Type Options - synced with template formats
export type ContentType = 'blog' | 'social-twitter' | 'social-linkedin' | 'social-facebook' | 'social-instagram' | 'script' | 'email' | 'glossary' | 'meme' | 'carousel';

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
