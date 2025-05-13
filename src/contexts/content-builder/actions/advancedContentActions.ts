
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { toast } from 'sonner';

interface SaveContentParams {
  title?: string;
  note?: string;
  tags?: string[];
  projectId?: string;
}

export const createAdvancedContentActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const saveContentToDraft = async (options: SaveContentParams): Promise<string | null> => {
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      // In a real implementation, this would call an API
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const draftId = `draft-${Date.now()}`;
      toast.success('Content saved to drafts');
      return draftId;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      return null;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };

  const saveContentToPublished = async (options: SaveContentParams): Promise<string | null> => {
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      // In a real implementation, this would call an API
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const publishedId = `published-${Date.now()}`;
      toast.success('Content published successfully');
      return publishedId;
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
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
