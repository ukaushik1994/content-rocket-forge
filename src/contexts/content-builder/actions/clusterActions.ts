
import { ContentBuilderState, ContentBuilderAction, ContentCluster } from '../types/index';

export const createClusterActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const selectCluster = (cluster: ContentCluster | null) => {
    dispatch({ type: 'SELECT_CLUSTER', payload: cluster });
  };

  return {
    selectCluster
  };
};
