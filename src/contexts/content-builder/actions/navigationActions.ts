
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (step: number) => {
    if (step < 0 || step >= state.steps.length) {
      return;
    }
    
    // Get the current step and target step
    const currentStep = state.steps[state.activeStep];
    const targetStep = state.steps[step];
    
    // Always mark the current step as visited
    dispatch({ type: 'MARK_STEP_VISITED', payload: state.activeStep });
    
    // Check if trying to navigate forward
    if (step > state.activeStep) {
      // Check if all previous steps are completed before allowing forward navigation
      // First get all steps with IDs less than the target step's ID
      const previousSteps = state.steps.filter(s => s.id < targetStep.id);
      
      // Skip SERP Analysis (step with id 2) in the completion check
      const requiredCompletedSteps = previousSteps.filter(s => s.id !== 2);
      
      // Check if all required previous steps are completed
      const allPreviousStepsCompleted = requiredCompletedSteps.every(s => s.completed);
      
      if (!allPreviousStepsCompleted) {
        console.warn('Cannot navigate forward. Not all previous steps are completed.');
        return;
      }
    }
    
    // Skip SERP Analysis (step with id 2) when navigating between steps
    if (state.activeStep === 0 && step > state.activeStep) {
      // If going from keyword selection to content type, move forward normally
      dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
      return;
    }
    
    if (targetStep.id === 2) {
      // If trying to navigate to SERP Analysis (id 2), skip to next valid step
      const nextValidStep = step + 1 < state.steps.length ? step + 1 : state.activeStep;
      dispatch({ type: 'SET_ACTIVE_STEP', payload: nextValidStep });
      return;
    }
    
    // Normal navigation
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
  };
  
  return {
    navigateToStep
  };
};
