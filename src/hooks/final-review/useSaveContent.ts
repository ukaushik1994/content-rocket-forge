
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types';

export const useSaveContent = () => {
  const { state, setContent, setMetaTitle, setMetaDescription } = useContentBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingPublished, setIsSavingPublished] = useState(false);
  
  // These are mock functions, in a real app they would be in the context
  const saveContentToDraft = async (content: SaveContentParams): Promise<boolean> => {
    console.log('Saving content to draft:', content);
    return true;
  };

  const saveContentToPublished = async (content: SaveContentParams): Promise<boolean> => {
    console.log('Publishing content:', content);
    return true;
  };

  const saveToDraft = async (title: string, content: string, notes?: string) => {
    setIsSavingDraft(true);
    
    try {
      // Prepare the content object
      const contentData: SaveContentParams = {
        title: title,
        content: content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        seoScore: state.seoScore,
        metaTitle: state.metaTitle || title,
        metaDescription: state.metaDescription,
        outline: state.outline,
        serpSelections: state.serpSelections,
        serpData: state.serpData,
        status: 'draft', // Add status field
        notes // Add notes field
      };
      
      // Save to draft (this would call an API in a real implementation)
      const success = await saveContentToDraft(contentData);
      
      if (success) {
        toast.success('Content saved to drafts');
        return true;
      } else {
        toast.error('Failed to save content');
        return false;
      }
    } catch (error) {
      console.error('Error saving to draft:', error);
      toast.error('An error occurred while saving');
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };
  
  const saveAndPublish = async (title: string, content: string, notes?: string) => {
    setIsSavingPublished(true);
    
    try {
      // Check for missing metadata
      if (!state.metaTitle) {
        setMetaTitle(title); // Use content title as fallback
      }
      
      if (!state.metaDescription) {
        // Generate a simple meta description from the first 150 chars
        const description = content.substring(0, 150).trim() + '...';
        setMetaDescription(description);
      }
      
      // Prepare the content object
      const contentData: SaveContentParams = {
        title: title,
        content: content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        seoScore: state.seoScore,
        metaTitle: state.metaTitle || title,
        metaDescription: state.metaDescription,
        outline: state.outline,
        serpSelections: state.serpSelections,
        serpData: state.serpData,
        status: 'published', // Add status field
        notes // Add notes field
      };
      
      // Publish the content (this would call an API in a real implementation)
      const success = await saveContentToPublished(contentData);
      
      if (success) {
        toast.success('Content published successfully');
        return true;
      } else {
        toast.error('Failed to publish content');
        return false;
      }
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('An error occurred while publishing');
      return false;
    } finally {
      setIsSavingPublished(false);
    }
  };

  return {
    isSaving,
    isSavingDraft,
    isSavingPublished,
    saveToDraft,
    saveAndPublish,
  };
};
