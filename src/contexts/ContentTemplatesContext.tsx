
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: string;
  promptTemplate: string;
  variables: string[];
  isCustom: boolean;
  createdAt: Date;
  usage: number;
}

interface TemplatesState {
  templates: ContentTemplate[];
  filteredTemplates: ContentTemplate[];
  selectedCategory: string;
  searchQuery: string;
  selectedTemplate: ContentTemplate | null;
  generatedContent: string;
  isGenerating: boolean;
  customTemplates: ContentTemplate[];
}

interface TemplatesAction {
  type: 'SET_TEMPLATES' | 'SET_FILTERED_TEMPLATES' | 'SET_SELECTED_CATEGORY' | 
        'SET_SEARCH_QUERY' | 'SET_SELECTED_TEMPLATE' | 'SET_GENERATED_CONTENT' | 
        'SET_GENERATING' | 'ADD_CUSTOM_TEMPLATE' | 'UPDATE_TEMPLATE_USAGE';
  payload: any;
}

const initialState: TemplatesState = {
  templates: [],
  filteredTemplates: [],
  selectedCategory: 'all',
  searchQuery: '',
  selectedTemplate: null,
  generatedContent: '',
  isGenerating: false,
  customTemplates: []
};

const templatesReducer = (state: TemplatesState, action: TemplatesAction): TemplatesState => {
  switch (action.type) {
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload, filteredTemplates: action.payload };
    case 'SET_FILTERED_TEMPLATES':
      return { ...state, filteredTemplates: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_GENERATED_CONTENT':
      return { ...state, generatedContent: action.payload, isGenerating: false };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'ADD_CUSTOM_TEMPLATE':
      return { 
        ...state, 
        customTemplates: [...state.customTemplates, action.payload],
        templates: [...state.templates, action.payload]
      };
    case 'UPDATE_TEMPLATE_USAGE':
      const updatedTemplates = state.templates.map(template =>
        template.id === action.payload.id
          ? { ...template, usage: template.usage + 1 }
          : template
      );
      return { ...state, templates: updatedTemplates };
    default:
      return state;
  }
};

const ContentTemplatesContext = createContext<{
  state: TemplatesState;
  dispatch: React.Dispatch<TemplatesAction>;
} | null>(null);

export const ContentTemplatesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(templatesReducer, initialState);
  
  return (
    <ContentTemplatesContext.Provider value={{ state, dispatch }}>
      {children}
    </ContentTemplatesContext.Provider>
  );
};

export const useContentTemplates = () => {
  const context = useContext(ContentTemplatesContext);
  if (!context) {
    throw new Error('useContentTemplates must be used within ContentTemplatesProvider');
  }
  return context;
};
