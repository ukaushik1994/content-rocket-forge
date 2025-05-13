
import { ContentBuilderState } from '../types/state-types';
import { ContentBuilderAction } from '../types/action-types';

export const createMetaActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Set meta title
  const setMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };

  // Set meta description
  const setMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };

  return {
    setMetaTitle,
    setMetaDescription
  };
};
