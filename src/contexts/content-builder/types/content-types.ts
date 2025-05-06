
/**
 * Content type definitions
 */

import { OutlineSection } from './outline-types';

export type ContentType = 'article' | 'blog' | 'landingPage' | 'productPage' | 'custom' | 'productDescription' | 'email' | 'social';
export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'howTo' | 'comparison';
export type ContentIntent = 'inform' | 'convert' | 'educate' | 'entertain' | 'inspire';

// Save Content Parameters
export interface SaveContentParams {
  title: string;
  content: string;
  note?: string;
  isPublished?: boolean;
  mainKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[] | OutlineSection[];
  seoScore?: number;
}
