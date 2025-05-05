
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) return;
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // Make API call to analyze keyword
      const serpData = await analyzeKeywordSerp(keyword);
      
      // Update SERP data in state - will be null if no data is found
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      if (!serpData) {
        toast.warning("No search data could be retrieved. Please add your SERP API key in Settings.");
      }
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      // Set serpData to null to display the NoDataFound component
      dispatch({ type: 'SET_SERP_DATA', payload: null });
      // Handle error
      toast.error("Failed to analyze keyword. Please try again later.");
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
    if (!state.serpSelections.some(item => item.selected)) {
      toast.error("Please select at least one item to generate an outline");
      return;
    }
    
    // Create a basic outline from selected items
    const selectedItems = state.serpSelections.filter(item => item.selected);
    
    // Group items by type
    const headings = selectedItems.filter(item => item.type === 'heading').map(item => item.content);
    const questions = selectedItems.filter(item => item.type === 'question').map(item => item.content);
    const contentGaps = selectedItems.filter(item => item.type === 'contentGap').map(item => item.content);
    
    // Create outline sections
    const outlineSections = [
      "Introduction",
    ];
    
    // Add headings if available
    if (headings.length > 0) {
      outlineSections.push(...headings);
    }
    
    // Add questions if available
    if (questions.length > 0) {
      if (questions.length === 1) {
        outlineSections.push(questions[0]);
      } else {
        outlineSections.push("Frequently Asked Questions");
      }
    }
    
    // Add content gaps if available
    if (contentGaps.length > 0) {
      outlineSections.push("Additional Information");
    }
    
    // Always add conclusion
    outlineSections.push("Conclusion");
    
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
    
    // Navigate to the next step - fix the action type here
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
  };
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
  };
};
