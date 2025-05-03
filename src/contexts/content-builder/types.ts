
// Define types for our content builder context

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

export type ContentType = 'blog' | 'landingPage' | 'productDescription' | 'article' | 'email' | 'social';

export interface Solution {
  id: string;
  name: string;
  description: string;
  features?: string[];
}

export interface ContentStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

export interface ContentOutlineSection {
  id: string;
  title: string;
  content?: string;
  subsections?: ContentOutlineSection[];
}

export interface SerpSelection {
  type: 'question' | 'keyword' | 'snippet' | 'competitor';
  content: string;
  source?: string;
  selected: boolean;
}

export interface ContentBuilderState {
  activeStep: number;
  steps: ContentStep[];
  mainKeyword: string;
  selectedKeywords: string[];
  selectedCluster: ContentCluster | null;
  contentType: ContentType | null;
  selectedSolution: Solution | null;
  serpData: any | null; // Using any for now to avoid circular imports
  serpSelections: SerpSelection[];
  isAnalyzing: boolean;
  outline: ContentOutlineSection[];
  content: string;
  contentTitle: string;
  seoScore: number;
  additionalInstructions: string;
}

// Action types
export type ContentBuilderAction =
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string[] }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'ADD_SERP_SELECTION'; payload: SerpSelection }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_OUTLINE'; payload: ContentOutlineSection[] }
  | { type: 'ADD_OUTLINE_SECTION'; payload: ContentOutlineSection }
  | { type: 'UPDATE_OUTLINE_SECTION'; payload: { id: string; section: Partial<ContentOutlineSection> } }
  | { type: 'REMOVE_OUTLINE_SECTION'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string };

export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  analyzeKeyword: (keyword: string) => Promise<void>;
  navigateToStep: (step: number) => void;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
}
