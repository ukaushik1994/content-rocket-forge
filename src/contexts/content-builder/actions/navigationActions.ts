
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (step: number) => {
    if (step < 0 || step >= state.steps.length) {
      return;
    }
    
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
  };
  
  return {
    navigateToStep
  };
};
