
import { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';

export const useContentDialog = (findRepurposedContent: (contentId: string, formatId: string) => any) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<any>(null);
  const [generatedFormats, setGeneratedFormats] = useState<string[]>([]);

  const handleOpenRepurposedContent = (contentId: string, formatId: string, availableFormats: string[] = []) => {
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
