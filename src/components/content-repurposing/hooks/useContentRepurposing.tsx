
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
  };
};

export default useContentRepurposing;
