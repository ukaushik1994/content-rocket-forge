
import { useState, useCallback, useEffect } from 'react';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentDialog } from './repurposing/useContentDialog';
import { useContentActions } from './repurposing/useContentActions';
import { repurposedContentService } from '@/services/repurposedContentService';
import { toast } from 'sonner';

export const useContentRepurposing = () => {
  const { content, handleContentSelection, resetContent } = useContentSelection();
  const { contentItems } = useContent();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  
  const handleContentChange = useCallback(() => {
    if (content && content.id !== currentContentId) {
      console.log('Content changed to:', content.id);
      setCurrentContentId(content.id);
      return true;
    }
    return false;
  }, [content, currentContentId]);
  
  if (content && handleContentChange()) {
    console.log('Resetting content-dependent state for new content:', content.id);
  }
  
  const {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    savedContentFormats,
    isSaving,
    isSavingAll,
    isLoadingRepurposed,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    saveAsNewContent,
    handleSaveAllContent,
    deleteRepurposedContent,
    refreshRepurposedData,
  } = useContentGeneration(content);
  
  const {
    copyToClipboard,
    downloadAsText,
  } = useContentActions(content);

  // Function to find repurposed content
  const findRepurposedContent = async (contentId: string, formatId: string) => {
    try {
      return await repurposedContentService.getRepurposedContentByFormat(contentId, formatId);
    } catch (error) {
      console.error('Error finding repurposed content:', error);
      toast.error('Failed to load repurposed content');
      return null;
    }
  };
  
  const {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isLoadingFormat,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange: formatChangeHandler,
  } = useContentDialog(findRepurposedContent);
  
  const handleOpenRepurposedContentWithFormats = (contentId: string, formatId: string) => {
    const availableFormats = Object.keys(generatedContents || {}).filter(id => !!id);
    console.log('Available formats for content', contentId, ':', availableFormats);
    handleOpenRepurposedContent(contentId, formatId, availableFormats);
  };
  
  const handleFormatChange = (contentId: string, formatId: string) => {
    if (contentId && formatId) {
      formatChangeHandler(contentId, formatId);
    }
  };

  const handleDeleteActiveFormat = async (): Promise<boolean> => {
    if (!content || !activeFormat) {
      toast.error('No content selected to delete');
      return false;
    }

    setIsDeleting(true);
    try {
      const success = await deleteRepurposedContent(activeFormat);
      if (success) {
        toast.success('Content format deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting active format:', error);
      toast.error('Failed to delete content format');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // These functions are now handled by the database sync
  const markAsSaved = useCallback((formatId: string) => {
    // This is now handled automatically by the database sync
    refreshRepurposedData();
  }, [refreshRepurposedData]);

  const saveAllFormats = useCallback(() => {
    // This is now handled automatically by the database sync
    refreshRepurposedData();
  }, [refreshRepurposedData]);
  
  return {
    content,
    contentItems: contentItems || [],
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isSaving,
    isSavingAll,
    isDeleting,
    savedContentFormats,
    isLoadingFormat,
    isLoadingRepurposed,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleOpenRepurposedContentWithFormats,
    handleCloseRepurposedDialog,
    handleFormatChange,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    handleSaveAllContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    markAsSaved,
    saveAllFormats,
    resetContent,
    refreshRepurposedData,
  };
};

export default useContentRepurposing;
