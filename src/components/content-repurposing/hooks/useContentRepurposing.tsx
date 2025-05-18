
import { useState } from 'react';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentDialog } from './repurposing/useContentDialog';
import { useContentActions } from './repurposing/useContentActions';

export const useContentRepurposing = () => {
  // Compose hooks for different functionality
  const { content, handleContentSelection } = useContentSelection();
  
  // Pass content to dependent hooks
  const {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
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
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
  } = useContentDialog(findRepurposedContent);
  
  // Handle deleting from the generated content view (when content is already selected)
  const handleDeleteActiveFormat = async (formatId: string): Promise<boolean> => {
    if (!content) return false;
    return deleteRepurposedContent(content.id, formatId);
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
    isDeleting,
    isSaving,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    findRepurposedContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
  };
};

export default useContentRepurposing;
