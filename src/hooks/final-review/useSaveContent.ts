
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useContent } from '@/contexts/content';

/**
 * Hook for managing content saving and publishing functionality
 */
export const useSaveContent = () => {
  const { state, saveContentToDraft, saveContentToPublished } = useContentBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const { addContentItem, refreshContent } = useContent(); // Import refreshContent from the content context
  const navigate = useNavigate();

  const handleSaveToDraft = async (): Promise<void> => {
    try {
      setIsSaving(true);
      
      // Prepare content for saving
      const saveParams: SaveContentParams = {
        title: state.contentTitle || state.metaTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'draft',
        notes: ''
      };
      
      // Try saving using content builder context first
      const contentId = await saveContentToDraft(saveParams);
      
      // If that doesn't work, use the content context directly
      if (!contentId) {
        await addContentItem({
          title: saveParams.title,
          content: saveParams.content || '',
          status: 'draft',
          seo_score: state.seoScore,
          keywords: [state.mainKeyword, ...state.selectedKeywords],
        });
        
        // Force refresh the content list to make sure it shows up
        await refreshContent();
      }
      
      setIsSavedToDraft(true);
      toast.success('Content saved to drafts successfully');
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
        title: state.contentTitle || state.metaTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'published',
        notes: '',
        seoScore: state.seoScore
      };
      
      // Try publishing using content builder context
      let contentId = await saveContentToPublished(publishParams);
      
      // If that doesn't work, use the content context directly
      if (!contentId) {
        await addContentItem({
          title: publishParams.title,
          content: publishParams.content || '',
          status: 'published',
          seo_score: state.seoScore,
          keywords: [state.mainKeyword, ...state.selectedKeywords],
          // We're removing meta_description as it's not part of the accepted type
        });
        
        // Force refresh the content list to make sure it shows up
        await refreshContent();
      }
      
      toast.success('Content published successfully');
      
      // Navigate back to content library with a highlight parameter
      setTimeout(() => {
        navigate('/content', { 
          state: { contentRefresh: true }
        });
      }, 1000);
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
