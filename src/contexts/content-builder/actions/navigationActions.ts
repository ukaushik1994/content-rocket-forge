
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (step: number) => {
    // Check if the target step is within valid range
    if (step < 0 || step >= state.steps.length) {
      return;
    }
    
    // Skip SERP Analysis (step 2) when navigating from step 1
    // Since it's now integrated into the first step
    if (step === 2) {
      // Skip to the Outline step (3) instead
      dispatch({ type: 'SET_ACTIVE_STEP', payload: 3 });
      return;
    }
    
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
  };
  
  return {
    navigateToStep
  };
};
