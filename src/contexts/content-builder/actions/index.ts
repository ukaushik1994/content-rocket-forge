
import { ContentBuilderState } from '../types/state-types';
import { ContentBuilderAction } from '../types/action-types';
import { createKeywordActions } from './keywordActions';
import { createSerpActions } from './serpActions';
import { createContentActions } from './contentActions';
import { createOutlineActions } from './outlineActions';
import { createNavigationActions } from './navigationActions';
import { createSeoActions } from './seoActions';
import { createMetaActions } from './metaActions';
import { createClusterActions } from './clusterActions';
import { createSolutionActions } from './solutionActions';
import { createContentGenerationActions } from './contentGenerationActions';
import { createSaveActions } from './saveActions';
import { createAdvancedContentActions } from './advancedContentActions';
import { ContentBuilderContextType } from '../types/context-types';

export const createContentBuilderActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
): Omit<ContentBuilderContextType, 'state' | 'dispatch'> => {
  const keywordActions = createKeywordActions(state, dispatch);
  const serpActions = createSerpActions(state, dispatch);
  const contentActions = createContentActions(state, dispatch);
  const outlineActions = createOutlineActions(state, dispatch);
  const navigationActions = createNavigationActions(state, dispatch);
  const seoActions = createSeoActions(state, dispatch);
  const metaActions = createMetaActions(state, dispatch);
  const clusterActions = createClusterActions(state, dispatch);
  const solutionActions = createSolutionActions(state, dispatch);
  const contentGenerationActions = createContentGenerationActions(state, dispatch);
  const saveActions = createSaveActions(state, dispatch);
  const advancedContentActions = createAdvancedContentActions(state, dispatch);

  return {
    ...keywordActions,
    ...serpActions,
    ...contentActions,
    ...outlineActions,
    ...navigationActions,
    ...seoActions,
    ...metaActions,
    ...clusterActions,
    ...solutionActions,
    ...contentGenerationActions,
    ...saveActions,
    ...advancedContentActions
  };
};
