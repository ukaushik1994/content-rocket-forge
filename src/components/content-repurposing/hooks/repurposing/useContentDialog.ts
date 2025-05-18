
import { useState } from 'react';
import { toast } from 'sonner';
import { GeneratedContentFormat } from './types';
import { getFormatByIdOrDefault } from '../../formats';

export const useContentDialog = (
  findRepurposedContent: (originalContentId: string, formatId: string) => string | null
) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState<boolean>(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<GeneratedContentFormat | null>(null);
  const [generatedFormats, setGeneratedFormats] = useState<string[]>([]); // Track generated formats
  const [isLoadingFormat, setIsLoadingFormat] = useState<boolean>(false);
  
  const handleOpenRepurposedContent = (contentId: string, formatId: string, availableFormats: string[] = []) => {
    setIsLoadingFormat(true);
    
    try {
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
    } catch (error) {
      console.error('Error opening repurposed content:', error);
      toast.error('Failed to load repurposed content');
    } finally {
      setIsLoadingFormat(false);
    }
  };
  
  const handleCloseRepurposedDialog = () => {
    setRepurposedDialogOpen(false);
    setSelectedRepurposedContent(null);
    setGeneratedFormats([]);
  };
  
  const handleFormatChange = (contentId: string, formatId: string) => {
    setIsLoadingFormat(true);
    
    try {
      const repurposedContent = findRepurposedContent(contentId, formatId);
      
      if (repurposedContent) {
        const format = getFormatByIdOrDefault(formatId);
        
        setSelectedRepurposedContent({
          content: repurposedContent,
          formatId: formatId,
          contentId: contentId,
          title: format.name
        });
      } else {
        toast.error(`Failed to load ${getFormatByIdOrDefault(formatId).name} content`);
      }
    } catch (error) {
      console.error('Error changing format:', error);
      toast.error('Failed to switch format');
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
