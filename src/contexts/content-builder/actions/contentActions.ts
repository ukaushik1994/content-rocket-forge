
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createContentActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setContentType = (contentType: any) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: contentType });
  };
  
  const setContentFormat = (format: string) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };
  
  const setOutlineTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };
  
  const setOutlineSections = (sections: any[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: sections });
  };
  
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };
  
  const updateContent = (content: string) => {
    // This is an alias for setContent for backward compatibility
    setContent(content);
  };

  const setContentIntent = (intent: string) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: intent });
  };
  
  const setContentTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };
  
  return {
    setContentType,
    setContentFormat,
    setOutlineTitle,
    setOutlineSections,
    setContent,
    updateContent,
    setContentIntent,
    setContentTitle
  };
};
