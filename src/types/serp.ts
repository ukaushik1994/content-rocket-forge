
export interface SerpSearchParams {
  query: string;
  country?: string;
  num?: number;
  limit?: number;
  refresh?: boolean;
}

export interface SearchResult {
  title: string;
  link: string;
  url?: string;
  snippet: string;
  position: number;
  domain?: string;
  featured?: boolean;
  country?: string;
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  searchResults: SearchResult[];
  topResults?: SearchResult[]; // Add this to support existing code
  relatedSearches?: Array<{
    query: string;
    volume?: number;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    source: string;
    answer?: string;
  }>;
  featuredSnippets?: Array<{
    content: string;
    source: string;
    type?: string;
  }>;
  keywords?: string[];
  recommendations?: string[];
  isMockData?: boolean;
  
  // Enhanced fields for SERP analysis with updated types
  entities?: Array<{
    name: string;
    type?: string;
    importance?: number;
    description?: string;
    relevance?: number;
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
  searchFeatures?: any[];
  competitors?: any[];
  statistics?: {
    searchVolume?: number;
    competition?: number;
  };
  searchCountries?: string[];
  timestamp: string;
}
