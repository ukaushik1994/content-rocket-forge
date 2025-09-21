
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

  // Add setStrategySource action
  const setStrategySource = (source: { proposal_id: string; priority_tag: string; estimated_impressions: number; meta_suggestions?: { title: string; description: string } } | null) => {
    dispatch({ type: 'SET_STRATEGY_SOURCE', payload: source });
  };

  // Merge all action groups and return
  return {
    ...keywordActions,
    ...contentActions,
    ...serpActions,
    ...navigationActions,
    ...publishActions,
    ...seoActions,
    setStrategySource
  };
};

