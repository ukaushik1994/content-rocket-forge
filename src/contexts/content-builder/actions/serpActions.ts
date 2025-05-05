
import { ContentBuilderState, ContentBuilderAction } from '../types';
import { analyzeKeywordSerp } from '@/services/serpApiService'; // Import the proper API service
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
      // Use the serpApiService to fetch data (with fallback to mock data)
      const serpData = await analyzeKeywordSerp(keyword);
      
      // Update SERP data in state
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      toast.success(`SERP data analyzed for: ${keyword}`);
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      toast.error('Failed to analyze keyword');
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
    if (state.serpSelections.length === 0) {
      toast.warning("Please select items from SERP analysis first");
      return;
    }
    
    // Start loading
    dispatch({ type: 'SET_IS_GENERATING_OUTLINE', payload: true });
    
    try {
      // In a real implementation, this would process selections and create an outline
      // For now, just set a basic outline based on SERP selections
      const basicOutline = [
        "Introduction",
        ...state.serpSelections
          .filter(item => item.type === 'heading' || item.type === 'question')
          .slice(0, 5)
          .map(item => item.content),
        "Conclusion"
      ];
      
      dispatch({ type: 'SET_OUTLINE', payload: basicOutline });
      toast.success("Outline generated successfully");
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error("Failed to generate outline");
    } finally {
      // End loading
      dispatch({ type: 'SET_IS_GENERATING_OUTLINE', payload: false });
    }
  };
  
  const generateContent = async () => {
    if (!state.contentTitle || state.outline.length === 0) {
      toast.warning("Please provide a title and outline first");
      return;
    }
    
    // Start generating content
    dispatch({ type: 'SET_IS_GENERATING_CONTENT', payload: true });
    
    try {
      // In a real implementation, we would call an AI service to generate content
      // For now, simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple content based on the outline
      const generatedContent = state.outline.map(section => {
        if (typeof section === 'string') {
          return `## ${section}\n\nThis is sample content for the section "${section}". It includes information about ${state.mainKeyword || 'the topic'} and related concepts.\n\n`;
        } else {
          return `## ${section.title}\n\nThis is sample content for the section "${section.title}". It includes information about ${state.mainKeyword || 'the topic'} and related concepts.\n\n`;
        }
      }).join('\n');
      
      // Update the content in state
      dispatch({ type: 'SET_CONTENT', payload: generatedContent });
      toast.success("Content generated successfully");
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error("Failed to generate content");
    } finally {
      // End content generation
      dispatch({ type: 'SET_IS_GENERATING_CONTENT', payload: false });
    }
  };
  
  const updateTitle = (title: string) => {
    if (!title.trim()) return;
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    generateOutline: generateOutlineFromSelections, // Alias for backward compatibility
    generateContent,
    updateTitle,
  };
};
