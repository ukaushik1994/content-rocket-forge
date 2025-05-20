
import { useState } from 'react';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentActions } from './repurposing/useContentActions';
import { useRepurposedDialog } from './repurposing/useRepurposedDialog';
import { ContentRepurposingHookReturn } from './repurposing/types/hook-types';

export const useContentRepurposing = (): ContentRepurposingHookReturn => {
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
    fetchSavedFormats,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  } = useContentActions(content);
  
  // Use our new dialog hook that depends on findRepurposedContent
  const {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContentWithFormats,
    handleCloseRepurposedDialog,
    handleFormatChange,
  } = useRepurposedDialog(findRepurposedContent);
  
  // Handle deleting from the generated content view (when content is already selected)
  const handleDeleteActiveFormat = async (formatId: string): Promise<boolean> => {
    if (!content || !formatId) return false;
    return deleteRepurposedContent(content.id, formatId);
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
