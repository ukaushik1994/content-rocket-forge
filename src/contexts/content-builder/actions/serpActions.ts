import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { SerpProvider } from '../types/serp-types';
import { OutlineSection } from '../types/outline-types';
import { toast } from 'sonner';

export const createSerpActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Function to analyze keyword using SERP API
  const analyzeKeyword = async (keyword: string, provider?: SerpProvider) => {
    if (!keyword) return;
    
    try {
      dispatch({ type: 'SET_IS_ANALYZING', payload: true });
      
      // Add the keyword to searched keywords list
      dispatch({
        type: 'ADD_SEARCHED_KEYWORD',
        payload: keyword
      });
      
      // Use the provided provider or the preferred one from state
      const selectedProvider = provider || state.preferredSerpProvider || 'serpapi';
      
      // Get the API key for the selected provider
      const getProviderApiKey = () => {
        switch (selectedProvider) {
          case 'serpapi':
            return localStorage.getItem('serp_api_key');
          case 'dataforseo':
            return localStorage.getItem('dataforseo_api_key');
          default:
            return null;
        }
      };
      
      const apiKey = getProviderApiKey();
      
      // If no API key is available, return no data
      if (!apiKey) {
        dispatch({
          type: 'SET_SERP_DATA',
          payload: null
        });
        return;
      }
      
      // In a real implementation, this would make an API call
      // For now, we'll just return null instead of mock data
      const serpData = null;
      
      dispatch({
        type: 'SET_SERP_DATA',
        payload: serpData
      });
      
    } catch (error: any) {
      console.error('Error analyzing keyword:', error);
      toast.error(`Failed to analyze keyword: ${error.message}`);
      
      dispatch({
        type: 'SET_SERP_DATA',
        payload: null
      });
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  // Function to change SERP provider
  const changeSerpProvider = async (provider: SerpProvider) => {
    // Use a valid action type for setting preferred SERP provider
    dispatch({ type: 'SET_PREFERRED_PROVIDER', payload: provider });
    
    if (state.mainKeyword) {
      await analyzeKeyword(state.mainKeyword, provider);
    }
  };
  
  // Function to generate outline from SERP selections
  const generateOutlineFromSelections = () => {
    const { serpSelections } = state;
    
    if (serpSelections.length === 0) {
      toast.error('No content selected for outline generation');
      return;
    }
    
    try {
      // Convert selections to outline sections
      const headings = serpSelections
        .filter(item => item.selected && item.type === 'heading')
        .map(item => item.content);
      
      const questions = serpSelections
        .filter(item => item.selected && item.type === 'question')
        .map(item => item.content);
      
      // Create outline sections
      const outlineSections: OutlineSection[] = [];
      
      // Add headings as main sections
      headings.forEach(heading => {
        outlineSections.push({
          id: `section-${outlineSections.length + 1}`,
          title: heading,
          content: '',
          subsections: []
        });
      });
      
      // Add questions as main sections if insufficient headings
      if (outlineSections.length < 3) {
        questions.slice(0, 5 - outlineSections.length).forEach(question => {
          outlineSections.push({
            id: `section-${outlineSections.length + 1}`,
            title: question,
            content: '',
            subsections: []
          });
        });
      } else {
        // Otherwise, add questions as subsections to the most relevant sections
        // For simplicity, we'll distribute them evenly
        questions.forEach((question, index) => {
          const sectionIndex = index % outlineSections.length;
          
          if (!outlineSections[sectionIndex].subsections) {
            outlineSections[sectionIndex].subsections = [];
          }
          
          outlineSections[sectionIndex].subsections!.push({
            id: `subsection-${sectionIndex + 1}-${outlineSections[sectionIndex].subsections!.length + 1}`,
            title: question,
            content: ''
          });
        });
      }
      
      // Ensure we have at least 3 sections
      while (outlineSections.length < 3) {
        const sectionNumber = outlineSections.length + 1;
        const title = state.mainKeyword ? 
          `Section ${sectionNumber}: ${state.mainKeyword} Details` : 
          `Section ${sectionNumber}`;
        
        outlineSections.push({
          id: `section-${sectionNumber}`,
          title,
          content: '',
          subsections: []
        });
      }
      
      // Update state with new outline sections
      dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: outlineSections });
    } catch (error: any) {
      console.error('Error generating outline from selections:', error);
      toast.error(`Failed to generate outline: ${error.message}`);
    }
  };

  // Function to add selected content from SERP analysis
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };

  return {
    analyzeKeyword,
    changeSerpProvider,
    generateOutlineFromSelections,
    addContentFromSerp
  };
};
