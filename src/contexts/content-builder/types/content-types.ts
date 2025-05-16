
/**
 * Content-related type definitions for the content builder
 */

export type ContentType = 'article' | 'blog' | 'product' | 'landing' | 'service' | 'landing-page' | 'product-page' | 'email' | 'social';

export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'how-to' | 'review' | 'comparison';

export type ContentIntent = 'inform' | 'convert' | 'entertain' | 'inspire';

export type KeywordUsage = {
  keyword: string;
  count: number;
  density: string;
  isPrimary?: boolean;
  usageCount?: number;
  usedIn?: Array<{
    contentId: string;
    contentTitle: string;
    isPrimary: boolean;
    status: string;
  }>;
};

export type SearchKeywordParams = {
  query: string;
  country?: string;
  language?: string;
  refresh?: boolean;
  limit?: number;
};

export type SearchCountry = 
  'us' | 'gb' | 'ca' | 'au' | 'de' | 
  'fr' | 'es' | 'it' | 'nl' | 'se' | 
  'br' | 'mx' | 'in' | 'jp' | 'sg';

export interface ContentData {
  title: string;
  content: string;
  mainKeyword: string;
  selectedKeywords: string[];
  contentType?: ContentType;
  contentFormat?: ContentFormat;
  contentIntent?: ContentIntent;
  metaTitle?: string;
  metaDescription?: string;
  seoScore?: number;
}

export interface SaveContentParams extends ContentData {
  status: 'draft' | 'published' | 'archived';
  userId?: string;
  solutionInfo?: any;
  secondaryKeywords?: string[];
  outline?: string[] | any[];
  outlineSections?: any[];
  serpSelections?: any[];
  serpData?: any;
}

export const AVAILABLE_COUNTRIES = [
  { id: 'us', name: 'United States' },
  { id: 'uk', name: 'United Kingdom' },
  { id: 'ca', name: 'Canada' },
  { id: 'au', name: 'Australia' },
  { id: 'de', name: 'Germany' },
  { id: 'fr', name: 'France' },
  { id: 'es', name: 'Spain' },
  { id: 'it', name: 'Italy' },
  { id: 'nl', name: 'Netherlands' },
  { id: 'se', name: 'Sweden' },
  { id: 'in', name: 'India' },
  { id: 'jp', name: 'Japan' },
  { id: 'br', name: 'Brazil' },
  { id: 'mx', name: 'Mexico' },
  { id: 'sg', name: 'Singapore' },
  { id: 'mea', name: 'Middle East & Africa' }
];
