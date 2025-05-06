
import { ContentBuilderState, ContentBuilderAction, SaveContentParams } from '../types/index';
import { toast } from 'sonner';

export const createPublishActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Implementation for saving content to draft
  const saveContentToDraft = async (content: SaveContentParams): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_SAVING', payload: true });
      
      console.log('Saving content to draft:', content);
      
      // Check that required fields are present
      if (!content.title || !content.content || !content.mainKeyword) {
        console.error('Missing required fields for saving content:', { 
          title: content.title, 
          content: !!content.content, 
          mainKeyword: content.mainKeyword 
        });
        toast.error('Missing required fields for saving content');
        return null;
      }
      
      // In a real implementation, this would call an API to save the content
      const mockId = 'draft-' + Date.now();
      
      // Update state with saved content info
      if (content.metaTitle) {
        dispatch({ type: 'SET_META_TITLE', payload: content.metaTitle });
      }
      
      if (content.metaDescription) {
        dispatch({ type: 'SET_META_DESCRIPTION', payload: content.metaDescription });
      }
      
      // Set saving state to false
      dispatch({ type: 'SET_SAVING', payload: false });
      
      return mockId;
    } catch (error) {
      console.error('Error saving content to draft:', error);
      dispatch({ type: 'SET_SAVING', payload: false });
      return null;
    }
  };
  
  // Implementation for publishing content
  const saveContentToPublished = async (content: SaveContentParams): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_SAVING', payload: true });
      
      console.log('Publishing content:', content);
      
      // Check that required fields are present
      if (!content.title || !content.content || !content.mainKeyword) {
        console.error('Missing required fields for publishing content:', { 
          title: content.title, 
          content: !!content.content, 
          mainKeyword: content.mainKeyword 
        });
        toast.error('Missing required fields for publishing content');
        return null;
      }
      
      // In a real implementation, this would call an API to publish the content
      const mockId = 'published-' + Date.now();
      
      // Update state with published content info
      if (content.metaTitle) {
        dispatch({ type: 'SET_META_TITLE', payload: content.metaTitle });
      }
      
      if (content.metaDescription) {
        dispatch({ type: 'SET_META_DESCRIPTION', payload: content.metaDescription });
      }
      
      // Set saving state to false
      dispatch({ type: 'SET_SAVING', payload: false });
      
      return mockId;
    } catch (error) {
      console.error('Error publishing content:', error);
      dispatch({ type: 'SET_SAVING', payload: false });
      return null;
    }
  };

  return {
    saveContentToDraft,
    saveContentToPublished
  };
};
