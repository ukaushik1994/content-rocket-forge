import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { SerpProvider } from '../types/serp-types';
import { OutlineSection } from '../types/outline-types';
import { toast } from 'sonner';
import { setPreferredSerpProvider, analyzeSerpKeyword } from '@/services/serpApiService';

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
      
      // If no API key exists, show error message
      if (!apiKey) {
        toast.error(`No API key found for ${selectedProvider}. Please configure your API keys in settings.`);
        dispatch({ type: 'SET_IS_ANALYZING', payload: false });
        return;
      }
      
      // Get SERP data - no longer using mock data as fallback
      const serpData = await analyzeSerpKeyword(keyword);
      
      if (!serpData) {
        toast.error(`Failed to get data from ${selectedProvider}. Please check your API key.`);
        dispatch({ type: 'SET_IS_ANALYZING', payload: false });
        return;
      }
      
      dispatch({
        type: 'SET_SERP_DATA',
        payload: serpData
      });
      
    } catch (error: any) {
      console.error('Error analyzing keyword:', error);
      toast.error(`Failed to analyze keyword: ${error.message}`);
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  // Function to change SERP provider
  const changeSerpProvider = async (provider: SerpProvider) => {
    // Set the provider preference in localStorage
    setPreferredSerpProvider(provider);
    
    // Update the state with the new preferred provider
    dispatch({ 
      type: 'SET_PREFERRED_PROVIDER' as any, 
      payload: provider 
    });
    
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
          subsections: [],
          level: 1
        });
      });
      
      // Add questions as main sections if insufficient headings
      if (outlineSections.length < 3) {
        questions.slice(0, 5 - outlineSections.length).forEach(question => {
          outlineSections.push({
            id: `section-${outlineSections.length + 1}`,
            title: question,
            content: '',
            subsections: [],
            level: 1
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
            content: '',
            level: 2
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
          subsections: [],
          level: 1
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
