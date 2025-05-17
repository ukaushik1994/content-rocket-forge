
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
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
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
      
      // Save SERP selections if available
      if (state.serpSelections && state.serpSelections.length > 0) {
        content.serpSelections = state.serpSelections;
      }
      
      // Save outline if available
      if (state.outline && state.outline.length > 0) {
        content.outline = state.outline;
      }
      
      // Save meta information if available
      if (state.metaTitle) {
        content.metaTitle = state.metaTitle;
      }
      
      if (state.metaDescription) {
        content.metaDescription = state.metaDescription;
      }

      // Create metadata object for storage
      const metadata = {
        metaTitle: state.metaTitle || content.metaTitle,
        metaDescription: state.metaDescription || content.metaDescription
      };
      
      // Add metadata to content as JSON string
      content.metadata = JSON.stringify(metadata);
      
      // Update state with saved content info
      if (content.metaTitle) {
        dispatch({ type: 'SET_META_TITLE', payload: content.metaTitle });
      }
      
      if (content.metaDescription) {
        dispatch({ type: 'SET_META_DESCRIPTION', payload: content.metaDescription });
      }
      
      if (content.title) {
        dispatch({ type: 'SET_CONTENT_TITLE', payload: content.title });
      }
      
      // Set saving state to false
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      
      return mockId;
    } catch (error) {
      console.error('Error saving content to draft:', error);
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      return null;
    }
  };
  
  // Implementation for publishing content
  const saveContentToPublished = async (content: SaveContentParams): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
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
      
      // Save SERP selections if available
      if (state.serpSelections && state.serpSelections.length > 0) {
        content.serpSelections = state.serpSelections;
      }
      
      // Save outline if available
      if (state.outline && state.outline.length > 0) {
        content.outline = state.outline;
      }
      
      // Save meta information if available
      if (state.metaTitle) {
        content.metaTitle = state.metaTitle;
      }
      
      if (state.metaDescription) {
        content.metaDescription = state.metaDescription;
      }

      // Create metadata object for storage
      const metadata = {
        metaTitle: state.metaTitle || content.metaTitle,
        metaDescription: state.metaDescription || content.metaDescription
      };
      
      // Add metadata to content as JSON string
      content.metadata = JSON.stringify(metadata);
      
      // In a real implementation, this would call an API to publish the content
      const mockId = 'published-' + Date.now();
      
      // Update state with published content info
      if (content.metaTitle) {
        dispatch({ type: 'SET_META_TITLE', payload: content.metaTitle });
      }
      
      if (content.metaDescription) {
        dispatch({ type: 'SET_META_DESCRIPTION', payload: content.metaDescription });
      }
      
      if (content.title) {
        dispatch({ type: 'SET_CONTENT_TITLE', payload: content.title });
      }
      
      // Set saving state to false
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      
      return mockId;
    } catch (error) {
      console.error('Error publishing content:', error);
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      return null;
    }
  };

  return {
    saveContentToDraft,
    saveContentToPublished
  };
};
