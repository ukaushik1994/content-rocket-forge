
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createKeywordActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setPrimaryKeyword = (keyword: string) => {
    dispatch({ type: 'SET_PRIMARY_KEYWORD', payload: keyword });
  };
  
  const addSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_SECONDARY_KEYWORD', payload: keyword });
  };
  
  const removeSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_SECONDARY_KEYWORD', payload: keyword });
  };
  
  const setKeywordClusters = (clusters: { [key: string]: string[] }) => {
    dispatch({ type: 'SET_KEYWORD_CLUSTERS', payload: clusters });
  };
  
  return {
    setPrimaryKeyword,
    addSecondaryKeyword,
    removeSecondaryKeyword,
    setKeywordClusters
  };
};
