
import { ContentBuilderState, ContentBuilderAction, ContentBuilderContextType } from '../types';
import { createKeywordActions } from './keywordActions';
import { createContentActions } from './contentActions';
import { createSerpActions } from './serpActions';
import { createNavigationActions } from './navigationActions';
import { createPublishActions } from './publishActions';

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

  // Merge all action groups and return
  return {
    ...keywordActions,
    ...contentActions,
    ...serpActions,
    ...navigationActions,
    ...publishActions
  };
};
