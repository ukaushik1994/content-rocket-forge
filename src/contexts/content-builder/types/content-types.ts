
export type ContentType = 'blog' | 'article' | 'landingPage' | 'productDescription' | 'email' | 'social';

export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'how-to' | 'case-study' | 'review';

export type ContentIntent = 'inform' | 'convince' | 'convert' | 'entertain' | 'educate';

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
