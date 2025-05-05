
import { ContentBuilderState, ContentBuilderAction } from '../types';
import { analyzeKeywordSerp } from '@/services/serpApiService'; // Import the proper API service

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) return;
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // Use the serpApiService to fetch data (with fallback to mock data)
      const serpData = await analyzeKeywordSerp(keyword);
      
      // Update SERP data in state
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      // Handle error
    } finally {
      // End loading
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
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
  };
};
