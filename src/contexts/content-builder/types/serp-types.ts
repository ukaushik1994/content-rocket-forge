
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
  source?: 'organic_results' | 'knowledge_graph';
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

// New enhanced types
export interface KnowledgeGraphData {
  title: string;
  type: string;
  description: string;
  attributes: Record<string, any>;
  relatedEntities: Array<{
    name: string;
    link?: string;
  }>;
}

export interface FeaturedSnippetData {
  type: 'paragraph' | 'list' | 'table';
  content: string;
  source: string;
  title: string;
}

export interface LocalBusinessData {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
}

export interface MultimediaData {
  type: 'images' | 'videos';
  count: number;
  suggestions: Array<{
    title: string;
    source: string;
  }>;
}
