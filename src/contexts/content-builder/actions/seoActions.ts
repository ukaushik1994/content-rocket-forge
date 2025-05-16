
import { ContentBuilderState, ContentBuilderAction, SeoImprovement } from '../types/index';

export const createSeoActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setSeoScore = (score: number) => {
    dispatch({ type: 'SET_SEO_SCORE', payload: score });
  };
  
  const addSeoImprovement = (improvement: SeoImprovement) => {
    dispatch({ type: 'ADD_SEO_IMPROVEMENT', payload: improvement });
  };
  
  const setSeoImprovements = (improvements: SeoImprovement[]) => {
    dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: improvements });
  };
  
  const applySeoImprovement = (id: string) => {
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
  };
  
  const updateMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };
  
  const updateMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };
  
  const setMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };
  
  const setMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };

  return {
    setSeoScore,
    addSeoImprovement,
    setSeoImprovements,
    applySeoImprovement,
    updateMetaTitle,
    updateMetaDescription,
    setMetaTitle,
    setMetaDescription
  };
};
