
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { SerpProvider } from '../types/serp-types';
import { analyzeSerpKeyword } from '@/services/serpApiService';
import { toast } from 'sonner';

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  /**
   * Analyze a keyword using SERP API
   */
  const analyzeKeyword = async (keyword: string, provider?: SerpProvider) => {
    if (!keyword) return;

    try {
      // Set analyzing state to true
      dispatch({ 
        type: 'SET_IS_ANALYZING', 
        payload: true 
      });
      
      console.log(`Analyzing keyword: ${keyword}`);
      
      // Call the SERP API service
      const result = await analyzeSerpKeyword(keyword);
      
      // If no result, show error and return
      if (!result) {
        dispatch({ 
          type: 'SET_IS_ANALYZING', 
          payload: false 
        });
        
        toast.error('No data found for this keyword');
        return;
      }
      
      console.log('SERP data received:', result);
      
      // Update SERP data in state
      dispatch({
        type: 'SET_SERP_DATA',
        payload: result
      });
      
      // Mark SERP analysis step as analyzed
      dispatch({
        type: 'MARK_STEP_VISITED',
        payload: 2
      });
      
      // Also mark as completed if we have selections
      if (state.serpSelections && Object.values(state.serpSelections).some(group => 
        Object.values(group).some(Boolean))
      ) {
        dispatch({
          type: 'MARK_STEP_COMPLETED',
          payload: 2
        });
      }
      
      // Set analyzing state to false
      dispatch({ 
        type: 'SET_IS_ANALYZING', 
        payload: false 
      });
      
      toast.success(`Analysis complete for "${keyword}"`);
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      
      dispatch({ 
        type: 'SET_IS_ANALYZING', 
        payload: false 
      });
      
      toast.error('Failed to analyze keyword');
    }
  };
  
  /**
   * Add content from SERP data to document
   */
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({
      type: 'ADD_CONTENT',
      payload: { content, source: 'serp', type }
    });
  };
  
  /**
   * Generate outline from SERP selections
   */
  const generateOutlineFromSelections = () => {
    const { serpSelections } = state;
    if (!serpSelections) return;
    
    // Get all selected items
    const selectedItems: { type: string; content: string }[] = [];
    
    Object.entries(serpSelections).forEach(([type, items]) => {
      Object.entries(items).forEach(([content, isSelected]) => {
        if (isSelected) {
          selectedItems.push({ type, content });
        }
      });
    });
    
    console.log('Selected items for outline:', selectedItems);
    
    // Update state to navigate to outline step
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
  };
  
  /**
   * Change SERP provider
   */
  const changeSerpProvider = async (provider: SerpProvider) => {
    // Save the preferred provider
    localStorage.setItem('preferred_serp_provider', provider);
    
    // If we have a main keyword, reanalyze with the new provider
    if (state.mainKeyword) {
      await analyzeKeyword(state.mainKeyword, provider);
    }
  };

  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    changeSerpProvider
  };
};
