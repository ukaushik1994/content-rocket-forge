
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
  
  // Additional properties needed by other components
  metaTitle?: string;
  metaDescription?: string;
  selectedKeywords?: string[];
  contentTitle?: string;
  additionalInstructions?: string;
  documentStructure?: DocumentStructure | null;
  solutionIntegrationMetrics?: SolutionIntegrationMetrics;
  selectedSolution?: Solution | null;
  seoScore?: number;
  isGeneratingOutline?: boolean;
  isGeneratingContent?: boolean;
  seoImprovements?: SeoImprovement[];
}

export interface SeoImprovement {
  id: string;
  title: string;
  description: string;
  applied: boolean;
}

export interface DocumentStructure {
  headings: HeadingItem[];
  paragraphs: number;
  lists: ListItem[];
  images: number;
  tables: number;
  totalWords: number;
}

export interface HeadingItem {
  level: number;
  text: string;
}

export interface ListItem {
  type: 'ordered' | 'unordered';
  items: number;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  logoUrl: string | null;
  externalUrl: string | null;
  resources: { title: string; url: string }[];
}

export interface SolutionIntegrationMetrics {
  mentions: number;
  contextualReferences: number;
  naturalness: number;
  featureIncorporation: number;
  positioningScore: number;
  overallScore: number;
  nameMentions: number;
  audienceAlignment: number;
  painPointsAddressed: string[];
  ctaMentions: number;
}

export type ContentBuilderAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
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
  | { type: 'SET_CLUSTERS'; payload: ContentCluster[] }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string }
  | { type: 'SET_META_TITLE'; payload: string }
  | { type: 'SET_META_DESCRIPTION'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_IS_GENERATING_OUTLINE'; payload: boolean }
  | { type: 'SET_IS_GENERATING_CONTENT'; payload: boolean }
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: DocumentStructure }
  | { type: 'SET_SELECTED_SOLUTION'; payload: Solution | null }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: SolutionIntegrationMetrics }
  | { type: 'SET_SEO_IMPROVEMENTS'; payload: SeoImprovement[] }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string };

export interface SerpSelection {
  keywords: string[];
  peopleAlsoAsk: string[];
  topResults: string[];
  entities: string[];
  headings: string[];
  contentGaps: string[];
  recommendations: string[];
  [key: string]: string[];
  filter?: (predicate: (value: any) => boolean) => any[];
}

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

export interface OutlineSection {
  id: string;
  title: string;
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
  selectedKeywords: [],
  contentTitle: '',
  additionalInstructions: '',
  seoScore: 0,
};
