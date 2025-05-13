
import { ContentBuilderState, ContentBuilderAction, ContentBuilderContextType } from '../types/index';
import { createKeywordActions } from './keywordActions';
import { createContentActions } from './contentActions';
import { createSerpActions } from './serpActions';
import { createNavigationActions } from './navigationActions';
import { createPublishActions } from './publishActions';
import { createSeoActions } from './seoActions';
import { createOutlineActions } from './outlineActions';
import { createClusterActions } from './clusterActions';
import { createContentGenerationActions } from './contentGenerationActions';
import { createSolutionActions } from './solutionActions';
import { createAdvancedContentActions } from './advancedContentActions';

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
  const outlineActions = createOutlineActions(state, dispatch);
  const clusterActions = createClusterActions(state, dispatch);
  const contentGenerationActions = createContentGenerationActions(state, dispatch);
  const solutionActions = createSolutionActions(state, dispatch);
  const advancedContentActions = createAdvancedContentActions(state, dispatch);

  // Merge all action groups and return
  return {
    ...keywordActions,
    ...contentActions,
    ...serpActions,
    ...navigationActions,
    ...publishActions,
    ...seoActions,
    ...outlineActions,
    ...clusterActions,
    ...contentGenerationActions,
    ...solutionActions,
    ...advancedContentActions
  };
};
