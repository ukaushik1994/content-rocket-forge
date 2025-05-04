
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
  
  // New fields for enhanced SERP analysis
  entities?: Array<{
    name: string;
    type?: string;
    importance?: number;
  }>;
  headings?: Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    subtext?: string;
  }>;
  contentGaps?: Array<{
    topic: string;
    description: string;
    recommendation?: string;
  }>;
}
