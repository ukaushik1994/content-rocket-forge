
import { ContentBuilderState, ContentBuilderAction, SaveContentParams } from '../types';

export const createPublishActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const saveContentToDraft = async (contentParams: SaveContentParams): Promise<string | null> => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would save to an API/database
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark the content as saved
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      
      // Return mock ID
      return 'draft-' + Date.now();
    } catch (error) {
      console.error('Error saving content:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  const saveContentToPublished = async (contentParams: SaveContentParams): Promise<string | null> => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would save to an API/database and mark as published
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark the content as saved and complete the step
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      
      // Return mock ID
      return 'published-' + Date.now();
    } catch (error) {
      console.error('Error publishing content:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  return {
    saveContentToDraft,
    saveContentToPublished
  };
};
