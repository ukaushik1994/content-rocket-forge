
import { useState, useCallback } from 'react';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentDialog } from './repurposing/useContentDialog';
import { useContentActions } from './repurposing/useContentActions';

export const useContentRepurposing = () => {
  const { content, handleContentSelection, resetContent } = useContentSelection();
  
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
  
  const {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange: formatChangeHandler,
  } = useContentDialog(() => null); // Simplified for now
  
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
  
  return {
    content,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
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
    deleteRepurposedContent,
    resetContent,
  };
};

export default useContentRepurposing;
