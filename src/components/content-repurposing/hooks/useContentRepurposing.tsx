
import { useState } from 'react';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentDialog } from './repurposing/useContentDialog';
import { useContentActions } from './repurposing/useContentActions';
import { useContent } from '@/contexts/content';

export const useContentRepurposing = () => {
  // Get the deleteContentItem function from the content context
  const { deleteContentItem: contextDeleteContentItem } = useContent();
  
  // Compose hooks for different functionality
  const { content, handleContentSelection } = useContentSelection();
  
  // Pass content to dependent hooks
  const {
    selectedFormats,
    generatedContents,
    isGenerating,
    isRegenerating,
    activeFormat,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    handleRegenerateContent,
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
    isRegenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    isDeleting,
    isSaving,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleRegenerateContent,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    findRepurposedContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    deleteContentItem: contextDeleteContentItem,
  };
};

export default useContentRepurposing;
