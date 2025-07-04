
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types/index';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

import { transformSerpData, extractAllSelections } from '@/services/serpDataTransformer';

// Process any SERP response format using the unified transformer
const processStructuredSerpSelections = (serpData: any): SerpSelection[] => {
  if (!serpData) {
    console.warn('No SERP data provided for processing');
    return [];
  }

  console.log('🔄 Processing SERP data for selections:', serpData);
  
  try {
    // Use the unified transformer to normalize the data
    const normalizedData = transformSerpData(serpData);
    
    // Extract all selections from the normalized data
    const allSelections = extractAllSelections(normalizedData);
    
    console.log(`✅ Processed ${allSelections.length} selections from SERP data`);
    return allSelections;
  } catch (error) {
    console.error('❌ Error processing SERP selections:', error);
    return [];
  }
};

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string, forceRefresh: boolean = false) => {
    if (!keyword) return;
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // Make API call to analyze keyword
      const serpData = await analyzeKeywordSerp(keyword, forceRefresh);
      
      // Update SERP data in state
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      if (!serpData) {
        toast.warning("No SERP data available. Add your API key in Settings to get keyword insights, FAQs, and content opportunities.");
        console.log("❌ No SERP data returned - showing 'No Data Available' state");
        return; // Exit early to prevent further processing
      } else {
        console.log("SERP data successfully retrieved:", serpData);
        
        // Process SERP selections using the unified transformer
        const structuredSelections = processStructuredSerpSelections(serpData);
        console.log("Processed SERP selections:", structuredSelections.length);
        
        // Add new selections to context (they start as unselected)
        structuredSelections.forEach(selection => {
          const existingItem = state.serpSelections.find(
            item => item.type === selection.type && item.content === selection.content
          );
          
          if (!existingItem) {
            // Add the selection as available but not selected
            dispatch({ 
              type: 'ADD_SERP_SELECTION', 
              payload: selection
            });
          }
        });
        
        if (serpData.isMockData) {
          toast.warning("Using limited mock data. Add your SERP API key for comprehensive real insights.");
        } else {
          toast.success(`Analysis complete! Found ${structuredSelections.length} content opportunities from real SERP data.`);
        }
      }
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      dispatch({ type: 'SET_SERP_DATA', payload: null });
      toast.error("Failed to analyze keyword. Please check your API key and try again.");
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
    const selectedItems = state.serpSelections.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to generate an outline");
      return;
    }
    
    // Create a more structured outline from selected items
    // Group items by type
    const headings = selectedItems.filter(item => item.type === 'heading').map(item => item.content);
    const questions = selectedItems.filter(item => item.type === 'question').map(item => item.content);
    const keywords = selectedItems.filter(item => item.type === 'keyword').map(item => item.content);
    const topStories = selectedItems.filter(item => item.type === 'topStory').map(item => item.content);
    const contentGaps = selectedItems.filter(item => item.type === 'contentGap').map(item => item.content);
    
    // Create outline sections based on selected items
    let outlineSections = [];
    
    // Start with introduction
    outlineSections.push("Introduction");
    
    // Add headings as main structure if available
    if (headings.length > 0) {
      outlineSections = [...outlineSections, ...headings];
    }
    
    // Add content gaps as sections
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
        questions.forEach(question => {
          if (!outlineSections.includes(question)) {
            outlineSections.push(question);
          }
        });
      } else {
        outlineSections.push("Frequently Asked Questions");
      }
    }
    
    // Add top stories if selected
    if (topStories.length > 0) {
      outlineSections.push("Latest News and Trends");
    }
    
    // Add related topics if we have keywords
    if (keywords.length > 0) {
      outlineSections.push("Related Topics and Considerations");
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
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
  };
};
