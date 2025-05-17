
import React from 'react';
import { Step } from './step-types';
import { Solution } from './solution-types';
import { SerpSelection } from './serp-types';
import { ContentFormat } from './content-types';
import { OutlineItem } from './outline-types';
import { ContentCluster } from './cluster-types';
import { AiProvider } from '@/services/aiService/types';

// State interface for the Content Builder context
export interface ContentBuilderState {
  // Step navigation state
  steps: Step[];
  activeStep: number;
  
  // Keyword step state
  mainKeyword: string;
  selectedKeywords: string[];
  selectedCluster: ContentCluster | null;
  
  // SERP Analysis state
  serpData: any | null;
  isAnalyzing: boolean;
  serpSelections: SerpSelection[];
  
  // Solution state
  selectedSolution: Solution | null;
  
  // Content format state
  contentFormat: ContentFormat | null;
  
  // Outline step state
  outline: OutlineItem[];
  contentTitle: string;
  
  // Content writing state
  content: string;
  isGenerating: boolean;
  
  // SEO and metadata
  metaTitle: string;
  metaDescription: string;
  
  // Page analysis state
  pageAnalysis: {
    keywordDensity?: number;
    readabilityScore?: number;
    contentGaps?: string[];
    suggestions?: string[];
  };
  
  // Publishing state
  isSaving: boolean;
}

// Action types for the reducer
export type ContentBuilderAction =
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
  | { type: 'SELECT_CONTENT_FORMAT'; payload: ContentFormat }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_OUTLINE'; payload: OutlineItem[] }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'NAVIGATE_TO_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_ANALYZED'; payload: number }
  | { type: 'SET_PAGE_ANALYSIS'; payload: Partial<ContentBuilderState['pageAnalysis']> }
  | { type: 'SET_META_TITLE'; payload: string }
  | { type: 'SET_META_DESCRIPTION'; payload: string }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SKIP_OPTIMIZATION_STEP' }
  | { type: 'RESET_STATE' };

// Content save parameters
export interface SaveContentParams {
  title: string;
  content: string;
  mainKeyword: string;
  keywords?: string[];
  outline?: OutlineItem[];
  metaTitle?: string;
  metaDescription?: string;
  serpSelections?: SerpSelection[];
  [key: string]: any;
}

// Interface for the Content Builder Context
export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Keyword actions
  analyzeKeyword: (keyword: string) => Promise<void>;
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  
  // SERP actions
  addContentFromSerp: (content: string, type: string) => void;
  
  // Solution actions
  setSelectedSolution: (solution: Solution | null) => void;
  
  // Content format actions
  selectContentFormat: (format: ContentFormat) => void;
  
  // Outline actions
  setOutline: (outline: OutlineItem[]) => void;
  generateOutlineFromSelections: () => void;
  
  // Content actions
  setContentTitle: (title: string) => void;
  updateContent: (content: string) => void;
  generateContent: (aiProvider: AiProvider) => Promise<void>;
  
  // Navigation actions
  navigateToStep: (stepIndex: number) => void;
  
  // Analysis actions
  analyzeSeo: (content: string) => Promise<void>;
  applySeoImprovement: (id: string) => void;
  
  // Publishing actions
  skipOptimizationStep: () => void;
  saveContentToDraft: (content: SaveContentParams) => Promise<string | null>;
  saveContentToPublished: (content: SaveContentParams) => Promise<string | null>;
  
  // SEO Meta generation
  generateSeoMeta: () => Promise<boolean>;
}
