
import { useState } from 'react';
import { toast } from 'sonner';
import { GeneratedContentFormat } from './types';
import { getFormatByIdOrDefault } from '../../formats';

export const useContentDialog = (findRepurposedContent: (originalContentId: string, formatId: string) => string | null) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState<boolean>(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<GeneratedContentFormat | null>(null);
  const [generatedFormats, setGeneratedFormats] = useState<string[]>([]); // Track generated formats
  
  const handleOpenRepurposedContent = (contentId: string, formatId: string, availableFormats: string[] = []) => {
    const repurposedContent = findRepurposedContent(contentId, formatId);
    
    if (repurposedContent) {
      // Find the format name
      const format = getFormatByIdOrDefault(formatId);
      
      setSelectedRepurposedContent({
        content: repurposedContent,
        formatId: formatId,
        contentId: contentId,
        title: format.name
      });
      setGeneratedFormats(availableFormats); // Store the available formats
      setRepurposedDialogOpen(true);
    } else {
      toast.error('Repurposed content not found');
    }
  };
  
  const handleCloseRepurposedDialog = () => {
    setRepurposedDialogOpen(false);
    setSelectedRepurposedContent(null);
    setGeneratedFormats([]);
  };
  
  return {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
  };
};
