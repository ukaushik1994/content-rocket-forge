
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

export const createReviewActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const updateAdditionalInstructions = (instructions: string) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
  };
  
  const setAdditionalInstructions = (instructions: string) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
  };

  return {
    updateAdditionalInstructions,
    setAdditionalInstructions
  };
};
