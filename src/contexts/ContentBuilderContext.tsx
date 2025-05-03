
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
  serpData: SerpAnalysisResult | null;
  serpSelections: SerpSelection[];
  isAnalyzing: boolean;
  outline: ContentOutlineSection[];
  content: string;
  seoScore: number;
  additionalInstructions: string;
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
  | { type: 'ADD_SERP_SELECTION'; payload: SerpSelection }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_OUTLINE'; payload: ContentOutlineSection[] }
  | { type: 'ADD_OUTLINE_SECTION'; payload: ContentOutlineSection }
  | { type: 'UPDATE_OUTLINE_SECTION'; payload: { id: string; section: Partial<ContentOutlineSection> } }
  | { type: 'REMOVE_OUTLINE_SECTION'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string };

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
  serpSelections: [],
  isAnalyzing: false,
  outline: [],
  content: '',
  seoScore: 0,
  additionalInstructions: '',
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
      const newSelections: SerpSelection[] = [];
      
      // Convert SERP data to selectable items
      if (action.payload.peopleAlsoAsk) {
        action.payload.peopleAlsoAsk.forEach(item => {
          newSelections.push({
            type: 'question',
            content: item.question,
            source: item.source,
            selected: false
          });
        });
      }
      
      if (action.payload.relatedSearches) {
        action.payload.relatedSearches.forEach(item => {
          newSelections.push({
            type: 'keyword',
            content: item.query,
            selected: false
          });
        });
      }
      
      if (action.payload.featuredSnippets) {
        action.payload.featuredSnippets.forEach(item => {
          newSelections.push({
            type: 'snippet',
            content: item.content,
            source: item.source,
            selected: false
          });
        });
      }

      if (action.payload.topResults) {
        action.payload.topResults.forEach(item => {
          if (item.snippet) {
            newSelections.push({
              type: 'competitor',
              content: item.snippet,
              source: item.link,
              selected: false
            });
          }
        });
      }
      
      return { 
        ...state, 
        serpData: action.payload,
        serpSelections: newSelections
      };
    case 'ADD_SERP_SELECTION':
      return {
        ...state,
        serpSelections: [...state.serpSelections, action.payload]
      };
    case 'TOGGLE_SERP_SELECTION':
      return {
        ...state,
        serpSelections: state.serpSelections.map(item => 
          item.type === action.payload.type && item.content === action.payload.content
            ? { ...item, selected: !item.selected }
            : item
        )
      };
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
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return { ...state, additionalInstructions: action.payload };
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
  generateOutlineFromSelections: () => void;
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

  const generateOutlineFromSelections = () => {
    // Generate outline based on selected SERP items
    const selectedItems = state.serpSelections.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.warning('Please select some items from the SERP analysis first');
      return;
    }
    
    // Group selected items by type
    const questionItems = selectedItems.filter(item => item.type === 'question');
    const keywordItems = selectedItems.filter(item => item.type === 'keyword');
    const snippetItems = selectedItems.filter(item => item.type === 'snippet');
    
    // Create outline sections based on selected items
    const outlineSections: ContentOutlineSection[] = [
      { id: crypto.randomUUID(), title: `Introduction to ${state.mainKeyword}` }
    ];
    
    // Add sections for keywords
    if (keywordItems.length > 0) {
      keywordItems.forEach(item => {
        outlineSections.push({
          id: crypto.randomUUID(),
          title: item.content.charAt(0).toUpperCase() + item.content.slice(1)
        });
      });
    }
    
    // Add FAQ section if questions exist
    if (questionItems.length > 0) {
      outlineSections.push({
        id: crypto.randomUUID(),
        title: 'Frequently Asked Questions',
        subsections: questionItems.map(item => ({
          id: crypto.randomUUID(),
          title: item.content
        }))
      });
    }
    
    // Add conclusion
    outlineSections.push({ 
      id: crypto.randomUUID(), 
      title: 'Conclusion' 
    });
    
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
    toast.success('Outline generated from selected items');
    
    // Mark outline step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    
    // Navigate to the outline step
    navigateToStep(3);
  };

  return (
    <ContentBuilderContext.Provider
      value={{ state, dispatch, analyzeKeyword, navigateToStep, addContentFromSerp, generateOutlineFromSelections }}
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
