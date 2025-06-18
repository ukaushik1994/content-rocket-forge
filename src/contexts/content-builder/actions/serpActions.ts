import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types/index';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

const processEnhancedSerpSelections = (serpData: any): SerpSelection[] => {
  const selections: SerpSelection[] = [];
  
  // Knowledge Graph entities
  if (serpData.knowledgeGraph) {
    const kg = serpData.knowledgeGraph;
    selections.push({
      type: 'knowledgeEntity',
      content: kg.title,
      selected: false,
      source: 'knowledge_graph',
      metadata: { type: kg.type, description: kg.description }
    });
    
    // Related entities from knowledge graph
    if (kg.relatedEntities) {
      kg.relatedEntities.forEach((entity: any) => {
        selections.push({
          type: 'relatedEntity',
          content: entity.name,
          selected: false,
          source: 'knowledge_graph',
          metadata: { link: entity.link }
        });
      });
    }
  }
  
  // Featured snippets
  if (serpData.featuredSnippets) {
    serpData.featuredSnippets.forEach((snippet: any) => {
      selections.push({
        type: 'featuredSnippet',
        content: snippet.content,
        selected: false,
        source: 'featured_snippets',
        metadata: { type: snippet.type, title: snippet.title, source: snippet.source }
      });
    });
  }
  
  // Local business data
  if (serpData.localResults) {
    serpData.localResults.forEach((business: any) => {
      selections.push({
        type: 'localBusiness',
        content: `${business.name} - ${business.address}`,
        selected: false,
        source: 'local_results',
        metadata: { rating: business.rating, reviews: business.reviews }
      });
    });
  }
  
  // Multimedia opportunities
  if (serpData.multimediaOpportunities) {
    serpData.multimediaOpportunities.forEach((opportunity: any) => {
      opportunity.suggestions.forEach((suggestion: any) => {
        selections.push({
          type: `multimedia_${opportunity.type}`,
          content: suggestion.title,
          selected: false,
          source: 'multimedia',
          metadata: { mediaType: opportunity.type, source: suggestion.source }
        });
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
      
      // Update SERP data in state - will be null if no data is found
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      if (!serpData) {
        toast.warning("No search data could be retrieved. Please add your SERP API key in Settings.");
      } else {
        console.log("SERP data successfully retrieved:", serpData);
        
        // Process enhanced SERP selections
        const enhancedSelections = processEnhancedSerpSelections(serpData);
        console.log("Enhanced SERP selections processed:", enhancedSelections.length);
        
        if (serpData.isMockData) {
          toast.warning("Using mock search data. Add your SERP API key for real results.");
        } else {
          toast.success("Search data analysis completed successfully with real data.");
        }
      }
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
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
  };
};
