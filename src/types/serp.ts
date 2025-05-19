
/**
 * SERP data types
 */

export interface Heading {
  text: string;
  level: string;
  subtext?: string;
  type?: string;
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  keywordDifficulty?: number;
  competitionScore?: number;
  provider: string;
  relatedSearches?: any[];
  questions?: any[];
  topResults?: any[];
  entities?: any[];
  headings?: Heading[];
  contentGaps?: any[];
  keywords?: any[];
  recommendations?: any[];
  timestamp: string;
  peopleAlsoAsk?: any[];
  featuredSnippets?: any[];
}

export interface DataForSeoCredentials {
  login: string;
  password: string;
}

export interface SerpSearchParams {
  query: string;
  limit?: number;
}
