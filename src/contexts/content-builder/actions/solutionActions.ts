
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

export const createSolutionActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setSelectedSolution = (solutionId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SOLUTION', payload: solutionId });
  };

  const setContentLeadIn = (leadIn: string) => {
    dispatch({ type: 'SET_CONTENT_LEAD_IN', payload: leadIn });
  };

  return {
    setSelectedSolution,
    setContentLeadIn
  };
};
