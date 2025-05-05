
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
    dispatch({ type: 'SET_OUTLINE_TITLE', payload: title });
  };
  
  const setOutlineSections = (sections: any[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };
  
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };
  
  const rewriteContent = (newContent: string, improvementType: string) => {
    // First update the content
    dispatch({ type: 'SET_CONTENT', payload: newContent });
    
    // Then mark the improvement as applied if it exists
    if (state.seoImprovements) {
      const improvement = state.seoImprovements.find(imp => 
        imp.type === improvementType && !imp.applied
      );
      
      if (improvement) {
        dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: improvement.id });
      }
    }
  };
  
  return {
    setContentType,
    setContentFormat,
    setOutlineTitle,
    setOutlineSections,
    setContent,
    rewriteContent
  };
};
