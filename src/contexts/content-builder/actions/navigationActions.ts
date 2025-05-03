
import { ContentBuilderState, ContentBuilderAction } from '../types';

/**
 * Actions related to step navigation within the content builder
 */
export const createNavigationActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Navigate between steps
  const navigateToStep = (step: number) => {
    if (step >= 0 && step < state.steps.length) {
      dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
    }
  };

  return {
    navigateToStep
  };
};
