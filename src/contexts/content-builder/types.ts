
// Step definition
export interface ContentBuilderStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

// Content type options
export type ContentType = 'article' | 'blog' | 'landing' | 'product' | 'email';

// Keyword cluster definition
export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

// SERP selection item
export interface SerpSelection {
  type: string;
  content: string;
  source?: string;
  selected: boolean;
}

// Content outline section
export interface ContentOutlineSection {
  id: string;
  title: string;
  type?: string;
  content?: string;
  notes?: string;
  relatedKeywords?: string[];
}

// Main state for content builder
export interface ContentBuilderState {
  activeStep: number;
  steps: ContentBuilderStep[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordClusters: { [key: string]: string[] };
  contentType: ContentType;
  contentFormat: string;
  contentTitle: string;
  outlineSections: any[];
  serpAnalysisResults: any;
  serpKeywordsSelected: string[];
  serpQuestionsSelected: string[];
  isAnalyzing: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  content: string;
  mainKeyword: string;
  selectedKeywords: string[];
  selectedCluster: ContentCluster | null;
  selectedSolution: any;
  serpData: any;
  serpSelections: SerpSelection[];
  outline: ContentOutlineSection[];
  seoScore: number;
  additionalInstructions: string;
}

// Action types for the reducer
export type ContentBuilderAction =
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'SET_PRIMARY_KEYWORD'; payload: string }
  | { type: 'ADD_SECONDARY_KEYWORD'; payload: string }
  | { type: 'REMOVE_SECONDARY_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORD_CLUSTERS'; payload: { [key: string]: string[] } }
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_CONTENT_FORMAT'; payload: string }
  | { type: 'SET_OUTLINE_TITLE'; payload: string }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: any }
  | { type: 'SET_SERP_ANALYSIS_RESULTS'; payload: any }
  | { type: 'SET_SERP_KEYWORDS_SELECTED'; payload: string[] }
  | { type: 'SET_SERP_QUESTIONS_SELECTED'; payload: string[] }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_IS_PUBLISHING'; payload: boolean }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string[] }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SELECT_SOLUTION'; payload: any }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'ADD_SERP_SELECTION'; payload: SerpSelection }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_OUTLINE'; payload: ContentOutlineSection[] }
  | { type: 'ADD_OUTLINE_SECTION'; payload: ContentOutlineSection }
  | { type: 'UPDATE_OUTLINE_SECTION'; payload: { id: string; section: Partial<ContentOutlineSection> } }
  | { type: 'REMOVE_OUTLINE_SECTION'; payload: string }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string };

// Context type definition
export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Navigation actions
  navigateToStep: (step: number) => void;
  
  // Keyword actions
  analyzeKeyword: (keyword: string) => Promise<void>;
  setPrimaryKeyword: (keyword: string) => void;
  addSecondaryKeyword: (keyword: string) => void;
  removeSecondaryKeyword: (keyword: string) => void;
  setKeywordClusters: (clusters: { [key: string]: string[] }) => void;
  
  // Content type actions
  setContentType: (contentType: ContentType) => void;
  setContentFormat: (format: string) => void;
  
  // Outline actions
  setOutlineTitle: (title: string) => void;
  setOutlineSections: (sections: { id: string; heading: string; content: string }[]) => void;
  
  // SERP actions
  addSerpSelection: (selection: SerpSelection) => void;
  toggleSerpSelection: (type: string, content: string) => void;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  
  // Content actions
  setContent: (content: string) => void;
  
  // Publishing actions
  publishContent: (platform: string) => Promise<boolean>;
  scheduleContent: (platform: string, date: Date) => Promise<boolean>;
}
