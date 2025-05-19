
/**
 * SERP data types
 */

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface Heading {
  text: string;
  level: HeadingLevel;
  subtext?: string;
  type?: string;
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  keywordDifficulty?: number;
  competitionScore?: number;
  cpc?: number;  // Added this missing property
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
