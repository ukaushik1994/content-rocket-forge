
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';

/**
 * Hook for managing content saving and publishing functionality
 */
export const useSaveContent = () => {
  const { state, saveContentToDraft, saveContentToPublished } = useContentBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const navigate = useNavigate();

  const handleSaveToDraft = async (): Promise<void> => {
    try {
      setIsSaving(true);
      
      // Prepare content for saving
      const saveParams: SaveContentParams = {
        title: state.contentTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'draft',
        notes: ''
      };
      
      const contentId = await saveContentToDraft(saveParams);
      
      if (contentId) {
        setIsSavedToDraft(true);
        toast.success('Content saved to drafts successfully');
      } else {
        toast.error('Error saving content to drafts');
      }
    } catch (error) {
      console.error('Error saving content to draft:', error);
      toast.error('Failed to save content to drafts');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (): Promise<void> => {
    try {
      setIsSaving(true);
      
      // Prepare content for publishing
      const publishParams: SaveContentParams = {
        title: state.contentTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'published',
        notes: ''
      };
      
      const contentId = await saveContentToPublished(publishParams);
      
      if (contentId) {
        toast.success('Content published successfully');
        // Navigate back to content library
        setTimeout(() => {
          navigate('/content');
        }, 1000);
      } else {
        toast.error('Error publishing content');
      }
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isSavedToDraft,
    handleSaveToDraft,
    handlePublish
  };
};
