
import { ContentBuilderState, ContentBuilderAction, ContentCluster } from '../types';

export const createContextActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setSelectedCluster = (cluster: ContentCluster | null) => {
    dispatch({ type: 'SET_SELECTED_CLUSTER', payload: cluster });
  };
  
  return {
    setSelectedCluster
  };
};
