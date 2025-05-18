
import { useState } from 'react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';

export const useContentActions = (content: ContentItemType | null) => {
  const { contentItems, addContentItem, updateContentItem, deleteContentItem } = useContent();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Utility function to find content by original content ID and format
  const findRepurposedContent = (originalContentId: string, formatId: string): string | null => {
    // Find the content item
    const originalContent = contentItems.find(item => item.id === originalContentId);
    
    // Check if it has repurposed content for this format
    if (originalContent?.metadata?.repurposedContentMap?.[formatId]) {
      return originalContent.metadata.repurposedContentMap[formatId];
    }
    
    return null;
  };
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const downloadAsText = (content: string, formatName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_${formatName.toLowerCase().replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${a.download}`);
  };
  
  const saveAsNewContent = async (formatId: string, generatedContent: string): Promise<boolean> => {
    if (!content) return false;
    
    try {
      const formatInfo = contentFormats.find(f => f.id === formatId);
      const formatName = formatInfo?.name || 'Repurposed';
      
      // Get the current metadata or initialize an empty object
      const currentMetadata = content.metadata || {};
      
      // Get or initialize repurposed formats array and content map
      const repurposedFormats = currentMetadata.repurposedFormats || [];
      const repurposedContentMap = currentMetadata.repurposedContentMap || {};
      
      // Add the format to the list if not already present
      if (!repurposedFormats.includes(formatId)) {
        repurposedFormats.push(formatId);
      }
      
      // Store the actual repurposed content in the map
      repurposedContentMap[formatId] = generatedContent;
      
      // Update the content with the new metadata
      await updateContentItem(content.id, {
        ...content,
        metadata: {
          ...currentMetadata,
          repurposedFormats,
          repurposedContentMap
        }
      });
      
      toast.success(`${formatName} content saved successfully`);
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      return false;
    }
  };
  
  const deleteRepurposedContent = async (contentId: string, formatId: string): Promise<boolean> => {
    if (!contentId || !formatId) return false;
    
    setIsDeleting(true);
    
    try {
      // Get the content item
      const originalContent = contentItems.find(item => item.id === contentId);
      if (!originalContent) {
        toast.error('Content not found');
        return false;
      }
      
      const currentMetadata = originalContent.metadata || {};
      const repurposedFormats = currentMetadata.repurposedFormats || [];
      const repurposedContentMap = currentMetadata.repurposedContentMap || {};
      
      // Remove the format from the list and the content from the map
      const updatedFormats = repurposedFormats.filter(format => format !== formatId);
      const updatedContentMap = { ...repurposedContentMap };
      delete updatedContentMap[formatId];
      
      // Update the content with the new metadata
      await updateContentItem(contentId, {
        ...originalContent,
        metadata: {
          ...currentMetadata,
          repurposedFormats: updatedFormats,
          repurposedContentMap: updatedContentMap
        }
      });
      
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
    findRepurposedContent,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  };
};
