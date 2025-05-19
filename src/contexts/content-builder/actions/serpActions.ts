
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types/index';
import { analyzeKeywordSerp, getPreferredSerpProvider, setPreferredSerpProvider } from '@/services/serpApiService';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { SerpProvider } from '../types/serp-types';

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string, provider?: SerpProvider) => {
    if (!keyword) return;
    
    // Use provided provider or get the preferred one
    const selectedProvider = provider || getPreferredSerpProvider();
    
    // Update provider in state if provided
    if (provider) {
      setPreferredSerpProvider(provider);
    }
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // Make API call to analyze keyword with the selected provider
      const serpData = await analyzeKeywordSerp(keyword, false, selectedProvider);
      
      // Update SERP data in state - will be null if no data is found
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      if (!serpData) {
        toast.warning("No search data could be retrieved. Please add your SERP API key in Settings.");
      } else {
        console.log(`SERP data successfully retrieved using ${selectedProvider}:`, serpData);
        toast.success("Search data analysis completed successfully.");
      }
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      // Set serpData to null to display the NoDataFound component
      dispatch({ type: 'SET_SERP_DATA', payload: null });
      // Handle error
      toast.error(`Failed to analyze keyword with ${selectedProvider}. Please check your API key and try again.`);
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
    
    // Create a more structured outline from selected items
    const selectedItems = state.serpSelections.filter(item => item.selected);
    
    // Group items by type
    const headings = selectedItems.filter(item => item.type === 'heading').map(item => item.content);
    const questions = selectedItems.filter(item => item.type === 'question').map(item => item.content);
    const contentGaps = selectedItems.filter(item => item.type === 'contentGap').map(item => item.content);
    const entities = selectedItems.filter(item => item.type === 'entity').map(item => item.content);
    
    // Create outline sections based on selected items
    let outlineSections = [];
    
    // Start with introduction
    outlineSections.push("Introduction");
    
    // Add headings as main structure if available
    if (headings.length > 0) {
      outlineSections = [...outlineSections, ...headings];
    }
    
    // Add content gaps as unique sections
    if (contentGaps.length > 0) {
      contentGaps.forEach(gap => {
        if (!outlineSections.includes(gap)) {
          outlineSections.push(gap);
        }
      });
    }
    
    // Add questions as sections or a FAQ section
    if (questions.length > 0) {
      if (questions.length <= 2) {
        // If only 1-2 questions, add them directly
        questions.forEach(question => {
          if (!outlineSections.includes(question)) {
            outlineSections.push(question);
          }
        });
      } else {
        // If more than 2 questions, create a FAQ section
        outlineSections.push("Frequently Asked Questions");
      }
    }
    
    // Add entities if they're not already included
    if (entities.length > 0) {
      // Check if we need a separate section for entities or if they're already covered
      const entitySectionNeeded = entities.some(entity => 
        !outlineSections.some(section => 
          section.toLowerCase().includes(entity.toLowerCase())
        )
      );
      
      if (entitySectionNeeded) {
        outlineSections.push("Key Concepts and Definitions");
      }
    }
    
    // Always add conclusion
    if (!outlineSections.includes("Conclusion")) {
      outlineSections.push("Conclusion");
    }
    
    // Set the outline in state
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
    
    // Create an array of outline sections with IDs for the new table format
    const outlineSectionsWithIds = outlineSections.map(title => ({
      id: uuid(),
      title,
      level: 1,
    }));
    
    // Set the structured outline sections in state
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: outlineSectionsWithIds });
    
    // Navigate to the outline step
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    
    toast.success(`Generated outline with ${outlineSections.length} sections based on your selected items`);
  };
  
  const changeSerpProvider = async (provider: SerpProvider) => {
    // Set the new provider
    setPreferredSerpProvider(provider);
    
    // If we have a main keyword, re-analyze with the new provider
    if (state.mainKeyword) {
      await analyzeKeyword(state.mainKeyword, provider);
    }
  };
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    changeSerpProvider,
  };
};
