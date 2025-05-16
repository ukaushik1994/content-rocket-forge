
import { SerpSearchParams } from '@/types/serp';

export interface SearchKeywordParams {
  query: string;
  refresh?: boolean;
  countries?: string[];
}

// Updated to match the types expected by components
export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  topResults?: Array<{
    title: string;
    link: string;
    snippet: string; // Changed from optional to required
    position: number;
    country?: string; // Added country field to match src/types/serp.ts
  }>;
  relatedSearches?: Array<{
    query: string;
    volume?: number;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    source: string; // Changed from optional to required
    answer?: string; // Added answer field to match src/types/serp.ts
  }>;
  entities?: Array<{
    name: string;
    type: string;
    importance?: number;
    description?: string;
  }>;
  headings?: Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Changed from string to specific union type
    subtext?: string;
    type?: string;
  }>;
  contentGaps?: Array<{
    topic: string;
    description?: string;
  }>;
  keywords?: string[];
  relatedKeywords?: string[];
  searchCountries?: string[];
  isMockData?: boolean;
  featuredSnippets?: Array<{
    content: string;
    source: string;
    type?: string;
  }>;
  recommendations?: string[];
  volumeData?: Array<{
    keyword: string;
    volume?: number;
  }>;
}
