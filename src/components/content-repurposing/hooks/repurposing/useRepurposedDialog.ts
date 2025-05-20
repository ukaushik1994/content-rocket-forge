
import { useCallback } from 'react';
import { useContentDialog } from './useContentDialog';

export const useRepurposedDialog = (findRepurposedContent: (contentId: string, formatId: string) => Promise<any | null>) => {
  // Use the base dialog hook
  const {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange: formatChangeHandler,
  } = useContentDialog(findRepurposedContent);
  
  // Create a more specialized handler that also fetches available formats
  const handleOpenRepurposedContentWithFormats = useCallback(async (contentId: string, formatId: string) => {
    if (!contentId || !formatId) {
      console.error("Invalid content or format ID");
      return;
    }
    
    try {
      // Just pass the call through to the base handler
      // We don't need to fetch formats separately as it's handled in useContentDialog now
      await handleOpenRepurposedContent(contentId, formatId);
    } catch (error) {
      console.error("Error opening repurposed content:", error);
    }
  }, [handleOpenRepurposedContent]);
  
  // Wrapper for format change handler
  const handleFormatChange = useCallback((contentId: string, formatId: string) => {
    if (!contentId || !formatId) {
      console.error("Invalid content or format ID for format change");
      return;
    }
    formatChangeHandler(contentId, formatId);
  }, [formatChangeHandler]);
  
  return {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContentWithFormats,
    handleCloseRepurposedDialog,
    handleFormatChange,
  };
};
