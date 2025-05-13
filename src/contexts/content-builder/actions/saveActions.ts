
import { ContentBuilderState } from '../types/state-types';
import { ContentBuilderAction } from '../types/action-types';

export const createSaveActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Set saving status
  const setSavingStatus = (isSaving: boolean) => {
    dispatch({ type: 'SET_IS_SAVING_DATA', payload: isSaving });
  };

  return {
    setSavingStatus
  };
};
