
// Extended SERP types

export interface SerpSearchParams {
  keyword: string;
  location?: string;
  language?: string;
  device?: string;
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  competitionScore: number;
  entities: any[];
  peopleAlsoAsk: any[];
  headings: any[];
  contentGaps: any[];
  topResults: any[];
  relatedSearches: any[];
  keywords: string[];
  recommendations: string[];
  isMockData?: boolean;
  provider?: string;
}

export interface DataForSeoCredentials {
  login: string;
  password: string;
}

export interface DataForSeoTaskResult {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: any;
  result: any[];
}

export interface DataForSeoResponse {
  status_code: number;
  status_message: string;
  tasks: DataForSeoTaskResult[];
  version: string;
  time: string;
}
