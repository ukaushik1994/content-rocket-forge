
import { ContentBuilderState } from '../types/state-types';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { serpProcessingService } from '@/services/serpProcessingService';

export const createSerpActions = (state: ContentBuilderState, dispatch: React.Dispatch<any>) => {
  // Analyze keyword and fetch SERP data
  const analyzeKeyword = async (keyword: string, regions?: string[]) => {
    try {
      dispatch({ type: 'SET_IS_ANALYZING', payload: true });
      
      // Fetch data from API
      const serpResponse = await analyzeKeywordSerp(keyword, regions);
      
      if (serpResponse) {
        // Process the data
        const processedData = serpProcessingService.processSerpData(serpResponse, keyword);
        
        // Update the state with processed data
        dispatch({ type: 'SET_SERP_DATA', payload: processedData });
        
        // Reset selections when analyzing a new keyword
        dispatch({ type: 'RESET_SERP_SELECTIONS' });
      }
    } catch (error) {
      console.error('Error analyzing keyword:', error);
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  // Add content from SERP selection
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  // Generate outline from SERP selections
  const generateOutlineFromSelections = () => {
    const { serpSelections } = state;
    
    // Convert selections to outline sections
    const outlineSections = serpProcessingService.convertSelectionsToOutline(serpSelections);
    
    // Set the outline sections
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: outlineSections });
    
    // Set auto-generated flag
    dispatch({ type: 'SET_OUTLINE_AUTO_GENERATED', payload: true });
    
    // Navigate to next step (outline step)
    dispatch({ type: 'SET_ACTIVE_STEP', payload: 3 });
  };
  
  // Set selected regions for SERP analysis
  const setSelectedRegions = (regions: string[]) => {
    dispatch({ type: 'SET_SELECTED_REGIONS', payload: regions });
  };
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    setSelectedRegions
  };
};
