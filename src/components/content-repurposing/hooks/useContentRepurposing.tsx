
import { useState, useCallback } from 'react';
import { useContentSelection } from './repurposing/useContentSelection';
import { useContentGeneration } from './repurposing/useContentGeneration';
import { useContentDialog } from './repurposing/useContentDialog';
import { useContentActions } from './repurposing/useContentActions';

export const useContentRepurposing = () => {
  // Compose hooks for different functionality
  const { content, handleContentSelection, resetContent } = useContentSelection();
  
  // Track when content changes to prevent duplicate state
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  
  // Update currentContentId when content changes
  const handleContentChange = useCallback(() => {
    if (content && content.id !== currentContentId) {
      console.log('Content changed to:', content.id);
      setCurrentContentId(content.id);
      return true;
    }
    return false;
  }, [content, currentContentId]);
  
  // Only update dependent hooks when content changes
  if (content && handleContentChange()) {
    console.log('Resetting content-dependent state for new content:', content.id);
  }
  
  // Pass content to dependent hooks with proper cleanup on content change
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
    if (!content) return false;
    return deleteRepurposedContent(content.id, formatId);
  };
  
  // Update this function to safely pass generated formats
  const handleOpenRepurposedContentWithFormats = (contentId: string, formatId: string) => {
    // Get all formats that have been generated for this content
    if (!generatedContents) {
      console.warn('generatedContents is undefined, using empty object');
    }
    
    const availableFormats = Object.keys((generatedContents || {})).filter(id => !!id); // Filter out empty IDs
    console.log('Available formats for content', contentId, ':', availableFormats);
    handleOpenRepurposedContent(contentId, formatId, availableFormats);
  };
  
  // Wrapper for format change handler
  const handleFormatChange = (contentId: string, formatId: string) => {
    if (contentId && formatId) {
      formatChangeHandler(contentId, formatId);
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
