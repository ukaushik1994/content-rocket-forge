
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { validateStep, canNavigateToStep } from '../utils/validation';
import { saveStateToStorage, createBackup } from '../utils/persistence';

export const createNavigationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigateToStep = (step: number) => {
    if (step < 0 || step >= state.steps.length) {
      console.warn('Invalid step number:', step);
      return;
    }
    
    // Validate current step before navigation
    const currentStepValidation = validateStep(state.activeStep, state);
    if (!currentStepValidation.isValid && step > state.activeStep) {
      console.warn('Cannot navigate forward. Current step has validation errors:', currentStepValidation.errors);
      return;
    }
    
    // Check if navigation to target step is allowed
    if (!canNavigateToStep(step, state)) {
      console.warn('Cannot navigate to step', step, '. Previous steps must be completed first.');
      return;
    }
    
    // Create backup before navigation
    createBackup(state, `Before navigation to step ${step}`);
    
    // Mark current step as visited and potentially completed
    dispatch({ type: 'MARK_STEP_VISITED', payload: state.activeStep });
    
    // Auto-complete current step if validation passes
    if (currentStepValidation.isValid) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
    }
    
    // Navigate to target step
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    
    // Auto-save state after navigation
    setTimeout(() => {
      const newState = { ...state, activeStep: step };
      saveStateToStorage(newState);
    }, 100);
  };
  
  return {
    navigateToStep
  };
};
