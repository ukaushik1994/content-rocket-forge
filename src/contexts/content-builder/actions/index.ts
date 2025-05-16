
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { createNavigationActions } from './navigationActions';
import { createKeywordActions } from './keywordActions';
import { createSerpActions } from './serpActions';
import { createOutlineActions } from './outlineActions';
import { createContentActions } from './contentActions';
import { createSettingsActions } from './settingsActions';
import { createSeoActions } from './seoActions';
import { createReviewActions } from './reviewActions';

export const createContentBuilderActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const navigationActions = createNavigationActions(state, dispatch);
  const keywordActions = createKeywordActions(state, dispatch);
  const serpActions = createSerpActions(state, dispatch);
  const outlineActions = createOutlineActions(state, dispatch);
  const contentActions = createContentActions(state, dispatch);
  const settingsActions = createSettingsActions(state, dispatch);
  const seoActions = createSeoActions(state, dispatch);
  const reviewActions = createReviewActions(state, dispatch);

  return {
    ...navigationActions,
    ...keywordActions,
    ...serpActions,
    ...outlineActions,
    ...contentActions,
    ...settingsActions,
    ...seoActions,
    ...reviewActions
  };
};
