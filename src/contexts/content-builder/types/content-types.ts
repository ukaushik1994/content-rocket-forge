
/**
 * Content type definitions
 */

export type ContentType = 
  | 'blog'
  | 'article'
  | 'landing-page'
  | 'product-page'
  | 'guide'
  | 'review'
  | 'comparison'
  | 'info-page'
  | 'email'
  | 'social'
  | 'custom';

export type ContentFormat =
  | 'long-form'
  | 'short-form'
  | 'listicle'
  | 'how-to'
  | 'news'
  | 'opinion'
  | 'tutorial'
  | 'custom';

export type ContentIntent =
  | 'inform'
  | 'educate'
  | 'entertain'
  | 'convert'
  | 'engage'
  | 'persuade'
  | 'custom';

export interface SaveContentParams {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  contentType?: ContentType;
  seoScore?: number;
  isPublished?: boolean;
  customFields?: Record<string, any>;
  mainKeyword?: string;
  secondaryKeywords?: string[];
  outline?: string[];
  outlineSections?: any[];
  serpSelections?: any[];
  serpData?: any;
}

export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string;
  isPrimary?: boolean;
  usageCount?: number;
  usedIn?: string[];
}

// Search country type for SERP analysis
export interface SearchCountry {
  id: string;
  code: string;
  name: string;
  flag: string;
}

// Available countries for SERP analysis
export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { id: 'us', code: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'uk', code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'ca', code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { id: 'au', code: 'au', name: 'Australia', flag: '🇦🇺' },
  { id: 'mea', code: 'mea', name: 'Middle East', flag: '🌍' },
  { id: 'global', code: 'global', name: 'Global', flag: '🌐' }
];
