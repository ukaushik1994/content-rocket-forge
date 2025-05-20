import { useState } from 'react';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ContentActionHookReturn } from './types/action-types';
import { 
  copyToClipboard, 
  downloadAsText 
} from './utils/content-action-utils';
import {
  findRepurposedContent as findContent,
  fetchSavedFormats as fetchFormats,
  saveContent,
  deleteRepurposedContent as deleteContent
} from './utils/database-operations';

export const useContentActions = (content: ContentItemType | null): ContentActionHookReturn => {
  const { contentItems, updateContentItem } = useContent();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Find repurposed content wrapper
  const findRepurposedContent = async (originalContentId: string, formatId: string) => {
    return findContent(originalContentId, formatId, contentItems);
  };
  
  // Fetch saved formats wrapper
  const fetchSavedFormats = async (contentId: string) => {
    return fetchFormats(contentId);
  };
  
  // Save content wrapper
  const saveAsNewContent = async (formatId: string, generatedContent: string) => {
    if (!content) return false;
    
    try {
      setIsSaving(true);
      return await saveContent(
        content.id, 
        formatId, 
        generatedContent, 
        content.title, 
        content.user_id, 
        updateContentItem
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete content wrapper
  const deleteRepurposedContent = async (contentId: string, formatId: string) => {
    if (!contentId || !formatId) return false;
    
    try {
      setIsDeleting(true);
      return await deleteContent(contentId, formatId, contentItems, updateContentItem);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    contentItems,
    isDeleting,
    isSaving,
    findRepurposedContent,
    fetchSavedFormats,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  };
};
