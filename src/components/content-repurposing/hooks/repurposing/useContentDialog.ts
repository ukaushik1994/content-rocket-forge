
import { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { GeneratedContentFormat } from './types';

export const useContentDialog = (findRepurposedContent: (originalContentId: string, formatId: string) => ContentItemType | null) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState<boolean>(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<GeneratedContentFormat | null>(null);
  
  const handleOpenRepurposedContent = (contentId: string, formatId: string) => {
    const repurposedItem = findRepurposedContent(contentId, formatId);
    
    if (repurposedItem) {
      setSelectedRepurposedContent({
        content: repurposedItem.content || '',
        formatId: formatId,
        contentId: repurposedItem.id,
        title: repurposedItem.title
      });
      setRepurposedDialogOpen(true);
    } else {
      toast.error('Repurposed content not found');
    }
  };
  
  const handleCloseRepurposedDialog = () => {
    setRepurposedDialogOpen(false);
    setSelectedRepurposedContent(null);
  };
  
  return {
    repurposedDialogOpen,
    selectedRepurposedContent,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
  };
};

// Add import for toast
import { toast } from 'sonner';
