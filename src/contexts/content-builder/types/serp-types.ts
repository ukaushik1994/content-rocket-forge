
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
  results: SerpItem[];
  relatedQuestions?: SerpQuestion[];
  relatedKeywords?: SerpKeyword[];
  insights?: any;
  timestamp?: string;
  // Add compatibility with SerpAnalysisResult
  keyword?: string;
  topResults?: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
  }>;
}

export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
}

export interface SerpAnalysisState {
  isAnalyzing: boolean;
  isComplete: boolean;
  error: string | null;
}
