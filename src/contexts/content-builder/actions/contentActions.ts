
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { OutlineSection } from '../types/outline-types';

export const createContentActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setContentType = (contentType: string) => {
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

  return {
    setContentType,
    setContentFormat,
    setContentIntent,
    setOutline,
    setOutlineSections,
    updateContent,
    setAdditionalInstructions,
    setContentTitle,
    setSuggestedTitles,
    setMetaTitle,
    setMetaDescription
  };
};
