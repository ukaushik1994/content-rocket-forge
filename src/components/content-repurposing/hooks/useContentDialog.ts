
import { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';

export const useContentDialog = (findRepurposedContent: (contentId: string, formatId: string) => any) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<any>(null);
  const [generatedFormats, setGeneratedFormats] = useState<string[]>([]);

  const handleOpenRepurposedContent = (contentId: string, formatId: string, availableFormats: string[] = []) => {
    // Ensure we have valid IDs before attempting to find content
    if (!contentId || !formatId) {
      console.warn('Invalid content or format ID provided');
      return;
    }
    
    const repurposedContent = findRepurposedContent(contentId, formatId);
    if (repurposedContent) {
      setSelectedRepurposedContent(repurposedContent);
      setGeneratedFormats(Array.isArray(availableFormats) ? availableFormats : []);
      setRepurposedDialogOpen(true);
    }
  };

  const handleCloseRepurposedDialog = () => {
    setRepurposedDialogOpen(false);
    setSelectedRepurposedContent(null);
  };

  const handleFormatChange = (contentId: string, formatId: string) => {
    // Ensure we have valid IDs before attempting to find content
    if (!contentId || !formatId) {
      console.warn('Invalid content or format ID provided for format change');
      return;
    }
    
    const repurposedContent = findRepurposedContent(contentId, formatId);
    if (repurposedContent) {
      setSelectedRepurposedContent(repurposedContent);
    }
  };

  return {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange,
  };
};
