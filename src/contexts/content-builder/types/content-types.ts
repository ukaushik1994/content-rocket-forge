
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

// Define SearchCountry type for region selection
export type SearchCountry = {
  code: string;
  name: string;
  flag?: string;
};

// Add the AVAILABLE_COUNTRIES export that's being imported in ApprovalSerpSummary.tsx
export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'mea', name: 'Middle East' },
  { code: 'eu', name: 'Europe' },
  { code: 'asia', name: 'Asia' },
  { code: 'global', name: 'Global' }
];
