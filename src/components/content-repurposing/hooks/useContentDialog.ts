
import { useState } from 'react';
import { RepurposedContentRecord } from '@/services/repurposedContentService';

type FindRepurposedContentFn = (contentId: string, formatId: string) => Promise<RepurposedContentRecord | null>;

export const useContentDialog = (findRepurposedContent: FindRepurposedContentFn) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<RepurposedContentRecord | null>(null);
  const [isLoadingFormat, setIsLoadingFormat] = useState(false);
  const [generatedFormats, setGeneratedFormats] = useState<string[]>([]);

  const handleOpenRepurposedContent = async (contentId: string, formatId: string, availableFormats: string[] = []) => {
    setIsLoadingFormat(true);
    try {
      const repurposedContent = await findRepurposedContent(contentId, formatId);
      if (repurposedContent) {
        setSelectedRepurposedContent(repurposedContent);
        setGeneratedFormats(Array.isArray(availableFormats) ? availableFormats : []);
        setRepurposedDialogOpen(true);
      }
    } catch (error) {
      console.error('Error opening repurposed content:', error);
    } finally {
      setIsLoadingFormat(false);
    }
  };

  const handleCloseRepurposedDialog = () => {
    setRepurposedDialogOpen(false);
    setSelectedRepurposedContent(null);
  };

  const handleFormatChange = async (contentId: string, formatId: string) => {
    if (!contentId || !formatId) return;
    
    setIsLoadingFormat(true);
    try {
      const repurposedContent = await findRepurposedContent(contentId, formatId);
      if (repurposedContent) {
        setSelectedRepurposedContent(repurposedContent);
      }
    } catch (error) {
      console.error('Error loading format content:', error);
    } finally {
      setIsLoadingFormat(false);
    }
  };

  return {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isLoadingFormat,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange,
  };
};
