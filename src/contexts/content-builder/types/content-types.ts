
/**
 * Content-related type definitions for the content builder
 */

export type ContentType = 'article' | 'blog' | 'product' | 'landing' | 'service';

export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'how-to' | 'review' | 'comparison';

export type ContentIntent = 'inform' | 'convert' | 'entertain' | 'inspire';

export type KeywordUsage = {
  keyword: string;
  count: number;
  density: string;
};

export type SearchKeywordParams = {
  query: string;
  country?: string;
  language?: string;
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
}
