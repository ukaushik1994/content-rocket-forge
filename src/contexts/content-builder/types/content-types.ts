
/**
 * Content-related type definitions
 */

// Content Type Enum
export enum ContentType {
  BLOG_POST = 'blog-post',
  ARTICLE = 'article',
  LANDING_PAGE = 'landing-page',
  PRODUCT_PAGE = 'product-page',
  EMAIL = 'email',
  SOCIAL_POST = 'social-post'
}

// Content Format Enum
export enum ContentFormat {
  ARTICLE = 'article',
  LISTICLE = 'listicle',
  HOW_TO = 'how-to',
  COMPARISON = 'comparison',
  CASE_STUDY = 'case-study',
  INTERVIEW = 'interview'
}

// Content Intent Enum
export enum ContentIntent {
  INFORM = 'inform',
  PERSUADE = 'persuade',
  ENTERTAIN = 'entertain',
  CONVERT = 'convert'
}

// Save Content Params
export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword?: string;
  secondaryKeywords?: string[];
  seoScore?: number;
  outlineSections?: any[];
  note?: string;
}

// Search Countries
export enum SearchCountry {
  US = 'us',
  UK = 'uk',
  AU = 'au',
  CA = 'ca',
  IN = 'in',
  DE = 'de',
  FR = 'fr',
  ES = 'es',
  IT = 'it',
  JP = 'jp',
  BR = 'br',
  MEA = 'mea',
  GLOBAL = 'global'
}

// Available Countries for Search
export const AVAILABLE_COUNTRIES = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  { code: 'in', name: 'India' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'br', name: 'Brazil' },
  { code: 'mea', name: 'Middle East' },
  { code: 'global', name: 'Global' }
];

// Keyword Usage Type
export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string; // percentage as string e.g. "1.5%"
}
