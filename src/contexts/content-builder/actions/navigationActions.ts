
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (stepIndex: number) => {
    // Ensure the step index is valid
    if (stepIndex < 0 || stepIndex >= state.steps.length) {
      console.error(`Invalid step index: ${stepIndex}`);
      return;
    }

    // Validate navigation - prevent skipping incomplete required steps
    if (stepIndex > state.activeStep + 1) {
      // Get all steps between current and target
      const intermediateSteps = state.steps.slice(state.activeStep + 1, stepIndex);
      
      // Check if all intermediate required steps are completed
      const canSkip = intermediateSteps.every(step => 
        step.completed || step.id === 2 // Allow skipping SERP Analysis
      );
      
      if (!canSkip) {
        console.warn('Cannot skip incomplete required steps');
        return;
      }
    }

    // Mark the new step as visited
    const updatedSteps = state.steps.map((step, index) =>
      index === stepIndex ? { ...step, visited: true } : step
    );
    
    // Update the state with the new active step and updated steps
    dispatch({ 
      type: 'SET_CURRENT_STEP', 
      payload: stepIndex
    });
    
    // Also mark the step as visited explicitly
    dispatch({
      type: 'MARK_STEP_VISITED',
      payload: state.steps[stepIndex].id
    });
  };
  
  return {
    navigateToStep
  };
};
