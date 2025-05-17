
export type ContentType = 'blog' | 'product' | 'landing' | 'case-study' | 'article';
export type ContentFormat = 'article' | 'how-to' | 'faq' | 'newsletter' | 'long-form';
export type ContentIntent = 'inform' | 'convert' | 'entertain' | 'educate';

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  format?: ContentFormat;
  contentType?: ContentType;
  intent?: ContentIntent;
  keywords?: string[];
  secondaryKeywords?: string[];
  outline?: string[];
  metaTitle?: string;
  metaDescription?: string;
  serpSelections?: any[];
  metadata?: string;
  status?: string;
  notes?: string;
  seoScore?: number;
  serpData?: any;
}
