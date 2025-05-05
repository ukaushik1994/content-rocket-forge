
import React, { createContext, useContext, useReducer } from 'react';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import {
  ContentBuilderState,
  ContentBuilderAction,
  initialContentBuilderState,
  SerpSelection,
  ContentCluster
} from './content-builder/types';
import { contentBuilderReducer } from './content-builder/reducer';
import { SerpAnalysisResult } from '@/types/serp';

// The shared context state
interface ContentBuilderContextState {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  saveContentToDraft?: (data: any) => Promise<void>;
  saveContentToPublished?: (data: any) => Promise<void>;
}

// Create the context
const ContentBuilderContext = createContext<ContentBuilderContextState | undefined>(undefined);

// Provider component
export const ContentBuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(contentBuilderReducer, initialContentBuilderState);

  // Function to analyze a keyword using SERP API
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) {
      toast.error('Please enter a keyword to analyze');
      return;
    }
    
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    dispatch({ type: 'SET_SERP_ERROR', payload: null });
    
    try {
      // Set the main keyword in state
      dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
      
      // Call the SERP API service
      const serpData = await analyzeKeywordSerp(keyword);
      
      // Check if the response is empty or has an error
      if (!serpData || 
          (!serpData.topResults?.length && 
           !serpData.relatedSearches?.length && 
           !serpData.peopleAlsoAsk?.length &&
           !serpData.recommendations?.length)) {
        dispatch({ 
          type: 'SET_SERP_ERROR', 
          payload: 'No data found for this keyword. Please try a different keyword or check your API key.'
        });
      } else {
        // Update the SERP data in state
        dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      }
    } catch (error: any) {
      console.error('Error analyzing keyword:', error);
      dispatch({ 
        type: 'SET_SERP_ERROR', 
        payload: error.message || 'Error analyzing keyword'
      });
      toast.error(`Error analyzing keyword: ${error.message || 'Unknown error'}`);
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({ 
      type: 'TOGGLE_SERP_SELECTION', 
      payload: { type, content } 
    });
  };
  
  const generateOutlineFromSelections = () => {
    // In a real implementation, this would process selections and create an outline
    // For now, just set a basic outline
    const basicOutline = [
      "Introduction",
      "Key Points",
      "Main Content Section 1",
      "Main Content Section 2",
      "Conclusion"
    ];
    
    dispatch({ type: 'SET_OUTLINE', payload: basicOutline });
  };

  const saveContentToDraft = async (data: any) => {
    // Placeholder for saving content to draft
    console.log('Saving content to draft:', data);
    // In a real implementation, this would call an API
    return Promise.resolve();
  };

  const saveContentToPublished = async (data: any) => {
    // Placeholder for publishing content
    console.log('Publishing content:', data);
    // In a real implementation, this would call an API
    return Promise.resolve();
  };

  const value = {
    state,
    dispatch,
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    saveContentToDraft,
    saveContentToPublished
  };

  return (
    <ContentBuilderContext.Provider value={value}>
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
