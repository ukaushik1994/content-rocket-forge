
/**
 * Content-related type definitions
 */

export type ContentType = 'blog' | 'article' | 'landingPage' | 'productDescription' | 'email' | 'social';
export type ContentFormat = 'longform' | 'shortform' | 'listicle' | 'howto' | 'qa' | 'comparison';
export type ContentIntent = 'inform' | 'convert' | 'engage' | 'entertain' | 'educate' | 'promote';

export interface SearchCountry {
  name: string;
  code: string;
  region?: string;
}

export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { name: 'United States', code: 'us', region: 'North America' },
  { name: 'United Kingdom', code: 'uk', region: 'Europe' },
  { name: 'Australia', code: 'au', region: 'Oceania' },
  { name: 'Canada', code: 'ca', region: 'North America' },
  { name: 'Germany', code: 'de', region: 'Europe' },
  { name: 'France', code: 'fr', region: 'Europe' },
  { name: 'Spain', code: 'es', region: 'Europe' },
  { name: 'Italy', code: 'it', region: 'Europe' },
  { name: 'India', code: 'in', region: 'Asia' },
  { name: 'Japan', code: 'jp', region: 'Asia' },
  { name: 'China', code: 'cn', region: 'Asia' },
  { name: 'Brazil', code: 'br', region: 'South America' },
  { name: 'Mexico', code: 'mx', region: 'North America' },
  { name: 'South Africa', code: 'za', region: 'Africa' },
  { name: 'Singapore', code: 'sg', region: 'Asia' },
  { name: 'United Arab Emirates', code: 'ae', region: 'Middle East' },
  { name: 'Saudi Arabia', code: 'sa', region: 'Middle East' },
  { name: 'Middle East & Africa', code: 'mea', region: 'Region' },
  { name: 'Global', code: 'global', region: 'Region' }
];

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  contentType: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: string;
  note?: string;
  outline?: string[];
  serpSelections?: any[];
  seoScore?: number;
  selectedSolution?: string | null;
}
