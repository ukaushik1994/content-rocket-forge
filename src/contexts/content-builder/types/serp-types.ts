
// All SERP-related type definitions
export interface SerpItem {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  position: number;
}

export interface SerpQuestion {
  id: string;
  question: string;
  answer?: string;
}

export interface SerpKeyword {
  id: string;
  keyword: string;
  volume?: number;
  difficulty?: number;
}

export interface SerpData {
  query: string;
  keyword: string; // Make keyword required to match SerpAnalysisResult
  results: SerpItem[];
  relatedQuestions?: SerpQuestion[];
  relatedKeywords?: SerpKeyword[];
  insights?: any;
  timestamp?: string;
  // Add compatibility with SerpAnalysisResult
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
  featuredSnippets?: any[];
  entities?: any[];
}

export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string; // Added for compatibility
}

export interface SerpAnalysisState {
  isAnalyzing: boolean;
  isComplete: boolean;
  error: string | null;
}
