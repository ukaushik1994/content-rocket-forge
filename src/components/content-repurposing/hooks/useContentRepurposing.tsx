
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
  // Use contentItems directly from the context instead of calling getAllContent
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
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    saveAsNewContent,
    handleSaveAllContent,
    deleteRepurposedContent,
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

  // Add the missing functions from the build errors
  const handleDeleteActiveFormat = async (): Promise<boolean> => {
    if (!content || !activeFormat) {
      toast.error('No content selected to delete');
      return false;
    }

    setIsDeleting(true);
    try {
      const success = await deleteRepurposedContent(activeFormat);
      if (success) {
        toast.success(`Content format deleted successfully`);
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

  const markAsSaved = (formatId: string) => {
    if (!savedContentFormats.includes(formatId)) {
      setSavedContentFormats(prev => [...prev, formatId]);
    }
  };

  const saveAllFormats = () => {
    const formatIds = Object.keys(generatedContents || {});
    setSavedContentFormats(prev => [...new Set([...prev, ...formatIds])]);
  };

  // Add this function to update savedContentFormats state
  const [, setSavedContentFormats] = useState<string[]>(savedContentFormats);
  
  return {
    content,
    contentItems: contentItems || [], // Ensure we always return an array
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
  };
};

export default useContentRepurposing;
