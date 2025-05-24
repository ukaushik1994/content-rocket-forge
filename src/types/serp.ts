
export interface SerpSearchParams {
  query: string;
  country?: string;
  num?: number;
}

export interface KnowledgeGraph {
  title: string;
  type: string;
  description: string;
  attributes: Record<string, any>;
  relatedEntities: Array<{
    name: string;
    link?: string;
  }>;
}

export interface FeaturedSnippet {
  type: 'paragraph' | 'list' | 'table';
  content: string;
  source: string;
  title: string;
}

export interface LocalResult {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
}

export interface MultimediaOpportunity {
  type: 'images' | 'videos';
  count: number;
  suggestions: Array<{
    title: string;
    source: string;
  }>;
}

export interface CommercialSignals {
  hasShoppingResults: boolean;
  hasAds: boolean;
  commercialIntent: 'high' | 'medium' | 'low' | 'unknown';
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  topResults?: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
  }>;
  relatedSearches?: Array<{
    query: string;
    volume?: number;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    source: string;
    answer?: string;
  }>;
  featuredSnippets?: FeaturedSnippet[];
  keywords?: string[];
  recommendations?: string[];
  isMockData?: boolean;
  
  // Enhanced fields for SERP analysis with updated types
  entities?: Array<{
    name: string;
    type?: string;
    importance?: number;
    description?: string;
    source?: 'organic_results' | 'knowledge_graph';
  }>;
  headings?: Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    subtext?: string;
    type?: string;
  }>;
  contentGaps?: Array<{
    topic: string;
    description: string;
    recommendation?: string;
    content?: string;
    opportunity?: string;
    source?: string;
  }>;
  
  // New enhanced fields
  knowledgeGraph?: KnowledgeGraph | null;
  localResults?: LocalResult[];
  multimediaOpportunities?: MultimediaOpportunity[];
  commercialSignals?: CommercialSignals;
}
