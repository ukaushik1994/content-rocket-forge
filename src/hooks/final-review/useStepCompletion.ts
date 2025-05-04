
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

/**
 * Custom hook for checking if the final review step can be marked as completed
 */
export const useStepCompletion = () => {
  const { state, dispatch } = useContentBuilder();
  
  // Check if we can mark the step as complete
  const checkStepCompletion = () => {
    const { metaTitle, metaDescription, documentStructure } = state;
    
    if (metaTitle && metaDescription && documentStructure) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
      return true;
    }
    
    return false;
  };

  return {
    checkStepCompletion
  };
};
