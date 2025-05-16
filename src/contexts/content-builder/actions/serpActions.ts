
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types/index';
import { analyzeKeywordSerp, searchRelatedKeywords } from '@/services/serp';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string, regions?: string[]) => {
    if (!keyword) {
      console.error("Cannot analyze empty keyword");
      toast.error("Please enter a keyword to analyze");
      return;
    }
    
    // Use provided regions or the currently selected regions or default to 'us'
    const searchRegions = regions || (state.selectedRegions.length > 0 ? state.selectedRegions : ['us']);
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      console.log('Analyzing keyword:', keyword, 'with regions:', searchRegions);
      
      // Make API call to analyze keyword with specified regions
      const serpData = await analyzeKeywordSerp(keyword, false, searchRegions);
      
      console.log('SERP API response received:', serpData ? 'Data received' : 'No data received');
      
      if (!serpData) {
        console.error('No SERP data returned from API');
        dispatch({ type: 'SET_SERP_DATA', payload: null });
        toast.error("Failed to retrieve SERP data. Please check your API key in Settings → API.");
        return;
      }
      
      // Only proceed if we have actual data (not mock data)
      if (serpData.isMockData) {
        console.warn('Mock SERP data received - API key may be invalid or missing');
        dispatch({ type: 'SET_SERP_DATA', payload: null });
        toast.warning("No real SERP data available. Please add your SERP API key in Settings → API.");
        return;
      }
      
      console.log('SERP data received:', JSON.stringify(serpData).substring(0, 200) + '...');
      
      // Update SERP data in state
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      // Create initial selections from the SERP data
      initializeSerpSelections(serpData, dispatch);
      console.log("SERP data successfully retrieved and selections initialized");
      toast.success("Search data analysis completed successfully.");
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      // Set serpData to null to display the NoDataFound component
      dispatch({ type: 'SET_SERP_DATA', payload: null });
      // Handle error
      toast.error("Failed to analyze keyword. Please check your API key and try again.");
    } finally {
      // End loading
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  // Initialize SERP selections from the data
  const initializeSerpSelections = (serpData: any, dispatch: React.Dispatch<ContentBuilderAction>) => {
    const selections: SerpSelection[] = [];
    
    // Add keywords
    if (serpData.keywords && Array.isArray(serpData.keywords) && serpData.keywords.length > 0) {
      console.log(`Processing ${serpData.keywords.length} keywords from SERP data`);
      serpData.keywords.forEach((keyword: string) => {
        selections.push({
          type: 'keyword',
          content: keyword,
          selected: false
        });
      });
    } else {
      console.log('No keywords found in SERP data');
    }
    
    // Add questions from peopleAlsoAsk - ensuring we capture all FAQ data properly
    if (serpData.peopleAlsoAsk && Array.isArray(serpData.peopleAlsoAsk) && serpData.peopleAlsoAsk.length > 0) {
      console.log(`Processing ${serpData.peopleAlsoAsk.length} questions from SERP data`);
      serpData.peopleAlsoAsk.forEach((item: any) => {
        // Extract the question text properly
        const questionText = typeof item === 'string' ? item : (item ? item.question : null);
        
        if (questionText) {
          selections.push({
            type: 'question',
            content: questionText,
            selected: false,
            source: item.source || '',
            metadata: { 
              answer: item.answer || '',
              type: 'faq'
            }
          });
        }
      });
    } else {
      console.log('No questions found in SERP data');
    }
    
    // Add entities
    if (serpData.entities && Array.isArray(serpData.entities) && serpData.entities.length > 0) {
      console.log(`Processing ${serpData.entities.length} entities from SERP data`);
      serpData.entities.forEach((entity: any) => {
        if (entity && entity.name) {
          selections.push({
            type: 'entity',
            content: entity.name,
            selected: false,
            metadata: { type: entity.type, description: entity.description }
          });
        }
      });
    } else {
      console.log('No entities found in SERP data');
    }
    
    // Add headings
    if (serpData.headings && Array.isArray(serpData.headings) && serpData.headings.length > 0) {
      console.log(`Processing ${serpData.headings.length} headings from SERP data`);
      serpData.headings.forEach((heading: any) => {
        const headingText = typeof heading === 'string' ? heading : (heading ? heading.text : null);
        if (headingText) {
          selections.push({
            type: 'heading',
            content: headingText,
            selected: false,
            metadata: { level: typeof heading === 'string' ? 'h2' : heading.level }
          });
        }
      });
    } else {
      console.log('No headings found in SERP data');
    }
    
    // Add content gaps
    if (serpData.contentGaps && Array.isArray(serpData.contentGaps) && serpData.contentGaps.length > 0) {
      console.log(`Processing ${serpData.contentGaps.length} content gaps from SERP data`);
      serpData.contentGaps.forEach((gap: any) => {
        if (gap) {
          selections.push({
            type: 'contentGap',
            content: gap.topic || gap.description || 'Content Gap',
            selected: false,
            metadata: { description: gap.description }
          });
        }
      });
    } else {
      console.log('No content gaps found in SERP data');
    }
    
    // Add top results
    if (serpData.topResults && Array.isArray(serpData.topResults) && serpData.topResults.length > 0) {
      console.log(`Processing ${Math.min(5, serpData.topResults.length)} top results from SERP data`);
      serpData.topResults.slice(0, 5).forEach((result: any) => {
        if (result) {
          selections.push({
            type: 'topRank',
            content: result.title || 'Untitled Result',
            selected: false,
            source: result.link || '',
            metadata: { snippet: result.snippet, position: result.position }
          });
        }
      });
    } else {
      console.log('No top results found in SERP data');
    }
    
    console.log(`Created ${selections.length} SERP selections`);
    
    // Update the selections in the state
    dispatch({ type: 'SET_SERP_SELECTIONS', payload: selections });
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
  
  // Update function to set selected region (single region only)
  const setSelectedRegions = (regions: string[]) => {
    // Ensure we only select one region at a time
    const region = regions.length > 0 ? [regions[0]] : ['us'];
    dispatch({ type: 'SET_SELECTED_REGIONS', payload: region });
  };

  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    setSelectedRegions
  };
};
