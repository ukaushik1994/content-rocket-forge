
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface SeoState {
  content: string;
  analysis: {
    score: number;
    readability: number;
    keywordDensity: number;
    structure: number;
    recommendations: string[];
  } | null;
  isAnalyzing: boolean;
  history: any[];
  competitorData: any[];
}

interface SeoAction {
  type: 'SET_CONTENT' | 'SET_ANALYSIS' | 'SET_ANALYZING' | 'ADD_HISTORY' | 'SET_COMPETITOR_DATA';
  payload: any;
}

const initialState: SeoState = {
  content: '',
  analysis: null,
  isAnalyzing: false,
  history: [],
  competitorData: []
};

const seoReducer = (state: SeoState, action: SeoAction): SeoState => {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload, isAnalyzing: false };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'ADD_HISTORY':
      return { ...state, history: [...state.history, action.payload] };
    case 'SET_COMPETITOR_DATA':
      return { ...state, competitorData: action.payload };
    default:
      return state;
  }
};

const SeoOptimizationContext = createContext<{
  state: SeoState;
  dispatch: React.Dispatch<SeoAction>;
} | null>(null);

export const SeoOptimizationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(seoReducer, initialState);
  
  return (
    <SeoOptimizationContext.Provider value={{ state, dispatch }}>
      {children}
    </SeoOptimizationContext.Provider>
  );
};

export const useSeoOptimization = () => {
  const context = useContext(SeoOptimizationContext);
  if (!context) {
    throw new Error('useSeoOptimization must be used within SeoOptimizationProvider');
  }
  return context;
};
