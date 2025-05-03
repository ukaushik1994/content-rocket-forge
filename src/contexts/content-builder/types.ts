
import { Dispatch } from 'react';
import { SerpAnalysisResult } from '@/services/serpApiService';

export interface ContentBuilderStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

export interface SerpSelection {
  type: string;
  content: string;
  source?: string;
  selected: boolean;
}

export interface ContentBuilderState {
  activeStep: number;
  steps: ContentBuilderStep[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordClusters: {
    [key: string]: string[];
  };
  contentType: string;
  contentFormat: string;
  outline: {
    title: string;
    sections: {
      id: string;
      heading: string;
      content: string;
    }[];
  };
  serpAnalysisResults: SerpAnalysisResult | null;
  serpKeywordsSelected: SerpSelection[];
  serpQuestionsSelected: SerpSelection[];
  isAnalyzing: boolean;
  content: string;
}

export type ContentBuilderAction = 
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'SET_PRIMARY_KEYWORD'; payload: string }
  | { type: 'ADD_SECONDARY_KEYWORD'; payload: string }
  | { type: 'REMOVE_SECONDARY_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORD_CLUSTERS'; payload: { [key: string]: string[] } }
  | { type: 'SET_CONTENT_TYPE'; payload: string }
  | { type: 'SET_CONTENT_FORMAT'; payload: string }
  | { type: 'SET_OUTLINE_TITLE'; payload: string }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: { id: string; heading: string; content: string }[] }
  | { type: 'SET_SERP_ANALYSIS_RESULTS'; payload: SerpAnalysisResult | null }
  | { type: 'SET_SERP_KEYWORDS_SELECTED'; payload: SerpSelection[] }
  | { type: 'SET_SERP_QUESTIONS_SELECTED'; payload: SerpSelection[] }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_CONTENT'; payload: string };

export interface ContentBuilderContextActions {
  navigateToStep: (step: number) => void;
  setPrimaryKeyword: (keyword: string) => void;
  addSecondaryKeyword: (keyword: string) => void;
  removeSecondaryKeyword: (keyword: string) => void;
  setKeywordClusters: (clusters: { [key: string]: string[] }) => void;
  setContentType: (contentType: string) => void;
  setContentFormat: (format: string) => void;
  setOutlineTitle: (title: string) => void;
  setOutlineSections: (sections: { id: string; heading: string; content: string }[]) => void;
  setSerpAnalysisResults: (results: SerpAnalysisResult | null) => void;
  setSerpKeywordsSelected: (keywords: SerpSelection[]) => void;
  setSerpQuestionsSelected: (questions: SerpSelection[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setContent: (content: string) => void;
}

export interface ContentBuilderContextType extends ContentBuilderContextActions {
  state: ContentBuilderState;
  dispatch: Dispatch<ContentBuilderAction>;
}
