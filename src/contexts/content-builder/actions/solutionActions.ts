
import { ContentBuilderState, ContentBuilderAction, Solution } from '../types';

export const createSolutionActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setSelectedSolution = (solution: Solution | null) => {
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
  };
  
  return {
    setSelectedSolution
  };
};
