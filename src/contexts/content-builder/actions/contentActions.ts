
import { ContentBuilderState, ContentBuilderAction, ContentType, ContentFormat, ContentIntent } from '../types';

export const createContentActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setContentType = (type: ContentType) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: type });
  };

  const setContentFormat = (format: ContentFormat) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };

  const setContentTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };

  const setContentIntent = (intent: ContentIntent) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: intent });
  };

  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };

  const generateContent = async (outline: any[]) => {
    dispatch({ type: 'SET_IS_GENERATING', payload: true });
    
    try {
      // In a real implementation, this would call an API to generate content
      // For now, just set a placeholder
      const generatedContent = `# ${state.contentTitle}\n\n` + 
        outline.map(section => `## ${section.title}\n\nContent for ${section.title} would be generated here.\n\n`).join('');
      
      dispatch({ type: 'SET_CONTENT', payload: generatedContent });
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };

  const saveContent = async (options: { title: string; content: string }) => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would save to a database
      console.log('Saving content:', options);
      
      // Simulate successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark the current step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };

  return {
    setContentType,
    setContentFormat,
    setContentTitle,
    setContentIntent,
    setContent,
    generateContent,
    saveContent
  };
};
