
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

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features?: string[];
}

export interface ContentOutlineSection {
  id: string;
  title: string;
  subsections?: ContentOutlineSection[];
}

export interface ContentBuilderState {
  activeStep: number;
  steps: ContentBuilderStep[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordClusters: {
    [key: string]: string[];
  };
  contentType: string | null;
  contentFormat: string;
  outline: ContentOutlineSection[];
  serpAnalysisResults: SerpAnalysisResult | null;
  serpKeywordsSelected: SerpSelection[];
  serpQuestionsSelected: SerpSelection[];
  isAnalyzing: boolean;
  content: string;
  
  // Additional properties used in the components
  mainKeyword: string;
  selectedKeywords: string[];
  selectedCluster: ContentCluster | null;
  serpData: any;
  serpSelections: SerpSelection[];
  selectedSolution: Solution | null;
  contentTitle: string;
  seoScore: number;
  additionalInstructions: string;
}

export type ContentType = 
  | 'blog' 
  | 'landingPage' 
  | 'productDescription' 
  | 'article' 
  | 'email' 
  | 'social';

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
  | { type: 'SET_CONTENT'; payload: string }
  // Additional action types used in the components
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string[] }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'ADD_SERP_SELECTION'; payload: SerpSelection }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: SerpSelection }
  | { type: 'SET_OUTLINE'; payload: ContentOutlineSection[] }
  | { type: 'ADD_OUTLINE_SECTION'; payload: ContentOutlineSection }
  | { type: 'UPDATE_OUTLINE_SECTION'; payload: { id: string; section: Partial<ContentOutlineSection> } }
  | { type: 'REMOVE_OUTLINE_SECTION'; payload: string }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string };

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
  
  // Additional actions used in the components
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
}

export interface ContentBuilderContextType extends ContentBuilderContextActions {
  state: ContentBuilderState;
  dispatch: Dispatch<ContentBuilderAction>;
}
