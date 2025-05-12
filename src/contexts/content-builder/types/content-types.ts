
/**
 * Content-related type definitions
 */

// Content Type Options
export enum ContentType {
  BLOG_POST = 'blog',
  ARTICLE = 'article',
  LANDING_PAGE = 'landingPage',
  PRODUCT_DESCRIPTION = 'productDescription',
  EMAIL = 'email',
  SOCIAL = 'social',
  SEO = 'seo'
}

// Content Format Options
export enum ContentFormat {
  ARTICLE = 'long-form',
  SHORT_FORM = 'short-form',
  LISTICLE = 'listicle',
  HOW_TO = 'how-to',
  LIST = 'list'
}

// Content Intent Options
export enum ContentIntent {
  INFORM = 'inform',
  CONVERT = 'convert',
  ENTERTAIN = 'entertain',
  EDUCATE = 'educate'
}

// Save Content Params
export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  contentType: string;
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

// Define SearchCountry type for use in the SERP analysis
export interface SearchCountry {
  code: string;
  name: string;
  flag?: string;
}

// Available countries for SERP analysis
export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'mea', name: 'Middle East', flag: '🌍' },
  { code: 'global', name: 'Global', flag: '🌎' }
];
