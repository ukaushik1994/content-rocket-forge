
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { SerpAnalysisResult } from '@/types/serp';
import { analyzeSerpKeyword, setPreferredSerpProvider, hasValidSerpApiKey } from '@/services/serpApiService';
import { toast } from 'sonner';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

/**
 * Creates actions related to SERP features
 */
export const createSerpActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  /**
   * Analyze a keyword with SERP API and update state with results
   */
  const analyzeKeyword = async (keyword: string, provider?: SerpProvider): Promise<boolean> => {
    if (!keyword) {
      toast.error("Please enter a keyword to analyze");
      return false;
    }
    
    try {
      // Start loading state
      dispatch({ type: 'SET_ANALYZING', payload: true });
      
      // Check if we have a valid API key
      if (provider !== 'mock' && !hasValidSerpApiKey()) {
        console.warn('No valid SERP API key found');
        toast.warning('Please configure a SERP API key to analyze keywords');
        dispatch({ type: 'SET_ANALYZING', payload: false });
        return false;
      }
      
      // If provider is specified, set it as the preferred provider
      if (provider) {
        setPreferredSerpProvider(provider);
      }
      
      // Get SERP analysis data
      const serpData = await analyzeSerpKeyword(keyword, true);
      
      // Update state with results
      if (serpData) {
        dispatch({ type: 'SET_SERP_DATA', payload: serpData });
        console.log('SERP data loaded:', serpData);
        
        // Auto-select the main keyword if it's not already selected
        if (!state.selectedKeywords.includes(keyword)) {
          dispatch({ type: 'ADD_KEYWORD', payload: keyword });
        }
        
        // Mark the step as started
        dispatch({ type: 'MARK_STEP_STARTED', payload: 2 });
        
        return true;
      } else {
        console.warn('No SERP data returned for keyword:', keyword);
        toast.error('Could not retrieve keyword data. Please try a different keyword or check your API key.');
        return false;
      }
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      toast.error('Failed to analyze keyword');
      return false;
    } finally {
      // Stop loading state
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };
  
  /**
   * Change the SERP provider and reanalyze the current keyword
   */
  const changeSerpProvider = async (provider: SerpProvider): Promise<boolean> => {
    // Set the preferred provider
    setPreferredSerpProvider(provider);
    
    // If we have a main keyword, reanalyze it with the new provider
    if (state.mainKeyword) {
      return await analyzeKeyword(state.mainKeyword, provider);
    }
    
    return true;
  };
  
  /**
   * Add content from SERP to the content
   */
  const addContentFromSerp = (content: string): void => {
    dispatch({ type: 'ADD_TO_CONTENT', payload: content });
  };

  return {
    analyzeKeyword,
    addContentFromSerp,
    changeSerpProvider
  };
};
