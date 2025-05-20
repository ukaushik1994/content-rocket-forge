
import { useState, useCallback } from 'react';
import { GeneratedContentFormat } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useContentDialog = (
  findRepurposedContentFn: (contentId: string, formatId: string) => Promise<any | null>
) => {
  const [repurposedDialogOpen, setRepurposedDialogOpen] = useState(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<GeneratedContentFormat | null>(null);
  const [generatedFormats, setGeneratedFormats] = useState<string[]>([]);
  
  // Function to open the dialog with the selected content
  const handleOpenRepurposedContent = useCallback(async (
    contentId: string, 
    formatId: string,
    availableFormats: string[] = []
  ) => {
    if (!contentId || !formatId) {
      console.error("Missing required IDs");
      return;
    }
    
    try {
      const content = await findRepurposedContentFn(contentId, formatId);
      
      if (content) {
        setSelectedRepurposedContent({
          contentId: contentId,
          formatId: formatId,
          title: content.title || '',
          content: content.content || '',
        });
        
        // If availableFormats is empty, fetch all formats for this content from the database
        if (availableFormats.length === 0) {
          const { data, error } = await supabase
            .from('repurposed_contents')
            .select('format_code')
            .eq('content_id', contentId);
            
          if (!error && data) {
            setGeneratedFormats(data.map(item => item.format_code));
          } else {
            setGeneratedFormats([formatId]);
          }
        } else {
          setGeneratedFormats(availableFormats);
        }
        
        setRepurposedDialogOpen(true);
      }
    } catch (error) {
      console.error("Error opening repurposed content:", error);
    }
  }, [findRepurposedContentFn]);
  
  // Function to close the dialog
  const handleCloseRepurposedDialog = useCallback(() => {
    setRepurposedDialogOpen(false);
    setSelectedRepurposedContent(null);
  }, []);
  
  // Function to change the current format in the dialog
  const handleFormatChange = useCallback(async (contentId: string, formatId: string) => {
    try {
      const content = await findRepurposedContentFn(contentId, formatId);
      
      if (content) {
        setSelectedRepurposedContent({
          contentId: contentId,
          formatId: formatId,
          title: content.title || '',
          content: content.content || '',
        });
      }
    } catch (error) {
      console.error("Error changing format:", error);
    }
  }, [findRepurposedContentFn]);
  
  return {
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    handleFormatChange
  };
};
