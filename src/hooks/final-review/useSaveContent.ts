
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

export const useSaveContent = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const { state } = useContentBuilder();
  
  // Get saveContentToDraft and saveContentToPublished from context
  const { saveContentToDraft, saveContentToPublished } = useContentBuilder();
  
  const handleSaveToDraft = useCallback(async () => {
    if (!state.content) {
      toast.error('No content to save');
      return null;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare save options
      const saveOptions = {
        title: state.contentTitle || `Content - ${new Date().toLocaleDateString()}`,
        content: state.content,
        keywords: [state.mainKeyword, ...state.selectedKeywords.filter(k => k !== state.mainKeyword)].filter(Boolean),
        seoScore: state.seoScore || 0,
        metadata: {
          contentType: state.contentType,
          metaTitle: state.metaTitle,
          metaDescription: state.metaDescription,
          outline: state.outlineSections ? state.outlineSections.map(s => s.title || s.content) : [],
          serpSelections: state.serpSelections,
          selectedSolution: state.selectedSolution ? state.selectedSolution.id : null,
        }
      };
      
      // Call the saveContentToDraft function from context
      const contentId = await saveContentToDraft(saveOptions);
      
      if (contentId) {
        toast.success('Content saved to drafts');
        setIsSavedToDraft(true);
      }
      
      return contentId;
    } catch (error) {
      console.error('Error saving content to draft:', error);
      toast.error('Failed to save content');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [state, saveContentToDraft]);
  
  const handlePublish = useCallback(async () => {
    if (!state.content) {
      toast.error('No content to publish');
      return null;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare publish options
      const publishOptions = {
        title: state.contentTitle || `Content - ${new Date().toLocaleDateString()}`,
        content: state.content,
        keywords: [state.mainKeyword, ...state.selectedKeywords.filter(k => k !== state.mainKeyword)].filter(Boolean),
        seoScore: state.seoScore || 0,
        status: 'published',
        metadata: {
          contentType: state.contentType,
          metaTitle: state.metaTitle,
          metaDescription: state.metaDescription,
          outline: state.outlineSections ? state.outlineSections.map(s => s.title || s.content) : [],
          serpSelections: state.serpSelections,
          selectedSolution: state.selectedSolution ? state.selectedSolution.id : null,
        }
      };
      
      // Call the saveContentToPublished function from context
      const contentId = await saveContentToPublished(publishOptions);
      
      if (contentId) {
        toast.success('Content published successfully');
      }
      
      return contentId;
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [state, saveContentToPublished]);
  
  return {
    isSaving,
    isSavedToDraft,
    handleSaveToDraft,
    handlePublish
  };
};
