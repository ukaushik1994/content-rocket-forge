
import { ContentBuilderState, ContentBuilderAction, ContentCluster } from '../types/index';

export const createKeywordActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setMainKeyword = (keyword: string) => {
    dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
  };

  const addKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_KEYWORD', payload: keyword });
  };

  const removeKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_KEYWORD', payload: keyword });
  };

  const selectCluster = (cluster: ContentCluster | null) => {
    dispatch({ type: 'SELECT_CLUSTER', payload: cluster });
  };

  return {
    setMainKeyword,
    addKeyword,
    removeKeyword,
    selectCluster
  };
};
