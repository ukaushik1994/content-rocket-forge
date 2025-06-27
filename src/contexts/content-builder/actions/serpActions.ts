
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types/index';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

// Process the new structured SERP response format
const processStructuredSerpSelections = (serpData: any): SerpSelection[] => {
  const selections: SerpSelection[] = [];
  
  if (!serpData || !serpData.serp_blocks) {
    return selections;
  }

  const { serp_blocks, related_keywords } = serpData;
  
  // Knowledge Graph
  if (serp_blocks.knowledge_graph) {
    const kg = serp_blocks.knowledge_graph;
    selections.push({
      type: 'entity',
      content: kg.title || 'Knowledge Graph Entity',
      selected: false,
      source: 'knowledge_graph',
      metadata: { type: kg.type, description: kg.description }
    });
  }
  
  // Organic Results - extract headings and content
  if (serp_blocks.organic) {
    serp_blocks.organic.slice(0, 5).forEach((result: any, index: number) => {
      selections.push({
        type: 'heading',
        content: result.title,
        selected: false,
        source: 'organic_results',
        metadata: { position: index + 1, url: result.link, snippet: result.snippet }
      });
    });
  }
  
  // People Also Ask questions
  if (serp_blocks.people_also_ask) {
    serp_blocks.people_also_ask.slice(0, 4).forEach((question: any) => {
      selections.push({
        type: 'question',
        content: question.question || question.title,
        selected: false,
        source: 'people_also_ask',
        metadata: { answer: question.answer }
      });
    });
  }
  
  // Related Keywords
  if (related_keywords) {
    related_keywords.slice(0, 8).forEach((keyword: string) => {
      selections.push({
        type: 'keyword',
        content: keyword,
        selected: false,
        source: 'related_queries',
        metadata: {}
      });
    });
  }
  
  // Top Stories/News
  if (serp_blocks.top_stories) {
    serp_blocks.top_stories.slice(0, 3).forEach((story: any) => {
      selections.push({
        type: 'topStory',
        content: story.title,
        selected: false,
        source: 'top_stories',
        metadata: { url: story.link, source: story.source }
      });
    });
  }
  
  return selections;
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
        toast.warning("No search data could be retrieved. Please add your SERP API key in Settings.");
      } else {
        console.log("SERP data successfully retrieved:", serpData);
        
        // Process structured SERP selections from new format
        const structuredSelections = processStructuredSerpSelections(serpData);
        console.log("Structured SERP selections processed:", structuredSelections.length);
        
        // Add new selections to context without removing existing ones
        // Only add if they don't already exist
        structuredSelections.forEach(selection => {
          const existingItem = state.serpSelections.find(
            item => item.type === selection.type && item.content === selection.content
          );
          
          if (!existingItem) {
            // Add as unselected initially - user will select what they want
            dispatch({ 
              type: 'TOGGLE_SERP_SELECTION', 
              payload: { type: selection.type, content: selection.content }
            });
            // Then immediately deselect it so it's available but not selected
            dispatch({ 
              type: 'TOGGLE_SERP_SELECTION', 
              payload: { type: selection.type, content: selection.content }
            });
          }
        });
        
        if (serpData.isMockData) {
          toast.warning("Using mock search data. Add your SERP API key for real results.");
        } else {
          toast.success(`Analysis complete! Found ${structuredSelections.length} content opportunities.`);
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
