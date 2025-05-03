
import { ContentBuilderState, ContentBuilderAction } from '../types';
import { toast } from 'sonner';

/**
 * Actions related to content publishing in the content builder
 */
export const createPublishActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Publish content to platform
  const publishContent = async (platform: string): Promise<boolean> => {
    if (!state.content) {
      toast.error("No content to publish");
      return false;
    }

    dispatch({ type: 'SET_IS_PUBLISHING', payload: true });
    
    try {
      // In a real implementation, this would call an API to publish the content
      console.log(`Publishing content to ${platform}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Content published to ${platform}`);
      
      // Mark the publishing step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
      
      return true;
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      toast.error(`Failed to publish to ${platform}`);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_PUBLISHING', payload: false });
    }
  };

  // Schedule content for publishing
  const scheduleContent = async (platform: string, date: Date): Promise<boolean> => {
    if (!state.content) {
      toast.error("No content to schedule");
      return false;
    }

    dispatch({ type: 'SET_IS_PUBLISHING', payload: true });
    
    try {
      // In a real implementation, this would call an API to schedule the content
      console.log(`Scheduling content for ${platform} on ${date}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Content scheduled for ${platform} on ${date.toLocaleDateString()}`);
      
      // Mark the publishing step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
      
      return true;
    } catch (error) {
      console.error(`Error scheduling for ${platform}:`, error);
      toast.error(`Failed to schedule for ${platform}`);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_PUBLISHING', payload: false });
    }
  };

  // Save content as draft
  const saveContentAsDraft = async (): Promise<string | null> => {
    if (!state.content) {
      toast.error("No content to save");
      return null;
    }

    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would call an API to save the content
      console.log(`Saving content as draft...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock content ID that would be returned from API
      const contentId = "draft-" + Date.now();
      
      toast.success("Content saved as draft");
      
      return contentId;
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
      return null;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };

  return {
    publishContent,
    scheduleContent,
    saveContentAsDraft
  };
};
