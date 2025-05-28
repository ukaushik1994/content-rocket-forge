
/**
 * Content-related type definitions
 */

export type ContentType = 'article' | 'blog-post' | 'product-description' | 'landing-page' | 'email' | 'social-media';

export type ContentFormat = 'blog-post' | 'how-to-guide' | 'listicle' | 'review' | 'case-study' | 'tutorial' | 'opinion' | 'news' | 'interview' | 'comparison';

export type ContentIntent = 'informational' | 'commercial' | 'navigational' | 'transactional';

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword?: string;
  secondaryKeywords?: string[];
  contentType?: ContentType;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: 'draft' | 'published';
  notes?: string;
  seoScore?: number;
  outline?: any[];
  serpSelections?: any[];
  serpData?: any;
}
