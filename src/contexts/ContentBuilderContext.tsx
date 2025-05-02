
import React, { createContext, useContext, useState, useReducer } from 'react';
import { analyzeKeywordSerp, SerpAnalysisResult } from '@/services/serpApiService';
import { toast } from 'sonner';

// Define types for our context state
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

export interface ContentBuilderState {
  activeStep: number;
  steps: ContentStep[];
  mainKeyword: string;
  selectedKeywords: string[];
  selectedCluster: ContentCluster | null;
  contentType: ContentType | null;
  selectedSolution: Solution | null;
  serpData: SerpAnalysisResult | null;
  isAnalyzing: boolean;
  outline: ContentOutlineSection[];
  content: string;
  seoScore: number;
}

// Define actions for our reducer
type ContentBuilderAction =
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string[] }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
  | { type: 'SET_SERP_DATA'; payload: SerpAnalysisResult }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_OUTLINE'; payload: ContentOutlineSection[] }
  | { type: 'ADD_OUTLINE_SECTION'; payload: ContentOutlineSection }
  | { type: 'UPDATE_OUTLINE_SECTION'; payload: { id: string; section: Partial<ContentOutlineSection> } }
  | { type: 'REMOVE_OUTLINE_SECTION'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number };

// Initial state for our context
const initialState: ContentBuilderState = {
  activeStep: 0,
  steps: [
    { id: 0, name: 'Keywords', description: 'Select your target keywords', completed: false },
    { id: 1, name: 'Content Type', description: 'Define your content purpose', completed: false },
    { id: 2, name: 'SERP Analysis', description: 'Analyze search results', completed: false },
    { id: 3, name: 'Outline', description: 'Structure your content', completed: false },
    { id: 4, name: 'Write', description: 'Create your content', completed: false },
    { id: 5, name: 'Optimize', description: 'Improve SEO score', completed: false },
    { id: 6, name: 'Publish', description: 'Publish and share', completed: false },
  ],
  mainKeyword: '',
  selectedKeywords: [],
  selectedCluster: null,
  contentType: null,
  selectedSolution: null,
  serpData: null,
  isAnalyzing: false,
  outline: [],
  content: '',
  seoScore: 0,
};

// Reducer function to handle state updates
const contentBuilderReducer = (state: ContentBuilderState, action: ContentBuilderAction): ContentBuilderState => {
  switch (action.type) {
    case 'SET_ACTIVE_STEP':
      return { ...state, activeStep: action.payload };
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map(step =>
          step.id === action.payload ? { ...step, completed: true } : step
        ),
      };
    case 'SET_MAIN_KEYWORD':
      return { ...state, mainKeyword: action.payload };
    case 'ADD_KEYWORD':
      if (state.selectedKeywords.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedKeywords: [...state.selectedKeywords, action.payload],
      };
    case 'REMOVE_KEYWORD':
      return {
        ...state,
        selectedKeywords: state.selectedKeywords.filter(k => k !== action.payload),
      };
    case 'SET_KEYWORDS':
      return { ...state, selectedKeywords: action.payload };
    case 'SELECT_CLUSTER':
      return {
        ...state,
        selectedCluster: action.payload,
        // If a cluster is selected, use its keywords
        selectedKeywords: action.payload ? action.payload.keywords : state.selectedKeywords,
      };
    case 'SET_CONTENT_TYPE':
      return { ...state, contentType: action.payload };
    case 'SELECT_SOLUTION':
      return { ...state, selectedSolution: action.payload };
    case 'SET_SERP_DATA':
      return { ...state, serpData: action.payload };
    case 'SET_IS_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_OUTLINE':
      return { ...state, outline: action.payload };
    case 'ADD_OUTLINE_SECTION':
      return {
        ...state,
        outline: [...state.outline, action.payload],
      };
    case 'UPDATE_OUTLINE_SECTION': {
      const { id, section } = action.payload;
      return {
        ...state,
        outline: state.outline.map(item =>
          item.id === id ? { ...item, ...section } : item
        ),
      };
    }
    case 'REMOVE_OUTLINE_SECTION':
      return {
        ...state,
        outline: state.outline.filter(section => section.id !== action.payload),
      };
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_SEO_SCORE':
      return { ...state, seoScore: action.payload };
    default:
      return state;
  }
};

// Create the context
interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  analyzeKeyword: (keyword: string) => Promise<void>;
  navigateToStep: (step: number) => void;
  addContentFromSerp: (content: string, type: string) => void;
}

const ContentBuilderContext = createContext<ContentBuilderContextType | undefined>(undefined);

// Provider component
export const ContentBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contentBuilderReducer, initialState);

  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    try {
      const data = await analyzeKeywordSerp(keyword);
      dispatch({ type: 'SET_SERP_DATA', payload: data });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      toast.success(`Analysis completed for: ${keyword}`);
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      toast.error('Failed to analyze keyword. Please try again.');
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };

  const navigateToStep = (step: number) => {
    if (step >= 0 && step < state.steps.length) {
      dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
    }
  };

  const addContentFromSerp = (content: string, type: string) => {
    // Add content to the current draft, we'll use this in the editor step
    dispatch({ type: 'SET_CONTENT', payload: state.content + '\n\n' + content });
    toast.success(`Added ${type} to your content draft`);
  };

  return (
    <ContentBuilderContext.Provider
      value={{ state, dispatch, analyzeKeyword, navigateToStep, addContentFromSerp }}
    >
      {children}
    </ContentBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useContentBuilder = () => {
  const context = useContext(ContentBuilderContext);
  if (context === undefined) {
    throw new Error('useContentBuilder must be used within a ContentBuilderProvider');
  }
  return context;
};
