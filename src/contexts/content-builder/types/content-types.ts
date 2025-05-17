
export type ContentType = 'blog' | 'product' | 'landing' | 'case-study';
export type ContentFormat = 'article' | 'how-to' | 'faq' | 'newsletter';
export type ContentIntent = 'inform' | 'convert' | 'entertain' | 'educate';

export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  format?: ContentFormat;
  contentType?: ContentType;
  intent?: ContentIntent;
  keywords?: string[];
  outline?: string[];
  metaTitle?: string;
  metaDescription?: string;
  serpSelections?: any[];
  metadata?: string; // Added missing property
}
