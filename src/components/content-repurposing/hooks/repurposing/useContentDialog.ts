
import { useState } from 'react';
import { toast } from 'sonner';
import { GeneratedContentFormat } from './types';

export const useContentDialog = (findRepurposedContent: (originalContentId: string, formatId: string) => string | null) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState<boolean>(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<GeneratedContentFormat | null>(null);
  
  const handleOpenRepurposedContent = (contentId: string, formatId: string) => {
    const repurposedContent = findRepurposedContent(contentId, formatId);
    
    if (repurposedContent) {
      // Find the format name
      const format = contentFormats.find(f => f.id === formatId);
      
      setSelectedRepurposedContent({
        content: repurposedContent,
        formatId: formatId,
        contentId: contentId,
        title: format?.name || 'Repurposed Content'
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

// Add import for contentFormats
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
