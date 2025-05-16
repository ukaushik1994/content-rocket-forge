
import { SerpSearchParams } from '@/types/serp';

export interface SearchKeywordParams {
  query: string;
  refresh?: boolean;
  countries?: string[];
}

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  topResults?: Array<{
    title: string;
    link: string;
    snippet?: string;
    position: number;
  }>;
  relatedSearches?: Array<{
    query: string;
    volume?: number;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    source?: string;
  }>;
  entities?: Array<{
    name: string;
    type: string;
    importance?: number;
    description?: string;
  }>;
  headings?: Array<{
    text: string;
    level: string;
  }>;
  contentGaps?: Array<{
    topic: string;
    description?: string;
  }>;
  keywords?: string[];
  relatedKeywords?: string[];
  searchCountries?: string[];
  isMockData?: boolean;
}
