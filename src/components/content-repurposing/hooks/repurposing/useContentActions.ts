
import { useState } from 'react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { getFormatByIdOrDefault } from '../../formats';
import { supabase } from '@/integrations/supabase/client';

// Define the metadata interface for proper typing
interface RepurposedContentMetadata {
  repurposedContentMap?: Record<string, string>;
  repurposedFormats?: string[];
  lastUpdated?: string;
  [key: string]: any; // For other potential metadata properties
}

export const useContentActions = (content: ContentItemType | null) => {
  const { contentItems, addContentItem, updateContentItem, deleteContentItem } = useContent();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Utility function to find content by original content ID and format
  const findRepurposedContent = (originalContentId: string, formatId: string): any | null => {
    if (!originalContentId || !formatId) {
      return null;
    }
    
    try {
      // First check in the context's contentItems
      const originalContent = contentItems.find(item => item.id === originalContentId);
      
      // Cast the metadata to our type interface
      const metadata = originalContent?.metadata as RepurposedContentMetadata | undefined;
      
      // If found in context, use that data
      if (metadata && metadata.repurposedContentMap && metadata.repurposedContentMap[formatId]) {
        return {
          contentId: originalContentId,
          formatId,
          title: originalContent.title || 'Untitled',
          content: metadata.repurposedContentMap[formatId]
        };
      }
      
      // Fallback to localStorage data
      const savedData = localStorage.getItem(`repurposed_content_${originalContentId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.contents && parsedData.contents[formatId]) {
          return {
            contentId: originalContentId,
            formatId,
            title: originalContent?.title || 'Untitled',
            content: parsedData.contents[formatId]
          };
        }
      }
    } catch (error) {
      console.error('Error finding repurposed content:', error);
    }
    
    return null;
  };
  
  const copyToClipboard = (content: string) => {
    if (!content) {
      toast.error('No content to copy');
      return;
    }
    
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const downloadAsText = (content: string, formatName: string) => {
    if (!content || !formatName) {
      toast.error('No content to download');
      return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_${formatName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${a.download}`);
  };
  
  const saveAsNewContent = async (formatId: string, generatedContent: string): Promise<boolean> => {
    if (!content || !formatId || !generatedContent) {
      toast.error('Missing required data to save content');
      return false;
    }
    
    try {
      setIsSaving(true);
      const formatInfo = getFormatByIdOrDefault(formatId);
      const formatName = formatInfo.name;
      
      // Get the current metadata or initialize an empty object
      const currentMetadata = content.metadata ? 
        (typeof content.metadata === 'object' ? content.metadata : {}) : {};
      
      // Cast to our typed interface
      const typedMetadata = currentMetadata as RepurposedContentMetadata;
      
      // Get or initialize repurposed formats array and content map
      const repurposedFormats = typedMetadata.repurposedFormats || [];
      const repurposedContentMap = typedMetadata.repurposedContentMap || {};
      
      // Add the format to the list if not already present
      if (!repurposedFormats.includes(formatId)) {
        repurposedFormats.push(formatId);
      }
      
      // Store the actual repurposed content in the map
      repurposedContentMap[formatId] = generatedContent;
      
      // Update the content with the new metadata
      const updatedMetadata = {
        ...currentMetadata,
        repurposedFormats,
        repurposedContentMap,
        lastUpdated: new Date().toISOString()
      };
      
      // Update in context through updateContentItem
      await updateContentItem(content.id, {
        metadata: updatedMetadata
      });
      
      // Also directly update in database to ensure persistence
      const { error } = await supabase
        .from('content_items')
        .update({
          metadata: updatedMetadata
        })
        .eq('id', content.id);
      
      if (error) {
        console.error('Error updating content in database:', error);
        toast.error('Error saving to database, but local changes were saved');
      }
      
      toast.success(`${formatName} content saved successfully`);
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const deleteRepurposedContent = async (contentId: string, formatId: string): Promise<boolean> => {
    if (!contentId || !formatId) {
      toast.error('Missing required data to delete content');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      // Get the content item
      const originalContent = contentItems.find(item => item.id === contentId);
      if (!originalContent) {
        toast.error('Content not found');
        return false;
      }
      
      // Cast to our typed interface
      const currentMetadata = originalContent.metadata ? 
        (typeof originalContent.metadata === 'object' ? originalContent.metadata : {}) : {};
      
      const typedMetadata = currentMetadata as RepurposedContentMetadata;
      
      const repurposedFormats = typedMetadata.repurposedFormats || [];
      const repurposedContentMap = typedMetadata.repurposedContentMap || {};
      
      // Remove the format from the list and the content from the map
      const updatedFormats = repurposedFormats.filter(format => format !== formatId);
      const updatedContentMap = { ...repurposedContentMap };
      delete updatedContentMap[formatId];
      
      const updatedMetadata = {
        ...currentMetadata,
        repurposedFormats: updatedFormats,
        repurposedContentMap: updatedContentMap,
        lastUpdated: new Date().toISOString()
      };
      
      // Update the content with the new metadata using context
      await updateContentItem(contentId, {
        metadata: updatedMetadata
      });
      
      // Also directly update in database to ensure persistence
      const { error } = await supabase
        .from('content_items')
        .update({
          metadata: updatedMetadata
        })
        .eq('id', contentId);
      
      if (error) {
        console.error('Error updating content in database:', error);
        toast.error('Error deleting from database, but local changes were applied');
      }
      
      // Also update localStorage
      try {
        const savedData = localStorage.getItem(`repurposed_content_${contentId}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          if (parsedData.contents) {
            delete parsedData.contents[formatId];
          }
          
          if (parsedData.savedFormats) {
            parsedData.savedFormats = parsedData.savedFormats.filter((f: string) => f !== formatId);
          }
          
          if (parsedData.formats) {
            parsedData.formats = parsedData.formats.filter((f: string) => f !== formatId);
          }
          
          if (parsedData.activeFormat === formatId) {
            parsedData.activeFormat = Object.keys(parsedData.contents || {}).length > 0
              ? Object.keys(parsedData.contents)[0]
              : null;
          }
          
          localStorage.setItem(`repurposed_content_${contentId}`, JSON.stringify(parsedData));
        }
      } catch (localStorageError) {
        console.error('Error updating localStorage:', localStorageError);
      }
      
      toast.success('Content deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    contentItems,
    isDeleting,
    isSaving,
    findRepurposedContent,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  };
};
