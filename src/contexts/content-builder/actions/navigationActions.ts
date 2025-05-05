
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (step: number) => {
    if (step < 0 || step >= state.steps.length) {
      return;
    }
    
    // Skip SERP Analysis (step with id 2) when navigating from step 1 (Content Type)
    if (state.steps[step].id === 1 && step < state.activeStep) {
      dispatch({ type: 'SET_ACTIVE_STEP', payload: 0 }); // Go back to Keyword Selection
      return;
    }
    
    if (state.steps[step].id === 1 && step > state.activeStep) {
      // Find the index of the step with id 3 (Outline step) 
      const outlineStepIndex = state.steps.findIndex(s => s.id === 3);
      if (outlineStepIndex !== -1) {
        dispatch({ type: 'SET_ACTIVE_STEP', payload: outlineStepIndex });
        return;
      }
    }
    
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
  };
  
  return {
    navigateToStep
  };
};
