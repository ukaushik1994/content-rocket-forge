import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { OutlineSection } from '../types/outline-types';
import { ContentType, ContentFormat, ContentIntent } from '../types/content-types';

export const createContentActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setContentType = (contentType: ContentType) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: contentType });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
  };
  
  const setContentFormat = (format: string) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };
  
  const setContentIntent = (intent: string) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: intent });
  };
  
  const setOutline = (outline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: outline });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const setOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const updateContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
    
    // Mark content writing step as completed if there's enough content
    if (content && content.length >= 300) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  };
  
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };

  const generateContent = async (outline: OutlineSection[]): Promise<void> => {
    dispatch({ type: 'SET_IS_GENERATING', payload: true });
    
    try {
      // In a real implementation, this would call an AI service
      // For now we'll simulate content generation with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate placeholder content based on outline
      const content = generatePlaceholderContent(outline);
      
      // Set the generated content
      dispatch({ type: 'SET_CONTENT', payload: content });
      
      // Mark content writing step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };
  
  const saveContent = async (options: { title: string; content: string }): Promise<boolean> => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would save to a database
      // For now we'll just simulate saving with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set title and content
      dispatch({ type: 'SET_CONTENT_TITLE', payload: options.title });
      dispatch({ type: 'SET_CONTENT', payload: options.content });
      
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  const setAdditionalInstructions = (instructions: string) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
  };
  
  const setContentTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };
  
  const setSuggestedTitles = (titles: string[]) => {
    dispatch({ type: 'SET_SUGGESTED_TITLES', payload: titles });
  };
  
  const setMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };
  
  const setMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };
  
  // Helper function to generate placeholder content
  const generatePlaceholderContent = (outline: OutlineSection[]): string => {
    return outline.map(section => {
      return `# ${section.title}\n\nThis section will discuss ${section.title.toLowerCase()}. It will cover various aspects and provide valuable insights for the reader.\n\n`;
    }).join('\n');
  };

  return {
    setContentType,
    setContentFormat,
    setContentIntent,
    setOutline,
    setOutlineSections,
    updateContent,
    setContent,
    generateContent,
    saveContent,
    setAdditionalInstructions,
    setContentTitle,
    setSuggestedTitles,
    setMetaTitle,
    setMetaDescription
  };
};
