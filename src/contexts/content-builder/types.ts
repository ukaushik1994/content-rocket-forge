
export interface ContentOutlineSection {
  id: string;
  title: string;
  content?: string;
  subsections?: ContentOutlineSection[];
}

export interface SerpSelection {
  type: 'keyword' | 'question' | 'snippet' | 'competitor' | 'recommendation' | 'structure';
  content: string;
  source?: string;
  selected: boolean;
}

export interface Solution {
  id: string;
  name: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  description?: string; // Added description property
}

// Content cluster interface
export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

// Content type as a string literal type
export type ContentType = 'blog' | 'landingPage' | 'productDescription' | 'article' | 'email' | 'social';

// ContentType interface
export interface ContentTypeOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface ContentBuilderState {
  activeStep: number;
  steps: {
    id: number;
    name: string;
    description: string;
    completed: boolean;
  }[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordClusters: { [key: string]: string[] };
  contentType: string;
  contentFormat: string;
  contentTitle: string;
  outlineSections: { id: string; heading: string; content: string }[];
  serpAnalysisResults: any;
  serpKeywordsSelected: SerpSelection[];
  serpQuestionsSelected: SerpSelection[];
  isAnalyzing: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  content: string;
  mainKeyword: string;
  selectedKeywords: string[];
  selectedCluster: { name: string; keywords: string[] } | null;
  selectedSolution: Solution | null;
  serpData: any;
  serpSelections: SerpSelection[];
  outline: ContentOutlineSection[];
  seoScore: number;
  additionalInstructions: string;
}

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
  | { type: 'SET_OUTLINE_SECTIONS'; payload: { id: string; heading: string; content: string }[] }
  | { type: 'SET_SERP_ANALYSIS_RESULTS'; payload: any }
  | { type: 'SET_SERP_KEYWORDS_SELECTED'; payload: SerpSelection[] }
  | { type: 'SET_SERP_QUESTIONS_SELECTED'; payload: SerpSelection[] }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_IS_PUBLISHING'; payload: boolean }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string[] }
  | { type: 'SELECT_CLUSTER'; payload: { name: string; keywords: string[] } | null }
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
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

export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  analyzeKeyword: (keyword: string) => Promise<void>;
  navigateToStep: (step: number) => void;
  setPrimaryKeyword: (keyword: string) => void;
  addSecondaryKeyword: (keyword: string) => void;
  removeSecondaryKeyword: (keyword: string) => void;
  setKeywordClusters: (clusters: { [key: string]: string[] }) => void;
  setContentType: (contentType: string) => void;
  setContentFormat: (format: string) => void;
  setOutlineTitle: (title: string) => void;
  setOutlineSections: (sections: { id: string; heading: string; content: string }[]) => void;
  setSerpAnalysisResults: (results: any) => void;
  setSerpKeywordsSelected: (keywords: SerpSelection[]) => void;
  setSerpQuestionsSelected: (questions: SerpSelection[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setContent: (content: string) => void;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  saveContentAsDraft: () => Promise<string | false>;
  publishContent: () => Promise<string | false>;
}
