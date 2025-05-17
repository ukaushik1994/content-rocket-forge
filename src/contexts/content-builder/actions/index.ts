
import { createKeywordActions } from './keywordActions';
import { createSerpActions } from './serpActions';
import { createContentActions } from './contentActions';
import { createOutlineActions } from './outlineActions';
import { createOptimizationActions } from './optimizationActions';
import { createContextActions } from './contextActions';
import { createNavigationActions } from './navigationActions';
import { createSolutionActions } from './solutionActions';
import { createPublishActions } from './publishActions';
import { createAnalysisActions } from './analysisActions';
import { ContentBuilderState, ContentBuilderAction } from '../types';
import { ContentBuilderContextType } from '../types';

export const createContentBuilderActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
): Omit<ContentBuilderContextType, 'state' | 'dispatch'> => {
  // Create actions from each category
  const keywordActions = createKeywordActions(state, dispatch);
  const serpActions = createSerpActions(state, dispatch);
  const contentActions = createContentActions(state, dispatch);
  const outlineActions = createOutlineActions(state, dispatch);
  const optimizationActions = createOptimizationActions(state, dispatch);
  const contextActions = createContextActions(state, dispatch);
  const navigationActions = createNavigationActions(state, dispatch);
  const solutionActions = createSolutionActions(state, dispatch);
  const publishActions = createPublishActions(state, dispatch);
  const analysisActions = createAnalysisActions(state, dispatch);
  
  // Function to generate SEO meta with AI
  const generateSeoMeta = async (): Promise<boolean> => {
    try {
      if (!state.mainKeyword || !state.content) {
        console.error('Missing required data for SEO meta generation');
        return false;
      }
      
      // In a real implementation, call an AI service to generate
      // meta information based on the content and keyword
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Generate a meta title (70 chars max)
      const title = `${state.mainKeyword} - Comprehensive Guide ${new Date().getFullYear()}`;
      dispatch({ type: 'SET_META_TITLE', payload: title });
      
      // Generate a meta description (160 chars max)
      const description = `Learn everything about ${state.mainKeyword} in our comprehensive guide. Discover tips, strategies, and expert insights to master ${state.mainKeyword} effectively.`;
      dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
      
      return true;
    } catch (error) {
      console.error('Error generating SEO meta:', error);
      return false;
    }
  };
  
  // Combine all actions
  return {
    ...keywordActions,
    ...serpActions,
    ...contentActions,
    ...outlineActions,
    ...optimizationActions,
    ...contextActions,
    ...navigationActions,
    ...solutionActions,
    ...publishActions,
    ...analysisActions,
    generateSeoMeta,
  };
};
