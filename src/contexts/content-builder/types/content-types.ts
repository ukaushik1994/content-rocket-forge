
export type ContentType = 'blog' | 'article' | 'landingPage' | 'productDescription' | 'email' | 'social';

export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'how-to' | 'case-study' | 'review';

export type ContentIntent = 'inform' | 'convince' | 'convert' | 'entertain' | 'educate';

export interface SearchCountry {
  code: string;
  name: string;
}

export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'in', name: 'India' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'za', name: 'South Africa' },
  { code: 'sg', name: 'Singapore' },
  { code: 'ae', name: 'UAE' },
  { code: 'mea', name: 'Middle East & Africa' },
  { code: 'global', name: 'Global' }
];

export interface SaveContentParams {
  title: string;
  content: string;
  keywords?: string[];
  mainKeyword?: string;
  secondaryKeywords?: string[];
  seoScore?: number;
  contentType?: string;
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[] | OutlineSection[];
  status?: string;
  note?: string;
  metadata?: {
    [key: string]: any;
  };
}

