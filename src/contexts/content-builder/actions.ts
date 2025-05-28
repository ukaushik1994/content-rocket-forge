
import { ContentBuilderState, ContentBuilderAction } from './types/index';
import { createPublishActions } from './actions/publishActions';
import { createAnalyticsActions } from './actions/analyticsActions';

export const createContentBuilderActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const { saveContentToDraft, saveContentToPublished } = createPublishActions(state, dispatch);
  const { runComprehensiveAnalysis, analyzeReadability, analyzeTechnicalSeo, calculateContentQuality } = createAnalyticsActions(state, dispatch);

  const navigateToStep = (stepId: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepId });
    dispatch({ type: 'MARK_STEP_VISITED', payload: stepId });
  };

  const setMainKeyword = (keyword: string) => {
    dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
  };

  const addKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_KEYWORD', payload: keyword });
  };

  const removeKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_KEYWORD', payload: keyword });
  };

  const setSerpData = (data: any) => {
    dispatch({ type: 'SET_SERP_DATA', payload: data });
  };

  const setContentTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };

  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
    // Trigger automatic analysis when content changes
    setTimeout(() => runComprehensiveAnalysis(), 1000);
  };

  const setMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };

  const setMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };

  const setAdditionalInstructions = (instructions: string) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
  };

  return {
    // Navigation
    navigateToStep,
    
    // Keywords
    setMainKeyword,
    addKeyword,
    removeKeyword,
    
    // SERP
    setSerpData,
    
    // Content
    setContentTitle,
    setContent,
    setMetaTitle,
    setMetaDescription,
    setAdditionalInstructions,
    
    // Publishing
    saveContentToDraft,
    saveContentToPublished,
    
    // Analytics
    runComprehensiveAnalysis,
    analyzeReadability,
    analyzeTechnicalSeo,
    calculateContentQuality
  };
};
