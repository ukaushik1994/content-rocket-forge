
export interface SerpSearchParams {
  query: string;
  country?: string;
  num?: number;
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
    country?: string;  // Added country field
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
  featuredSnippets?: Array<{
    content: string;
    source: string;
    type?: string;
  }>;
  keywords?: string[];
  recommendations?: string[];
  isMockData?: boolean; // Track if the data is mocked
  
  // Enhanced fields for SERP analysis with updated types
  entities?: Array<{
    name: string;
    type?: string;
    importance?: number;
    description?: string; // Added this missing field
  }>;
  headings?: Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    subtext?: string;
    type?: string; // Added this missing field
  }> | string[];
  contentGaps?: Array<{
    topic: string;
    description: string;
    recommendation?: string;
    content?: string; // Added missing field
    opportunity?: string; // Added missing field
    source?: string; // Added missing field
  }>;
  searchCountries?: string[]; // Added the missing searchCountries property
  
  // Add fields for SerpKeywordsTab compatibility
  relatedKeywords?: string[] | Array<{query: string; volume?: number}>;
  volumeData?: Array<{keyword: string; volume?: number}>;
}
