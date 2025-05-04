
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

/**
 * Actions related to SERP analysis and selection in the content builder
 */
export const createSerpActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Add SERP selection
  const addSerpSelection = (selection: SerpSelection) => {
    dispatch({ type: 'ADD_SERP_SELECTION', payload: selection });
  };

  // Toggle SERP selection
  const toggleSerpSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };

  // Analyze keyword for SERP data
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // Call API to analyze keyword
      const data = await analyzeKeywordSerp(keyword);
      
      // Set main keyword if not already set
      if (!state.mainKeyword) {
        dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
      }
      
      // Update SERP data in state
      if (data) {
        dispatch({ type: 'SET_SERP_DATA', payload: data });
        
        // Mark current step as completed if we have SERP data
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
        
        // Show success message
        if (data.isMockData) {
          toast.info(`Analysis completed for ${keyword} (using demo data)`);
        } else {
          toast.success(`Analysis completed for ${keyword}`);
        }
      }
    } catch (error) {
      console.error("Error analyzing keyword:", error);
      toast.error("Failed to analyze keyword. Please try again.");
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };

  // Add content from SERP to outline
  const addContentFromSerp = (content: string, type: string) => {
    toggleSerpSelection(type, content);
    toast.success(`Added ${type} to selected items`);
  };

  // Generate outline from selected SERP items
  const generateOutlineFromSelections = () => {
    const { serpSelections, contentTitle } = state;
    const selectedItems = serpSelections.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error("Please select items to include in your outline");
      return;
    }
    
    // Create sections for the outline based on selections
    const keywords = selectedItems.filter(item => item.type === 'keyword');
    const questions = selectedItems.filter(item => item.type === 'question');
    const snippets = selectedItems.filter(item => item.type === 'snippet');
    const entities = selectedItems.filter(item => item.type === 'entity');
    const headings = selectedItems.filter(item => item.type === 'heading');
    const contentGaps = selectedItems.filter(item => item.type === 'contentGap');
    const topRanks = selectedItems.filter(item => item.type === 'topRank');
    
    try {
      // Create outline sections
      const newOutline = [];
      
      // Use headings as primary structure if available
      if (headings.length > 0) {
        headings.forEach(heading => {
          newOutline.push({
            id: uuid(),
            title: heading.content,
            type: 'heading',
            notes: 'From top-ranking content headings'
          });
        });
      }
      
      // Use questions as main sections
      questions.forEach(question => {
        newOutline.push({
          id: uuid(),
          title: question.content,
          type: 'question',
          notes: 'Based on commonly asked questions'
        });
      });
      
      // Add content gaps as sections
      contentGaps.forEach(gap => {
        newOutline.push({
          id: uuid(),
          title: gap.content,
          notes: gap.source || 'Content opportunity from gap analysis', 
          type: 'contentGap'
        });
      });
      
      // Add a section for keywords
      if (keywords.length > 0) {
        newOutline.push({
          id: uuid(),
          title: "Key Concepts & Definitions",
          type: 'keywords',
          notes: 'Define these important terms for your readers',
          relatedKeywords: keywords.map(k => k.content)
        });
      }
      
      // Add a section for entities if present
      if (entities.length > 0) {
        newOutline.push({
          id: uuid(),
          title: "Important Entities & Concepts",
          type: 'entities',
          notes: 'Cover these key topics for comprehensiveness',
          relatedKeywords: entities.map(e => e.content)
        });
      }
      
      // Add top-ranked content insights if available
      if (topRanks.length > 0) {
        newOutline.push({
          id: uuid(),
          title: "Insights from Top-Ranked Content",
          type: 'topRanks',
          notes: "Incorporate learnings from competitor content",
          relatedKeywords: topRanks.map(t => t.content)
        });
      }
      
      // Set the outline in state
      dispatch({ type: 'SET_OUTLINE', payload: newOutline });
      
      // Create a title if one doesn't exist
      if (!contentTitle && state.mainKeyword) {
        const suggestedTitle = `Complete Guide to ${state.mainKeyword}`;
        dispatch({ type: 'SET_CONTENT_TITLE', payload: suggestedTitle });
      }
      
      // Mark SERP analysis step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
      
      // Navigate to outline step
      dispatch({ type: 'SET_ACTIVE_STEP', payload: 3 });
      
      toast.success(`Outline generated with ${newOutline.length} sections`);
    } catch (error) {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate outline. Please try again.");
    }
  };

  return {
    addSerpSelection,
    toggleSerpSelection,
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections
  };
};
