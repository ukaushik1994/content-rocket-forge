
import { ContentBuilderState } from '../types/state-types';
import { ContentBuilderAction } from '../types/action-types';
import { Solution } from '../types/solution-types';

export const createSolutionActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Set selected solution
  const setSelectedSolution = (solutionId: string | null) => {
    let solution: Solution | null = null;
    
    if (solutionId) {
      // Find the solution by id - this uses a safe optional chaining approach in case the property doesn't exist
      solution = state.availableSolutions?.find(s => s.id === solutionId) || null;
    }
    
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
  };
  
  // Set content lead-in text
  const setContentLeadIn = (leadIn: string) => {
    dispatch({ type: 'SET_CONTENT_LEAD_IN', payload: leadIn });
  };
  
  return {
    setSelectedSolution,
    setContentLeadIn
  };
};
