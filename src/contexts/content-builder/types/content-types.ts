
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
}

export interface KeywordUsage {
  keyword: string;
  count: number;
  density: string;
}

// Available countries for SERP analysis
export const AVAILABLE_COUNTRIES = [
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦' },
  { id: 'au', name: 'Australia', flag: '🇦🇺' },
  { id: 'mea', name: 'Middle East', flag: '🌍' },
  { id: 'global', name: 'Global', flag: '🌐' }
];
