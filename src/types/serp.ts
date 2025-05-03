
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
  isMockData?: boolean; // Added this property to track if the data is mocked
}
