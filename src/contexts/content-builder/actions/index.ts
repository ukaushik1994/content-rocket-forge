
import { ContentBuilderState, ContentBuilderAction, ContentBuilderContextType } from '../types/index';
import { createKeywordActions } from './keywordActions';
import { createContentActions } from './contentActions';
import { createSerpActions } from './serpActions';
import { createNavigationActions } from './navigationActions';
import { createPublishActions } from './publishActions';
import { createSeoActions } from './seoActions';

/**
 * Creates and combines all content builder actions
 */
export const createContentBuilderActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
): Omit<ContentBuilderContextType, 'state' | 'dispatch'> => {
  
  // Create feature-specific action groups
  const keywordActions = createKeywordActions(state, dispatch);
  const contentActions = createContentActions(state, dispatch);
  const serpActions = createSerpActions(state, dispatch);
  const navigationActions = createNavigationActions(state, dispatch);
  const publishActions = createPublishActions(state, dispatch);
  const seoActions = createSeoActions(state, dispatch);

  // Add missing actions
  const additionalActions = {
    selectCluster: (cluster: any) => dispatch({ type: 'SELECT_CLUSTER', payload: cluster }),
    setSeoScore: (score: number) => dispatch({ type: 'SET_SEO_SCORE', payload: score }),
    addSeoImprovement: (improvement: any) => dispatch({ type: 'ADD_SEO_IMPROVEMENT', payload: improvement }),
    skipOptimization: () => dispatch({ type: 'SKIP_OPTIMIZATION_STEP' }),
    setSolutionIntegrationMetrics: (metrics: any) => 
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: metrics })
  };

  // Merge all action groups and return
  return {
    ...keywordActions,
    ...contentActions,
    ...serpActions,
    ...navigationActions,
    ...publishActions,
    ...seoActions,
    ...additionalActions
  };
};
