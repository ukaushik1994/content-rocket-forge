
/**
 * SERP-related type definitions
 */

export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
  metadata?: any;
}

export interface Heading {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtext?: string;
  type?: string;
}

export interface Entity {
  name: string;
  type?: string;
  importance?: number;
  description?: string;
}

export interface ContentGap {
  topic: string;
  description: string;
  recommendation?: string;
  content?: string;
  opportunity?: string;
  source?: string;
}

export interface RelatedSearch {
  query: string;
  volume?: number;
}

export interface PeopleAlsoAskQuestion {
  question: string;
  source: string;
  answer?: string;
}

export interface TopResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}
