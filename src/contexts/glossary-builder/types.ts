export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition?: string;
  expandedExplanation?: string;
  searchVolume?: number;
  keywordDifficulty?: number;
  relatedTerms: string[];
  paaQuestions: Array<{
    question: string;
    answer: string;
  }>;
  internalLinks: Array<{
    title: string;
    url: string;
  }>;
  lastUpdated: string;
  status: 'draft' | 'completed' | 'needs_review';
}

export interface Glossary {
  id: string;
  name: string;
  description?: string;
  domainUrl?: string;
  isActive: boolean;
  terms: GlossaryTerm[];
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryBuilderState {
  currentGlossary: Glossary | null;
  glossaries: Glossary[];
  selectedTerms: string[];
  isGenerating: boolean;
  isAnalyzing: boolean;
  lastError: string | null;
  activeMode: 'domain' | 'topic' | 'manual';
  suggestedTerms: string[];
  exportFormat: 'markdown' | 'json' | 'csv';
}

export type GlossaryBuilderAction =
  | { type: 'SET_CURRENT_GLOSSARY'; payload: Glossary | null }
  | { type: 'ADD_GLOSSARY'; payload: Glossary }
  | { type: 'UPDATE_GLOSSARY'; payload: Glossary }
  | { type: 'DELETE_GLOSSARY'; payload: string }
  | { type: 'ADD_TERM'; payload: GlossaryTerm }
  | { type: 'UPDATE_TERM'; payload: GlossaryTerm }
  | { type: 'DELETE_TERM'; payload: string }
  | { type: 'SELECT_TERMS'; payload: string[] }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_MODE'; payload: 'domain' | 'topic' | 'manual' }
  | { type: 'SET_SUGGESTED_TERMS'; payload: string[] }
  | { type: 'SET_EXPORT_FORMAT'; payload: 'markdown' | 'json' | 'csv' };

export interface GlossaryBuilderContextType {
  state: GlossaryBuilderState;
  dispatch: React.Dispatch<GlossaryBuilderAction>;
  // Actions
  createGlossary: (name: string, description?: string) => Promise<void>;
  updateGlossary: (glossary: Glossary) => Promise<void>;
  deleteGlossary: (id: string) => Promise<void>;
  addTerm: (term: GlossaryTerm) => Promise<void>;
  updateTerm: (term: GlossaryTerm) => Promise<void>;
  deleteTerm: (id: string) => Promise<void>;
  generateDefinitions: (terms: string[]) => Promise<void>;
  analyzeDomain: (url: string) => Promise<void>;
  suggestTopicTerms: (topic: string) => Promise<void>;
  exportGlossary: (format: 'markdown' | 'json' | 'csv') => Promise<void>;
}