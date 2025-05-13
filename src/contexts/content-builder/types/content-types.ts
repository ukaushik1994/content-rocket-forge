
/**
 * Content type definitions
 */

export type ContentType = 'blog' | 'article' | 'landing-page' | 'product-description' | 'email' | 'social-post' | string;
export type ContentFormat = 'how-to' | 'list' | 'opinion' | 'review' | 'news' | 'case-study' | string;
export type ContentIntent = 'inform' | 'persuade' | 'entertain' | 'sell' | 'explain' | 'compare' | string;

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  keywords?: string[]; // Adding this field to support existing code
  seoScore?: number; // Adding this field to support existing code
  contentType: string;
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[];
  status?: 'draft' | 'published';
  metadata?: {
    serpSelections?: any[];
    selectedSolution?: string | null;
    serpData?: any; // Added for types
    [key: string]: any;
  };
}
