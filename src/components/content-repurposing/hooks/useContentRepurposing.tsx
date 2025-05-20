
import { useState } from 'react';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentDialog } from './repurposing/useContentDialog';
import { useContentActions } from './repurposing/useContentActions';

export const useContentRepurposing = () => {
  // Compose hooks for different functionality
  const { content, handleContentSelection, resetContent } = useContentSelection();
  
  // Pass content to dependent hooks
  const {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    savedContentFormats,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    markAsSaved,
    saveAllFormats,
  } = useContentGeneration(content);
  
  const {
    contentItems,
    isDeleting,
    isSaving,
    findRepurposedContent,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  } = useContentActions(content);
  
  // contentDialog hook depends on findRepurposedContent
  const {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange: formatChangeHandler,
  } = useContentDialog(findRepurposedContent);
  
  // Handle deleting from the generated content view (when content is already selected)
  const handleDeleteActiveFormat = async (formatId: string): Promise<boolean> => {
    if (!content || !formatId) return false;
    return deleteRepurposedContent(content.id, formatId);
  };
  
  // Update this function to safely pass generated formats
  const handleOpenRepurposedContentWithFormats = (contentId: string, formatId: string) => {
    if (!contentId || !formatId) {
      console.error("Invalid content or format ID");
      return;
    }
    
    // Get all formats that have been generated for this content
    const availableFormats = generatedContents ? Object.keys(generatedContents) : [];
    handleOpenRepurposedContent(contentId, formatId, availableFormats);
  };
  
  // Wrapper for format change handler
  const handleFormatChange = (contentId: string, formatId: string) => {
    if (!contentId || !formatId) {
      console.error("Invalid content or format ID for format change");
      return;
    }
    formatChangeHandler(contentId, formatId);
  };
  
  // Ensure we always return properly defined values
  const safeGeneratedContents = generatedContents || {};
  const safeActiveFormat = activeFormat || null;
  
  return {
    content,
    contentItems: contentItems || [],
    selectedFormats: selectedFormats || [],
    generatedContents: safeGeneratedContents,
    isGenerating,
    activeFormat: safeActiveFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats: generatedFormats || [],
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
    findRepurposedContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    resetContent,
    markAsSaved,
    saveAllFormats,
  };
};

export default useContentRepurposing;
