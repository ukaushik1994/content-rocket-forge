
/**
 * Content-related type definitions
 */

export type ContentType = 'blog' | 'article' | 'landing' | 'product' | 'custom' | 'landingPage' | 'productDescription' | 'email' | 'social';
export type ContentFormat = 'markdown' | 'html' | 'rich-text' | 'plain-text';
export type ContentIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  contentType: string;
  metaTitle: string;
  metaDescription: string;
  outline: string[] | any[];
  serpSelections?: any[];
  selectedSolution?: any;
}

export type SearchCountry = {
  name: string;
  code: string;
  region?: string;
};

export interface KeywordUsage {
  keyword: string;
  usageCount: number;
  isPrimary: boolean;
  usedIn: Array<{
    contentId: string;
    contentTitle: string;
    isPrimary: boolean;
    status: string;
  }>;
}

export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { name: 'United States', code: 'us', region: 'North America' },
  { name: 'United Kingdom', code: 'uk', region: 'Europe' },
  { name: 'Canada', code: 'ca', region: 'North America' },
  { name: 'Australia', code: 'au', region: 'Oceania' },
  { name: 'Germany', code: 'de', region: 'Europe' },
  { name: 'France', code: 'fr', region: 'Europe' },
  { name: 'India', code: 'in', region: 'Asia' },
  { name: 'Brazil', code: 'br', region: 'South America' },
  { name: 'Japan', code: 'jp', region: 'Asia' },
  { name: 'Middle East', code: 'mea', region: 'Middle East' },
  { name: 'Global', code: 'global' }
];
