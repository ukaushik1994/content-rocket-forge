
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (step: number) => {
    if (step < 0 || step >= state.steps.length) {
      return;
    }
    
    // Skip SERP Analysis (step with id 2) when navigating between steps
    if (state.activeStep === 0 && step > state.activeStep) {
      // If going from keyword selection to content type, move forward normally
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
      return;
    }
    
    if (state.steps[step].id === 2) {
      // If trying to navigate to SERP Analysis (id 2), skip to next valid step
      const nextValidStep = step + 1 < state.steps.length ? step + 1 : state.activeStep;
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextValidStep });
      return;
    }
    
    // Always mark the current step as visited
    dispatch({ type: 'MARK_STEP_VISITED', payload: state.activeStep });
    
    // Normal navigation
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };
  
  return {
    navigateToStep
  };
};
