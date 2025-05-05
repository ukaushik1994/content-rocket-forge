import React from 'react';

// Step definition
export interface ContentBuilderStep {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  visited: boolean;
}

// Content builder state
export interface ContentBuilderState {
  // Steps and navigation
  steps: ContentBuilderStep[];
  activeStep: number;
  
  // Keyword data
  mainKeyword: string;
  secondaryKeywords: string[];
  keywordClusters: Array<{
    name: string;
    keywords: string[];
  }>;
  selectedKeywords: string[];
  
  // Content type and format
  contentType: string;
  contentFormat: string;
  contentIntent: string;
  contentTitle: string;
  
  // SERP data
  isAnalyzing: boolean;
  serpData: any;
  serpSelections: {
    [key: string]: string[];
  };
  
  // Outline data
  outline: string[];
  isGeneratingOutline: boolean;
  
  // Content data
  content: string;
  isGeneratingContent: boolean;
  documentStructure: any;
  
  // Meta data
  metaTitle: string;
  metaDescription: string;
  
  // SEO data
  seoScore: number;
  
  // Solution integration
  selectedSolution: string;
  solutionIntegrationMetrics: {
    mentions: number;
    contextualReferences: number;
    naturalness: number;
  };
  
  // UI state
  isSaving: boolean;
}

// Action types
export type ContentBuilderAction =
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'SET_PRIMARY_KEYWORD'; payload: string }
  | { type: 'ADD_SECONDARY_KEYWORD'; payload: string }
  | { type: 'REMOVE_SECONDARY_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORD_CLUSTERS'; payload: Array<{ name: string; keywords: string[] }> }
  | { type: 'SET_CONTENT_TYPE'; payload: string }
  | { type: 'SET_CONTENT_FORMAT'; payload: string }
  | { type: 'SET_CONTENT_INTENT'; payload: string }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_OUTLINE'; payload: string[] }
  | { type: 'SET_IS_GENERATING_OUTLINE'; payload: boolean }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING_CONTENT'; payload: boolean }
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: any }
  | { type: 'SET_META_TITLE'; payload: string }
  | { type: 'SET_META_DESCRIPTION'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_SELECTED_SOLUTION'; payload: string }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: { mentions: number; contextualReferences: number; naturalness: number } }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_SELECTED_KEYWORDS'; payload: string[] };

export type ContentBuilderContextType = {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  // Keyword actions
  setMainKeyword: (keyword: string) => void;
  addSecondaryKeyword: (keyword: string) => void;
  removeSecondaryKeyword: (keyword: string) => void;
  // Content actions
  setContentType: (contentType: string) => void;
  setContentTitle: (title: string) => void;
  setContentIntent: (intent: string) => void;
  updateContent: (content: string) => void;
  // SERP actions
  analyzeKeyword: (keyword: string) => Promise<void>;
  // Navigation actions
  navigateToStep: (step: number) => void;
  // Saving and Publishing actions
  saveContentToDraft: (content: SaveContentParams) => Promise<string | null>;
  saveContentToPublished: (content: SaveContentParams) => Promise<string | null>;
  // Other actions as needed
};

export interface SaveContentParams {
  title: string;
  note?: string;
  isPublished: boolean;
  mainKeyword: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[];
  seoScore?: number;
}
