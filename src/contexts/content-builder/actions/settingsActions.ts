
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

export const createSettingsActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setContentType = (type: string) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: type });
  };
  
  const setContentFormat = (format: string) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };
  
  const setContentIntent = (intent: string) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: intent });
  };

  return {
    setContentType,
    setContentFormat,
    setContentIntent
  };
};
