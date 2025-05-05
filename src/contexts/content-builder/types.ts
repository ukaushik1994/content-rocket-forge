import { SerpAnalysisResult } from '@/types/serp';

export interface ContentBuilderState {
  steps: {
    current: number;
    completed: number[];
  };
  mainKeyword: string;
  searchedKeywords: string[];
  serpData: SerpAnalysisResult | null;
  isAnalyzing: boolean;
  serpSelections: SerpSelection;
  outline: string[];
  content: string;
  title: string;
  isGenerating: boolean;
  serpError: string | null;
  selectedCluster: ContentCluster | null;
  clusters: ContentCluster[];
  keywords: string[];
}

export type ContentBuilderAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  | { type: 'SET_SERP_DATA'; payload: SerpAnalysisResult }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_OUTLINE'; payload: string[] }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_SERP_ERROR'; payload: string | null }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_CLUSTERS'; payload: ContentCluster[] };

export interface SerpSelection {
  keywords: string[];
  peopleAlsoAsk: string[];
  topResults: string[];
  entities: string[];
  headings: string[];
  contentGaps: string[];
  recommendations: string[];
}

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

export const initialContentBuilderState: ContentBuilderState = {
  steps: {
    current: 1,
    completed: [],
  },
  mainKeyword: '',
  searchedKeywords: [],
  serpData: null,
  isAnalyzing: false,
  serpSelections: {
    keywords: [],
    peopleAlsoAsk: [],
    topResults: [],
    entities: [],
    headings: [],
    contentGaps: [],
    recommendations: [],
  },
  outline: [],
  content: '',
  title: '',
  isGenerating: false,
  serpError: null,
  selectedCluster: null,
  clusters: [],
  keywords: [],
};
