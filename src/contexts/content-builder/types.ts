
// Content Builder Types

// Step Types
export interface ContentBuilderStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  visited: boolean;
}

// SERP Selection Types
export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
  metadata?: any;
}

// Document Structure Types
export interface DocumentHeading {
  level: number;
  text: string;
}

export interface DocumentParagraph {
  text: string;
}

export interface DocumentList {
  type: string;
  items: string[];
}

export interface DocumentImage {
  src: string;
  alt: string;
}

export interface DocumentLink {
  href: string;
  text: string;
}

export interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
}

export interface DocumentStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  headings: DocumentHeading[];
  paragraphs: DocumentParagraph[];
  lists: DocumentList[];
  images: DocumentImage[];
  links: DocumentLink[];
  metadata: DocumentMetadata;
}

// Content Types
export type ContentType = 'article' | 'blog' | 'landingPage' | 'productPage' | 'custom';
export type ContentFormat = 'long-form' | 'short-form' | 'listicle' | 'howTo' | 'comparison';
export type ContentIntent = 'inform' | 'convert' | 'educate' | 'entertain' | 'inspire';

// Outline Types
export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  content?: string;
  children?: OutlineSection[];
}

// Cluster Types
export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

// SEO Improvement Types
export interface SeoImprovement {
  id: string;
  type: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
}

// Content Builder State
export interface ContentBuilderState {
  // Navigation
  activeStep: number;
  steps: ContentBuilderStep[];
  
  // Keywords
  mainKeyword: string;
  selectedKeywords: string[];
  searchedKeywords: string[];
  
  // Content Type
  contentType: ContentType;
  contentFormat: ContentFormat;
  contentIntent: ContentIntent;
  
  // Solutions
  selectedSolution: string | null;
  
  // Titles
  contentTitle: string;
  suggestedTitles: string[];
  
  // SERP Data
  serpData: any;
  serpSelections: SerpSelection[];
  isAnalyzing: boolean;
  
  // Outline
  outline: string[];
  outlineSections: OutlineSection[];
  
  // Content
  content: string;
  isGenerating: boolean;
  isSaving: boolean;
  
  // SEO
  seoScore: number;
  seoImprovements: SeoImprovement[];
  
  // Selected Cluster
  selectedCluster: ContentCluster | null;
}

// Content Builder Actions
export type ContentBuilderAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_OUTLINE'; payload: string[] }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: OutlineSection[] }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SUGGESTED_TITLES'; payload: string[] }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'ADD_SEO_IMPROVEMENT'; payload: SeoImprovement }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string }
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_CONTENT_FORMAT'; payload: ContentFormat }
  | { type: 'SET_CONTENT_INTENT'; payload: ContentIntent }
  | { type: 'SELECT_SOLUTION'; payload: string };

// Context Type
export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Navigation Actions
  navigateToStep: (step: number) => void;
  
  // Keyword Actions
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  
  // SERP Actions
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  
  // Content Actions
  setContentTitle: (title: string) => void;
  setContentType: (type: ContentType) => void;
  setContentFormat: (format: ContentFormat) => void;
  setContentIntent: (intent: ContentIntent) => void;
  generateContent: (outline: OutlineSection[]) => Promise<void>;
  saveContent: (options: { title: string; content: string }) => Promise<void>;
  
  // SEO Actions
  analyzeSeo: (content: string) => Promise<void>;
  applySeoImprovement: (id: string) => void;
}
