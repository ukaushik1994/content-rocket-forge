
import { ContentBuilderState, ContentBuilderAction, ContentType } from '../types';
import { toast } from 'sonner';

/**
 * Actions related to content type, format and structure
 */
export const createContentActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Set content type with proper typing
  const setContentType = (contentType: ContentType) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: contentType });
  };

  // Set content format
  const setContentFormat = (format: string) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };

  // Set outline title
  const setOutlineTitle = (title: string) => {
    dispatch({ type: 'SET_OUTLINE_TITLE', payload: title });
  };

  // Set outline sections
  const setOutlineSections = (sections: { id: string; heading: string; content: string }[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };

  // Set content
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };

  // Add content from SERP to current draft
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({ type: 'SET_CONTENT', payload: state.content + '\n\n' + content });
    toast.success(`Added ${type} to your content draft`);
  };

  return {
    setContentType,
    setContentFormat,
    setOutlineTitle,
    setOutlineSections,
    setContent,
    addContentFromSerp
  };
};
