
import { useState } from 'react';
import { useContentRepurposing } from '@/components/content-repurposing/hooks';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';

export const useContentRepurposingPage = () => {
  const {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isDeleting,
    isSaving,
    savedContentFormats,
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
    handleDeleteActiveFormat,
    resetContent,
    saveAllFormats
  } = useContentRepurposing();
  
  // State to track if all formats are being saved
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  
  /**
   * Handler for saving all generated content formats
   */
  const handleSaveAllContent = async (): Promise<boolean> => {
    if (!content || !generatedContents || Object.keys(generatedContents).length === 0) {
      toast.error('No content to save');
      return false;
    }
    
    try {
      setIsSavingAll(true);
      // Get all format IDs and mark them as saved in UI state
      const formatIds = await saveAllFormats();
      
      if (formatIds.length === 0) {
        toast.info('All formats are already saved');
        return true;
      }
      
      toast.success(`Successfully saved ${formatIds.length} content format${formatIds.length > 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error saving all content:', error);
      toast.error('Error saving all content formats');
      return false;
    } finally {
      setIsSavingAll(false);
    }
  };

  return {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isDeleting,
    isSaving,
    isSavingAll,
    savedContentFormats,
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
    handleDeleteActiveFormat,
    resetContent
  };
};
