
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
  const { addContentItem, refreshContent } = useContent();
  const navigate = useNavigate();

  const handleSaveToDraft = async (): Promise<void> => {
    try {
      setIsSaving(true);
      
      // Prepare content for saving with extended metadata
      const saveParams: SaveContentParams = {
        title: state.contentTitle || state.metaTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'draft',
        notes: '',
        outline: state.outline,
        serpSelections: state.serpSelections,
        serpData: state.serpData
      };
      
      console.log('[useSaveContent] Saving content with params:', saveParams);
      
      // Try saving using content builder context first
      let contentId = await saveContentToDraft(saveParams);
      
      // If that doesn't work, use the content context directly
      if (!contentId) {
        console.log('[useSaveContent] No content ID returned, adding directly to content repository');
        await addContentItem({
          title: saveParams.title,
          content: saveParams.content || '',
          status: 'draft',
          seo_score: state.seoScore,
          keywords: [state.mainKeyword, ...state.selectedKeywords],
          metadata: {
            metaTitle: state.metaTitle,
            metaDescription: state.metaDescription,
            outline: state.outline,
            serpSelections: state.serpSelections
          }
        });
      }
      
      // Force refresh the content list to make sure it shows up
      await refreshContent();
      
      setIsSavedToDraft(true);
      toast.success('Content saved to drafts successfully');
      
      // Navigate to drafts page
      setTimeout(() => {
        navigate('/drafts', { state: { contentRefresh: true } });
      }, 1000);
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
      
      // Prepare content for publishing with extended metadata
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
        seoScore: state.seoScore,
        outline: state.outline,
        serpSelections: state.serpSelections,
        serpData: state.serpData
      };
      
      console.log('[useSaveContent] Publishing content with params:', publishParams);
      
      // Try publishing using content builder context
      let contentId = await saveContentToPublished(publishParams);
      
      // If that doesn't work, use the content context directly
      if (!contentId) {
        console.log('[useSaveContent] No content ID returned, adding directly to content repository');
        await addContentItem({
          title: publishParams.title,
          content: publishParams.content || '',
          status: 'published',
          seo_score: state.seoScore,
          keywords: [state.mainKeyword, ...state.selectedKeywords],
          metadata: {
            metaTitle: state.metaTitle,
            metaDescription: state.metaDescription,
            outline: state.outline,
            serpSelections: state.serpSelections
          }
        });
        
        // Force refresh the content list
        await refreshContent();
      }
      
      toast.success('Content published successfully');
      
      // Navigate to drafts page with a refresh parameter
      sessionStorage.setItem('from_content_builder', 'true');
      sessionStorage.setItem('content_save_timestamp', Date.now().toString());
      
      setTimeout(() => {
        navigate('/drafts', { 
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
