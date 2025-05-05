
import { ContentBuilderState, ContentBuilderAction } from '../types';

export const createKeywordActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setMainKeyword = (keyword: string) => {
    dispatch({ type: 'SET_PRIMARY_KEYWORD', payload: keyword });
  };

  const addSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_SECONDARY_KEYWORD', payload: keyword });
  };

  const removeSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_SECONDARY_KEYWORD', payload: keyword });
  };

  const setKeywordClusters = (clusters: Array<{ name: string; keywords: string[] }>) => {
    dispatch({ type: 'SET_KEYWORD_CLUSTERS', payload: clusters });
  };

  const addKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_KEYWORD', payload: keyword });
  };

  const removeKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_KEYWORD', payload: keyword });
  };

  return {
    setMainKeyword,
    addSecondaryKeyword,
    removeSecondaryKeyword,
    setKeywordClusters,
    addKeyword,
    removeKeyword
  };
};

