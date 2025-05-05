import React from 'react';

// Step definition
export interface ContentBuilderStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  visited: boolean;
}

// Type definitions for entities in the SERP analysis
export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
}

// Document structure for analysis
export interface DocumentStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  headings: any[];
  paragraphs: any[];
  lists: any[];
  images: any[];
  links: any[];
  metadata: any;
}

// Content cluster for keyword grouping
export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

// Content type
export interface ContentType {
  id: string;
  name: string;
  icon?: string;
  description: string;
}

// Solution type
export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases?: string[];
  painPoints?: string[];
  targetAudience?: string[];
  logoUrl?: string | null;
  externalUrl?: string | null;
  resources?: Array<{title: string; url: string}>;
}

// SEO Improvement
export interface SeoImprovement {
  id: string;
  type: string;
  recommendation: string;
  applied: boolean;
}

// Content outline section type
export interface OutlineSection {
  id: string;
  title: string;
  type?: string;
  content?: string;
  notes?: string;
  relatedKeywords?: string[];
  subsections?: Array<{id: string; title: string}>;
}

// Alias for backward compatibility
export type ContentOutlineSection = OutlineSection;

// Solution integration metrics
export interface SolutionIntegrationMetrics {
  mentions: number;
  contextualReferences: number;
  naturalness: number;
  featureIncorporation: number;
  positioningScore: number;
  overallScore: number;
  nameMentions?: number;
  audienceAlignment?: number;
  painPointsAddressed?: string[];
  ctaMentions?: number;
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
  serpSelections: SerpSelection[];
  selectedCluster: ContentCluster | null;
  
  // Outline data
  outline: OutlineSection[] | string[];
  isGeneratingOutline: boolean;
  
  // Content data
  content: string;
  isGeneratingContent: boolean;
  documentStructure: DocumentStructure | null;
  additionalInstructions: string;
  
  // Meta data
  metaTitle: string;
  metaDescription: string;
  
  // SEO data
  seoScore: number;
  seoImprovements?: SeoImprovement[];
  
  // Solution integration
  selectedSolution: Solution | null;
  solutionIntegrationMetrics: SolutionIntegrationMetrics;
  
  // UI state
  isSaving: boolean;
}

// Action types
export type ContentBuilderAction =
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'SET_PRIMARY_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  | { type: 'ADD_SECONDARY_KEYWORD'; payload: string }
  | { type: 'REMOVE_SECONDARY_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORD_CLUSTERS'; payload: Array<{ name: string; keywords: string[] }> }
  | { type: 'SET_CONTENT_TYPE'; payload: string }
  | { type: 'SET_CONTENT_FORMAT'; payload: string }
  | { type: 'SET_CONTENT_INTENT'; payload: string }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_OUTLINE'; payload: OutlineSection[] | string[] }
  | { type: 'SET_IS_GENERATING_OUTLINE'; payload: boolean }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING_CONTENT'; payload: boolean }
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: any }
  | { type: 'SET_META_TITLE'; payload: string }
  | { type: 'SET_META_DESCRIPTION'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_SELECTED_SOLUTION'; payload: Solution }
  | { type: 'SELECT_SOLUTION'; payload: Solution }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: SolutionIntegrationMetrics }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_SELECTED_KEYWORDS'; payload: string[] }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string }
  | { type: 'SET_SEO_IMPROVEMENTS'; payload: SeoImprovement[] };

export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  // Keyword actions
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  addSecondaryKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  removeSecondaryKeyword: (keyword: string) => void;
  // Content actions
  setContentType: (contentType: string) => void;
  setContentTitle: (title: string) => void;
  setContent: (content: string) => void;
  updateContent: (content: string) => void;
  setContentIntent: (intent: string) => void;
  setOutlineTitle: (title: string) => void;
  setOutlineSections: (sections: OutlineSection[]) => void;
  // SERP actions
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  // Navigation actions
  navigateToStep: (step: number) => void;
  // Saving and Publishing actions
  saveContentToDraft: (content: SaveContentParams) => Promise<string | null>;
  saveContentToPublished: (content: SaveContentParams) => Promise<string | null>;
  // Other actions as needed
}

export interface SaveContentParams {
  title: string;
  note?: string;
  isPublished: boolean;
  mainKeyword: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[] | OutlineSection[];
  seoScore?: number;
}
