
import { useState } from 'react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';

export const useContentActions = (content: ContentItemType | null) => {
  const { contentItems, addContentItem, updateContentItem, deleteContentItem } = useContent();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Utility function to find repurposed content by original content ID and format
  const findRepurposedContent = (originalContentId: string, formatId: string): ContentItemType | null => {
    return contentItems.find(item => 
      item.metadata?.originalContentId === originalContentId && 
      item.metadata?.repurposedType === formatId
    ) || null;
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
      
      // Add as new content item with required properties
      const newContentId = await addContentItem({
        title: `${content.title} (${formatName})`,
        content: generatedContent,
        status: 'draft',
        seo_score: 0,
        keywords: [], // Adding the required property
        metadata: {
          originalContentId: content.id,
          repurposedType: formatId,
          repurposedFrom: content.title
        }
      });
      
      // Update the original content's metadata to track repurposed formats
      if (content && newContentId) {
        // Get the current metadata or initialize an empty object
        const currentMetadata = content.metadata || {};
        
        // Get existing repurposed formats or initialize an empty array
        const repurposedFormats = currentMetadata.repurposedFormats || [];
        
        // Add the new format if not already present
        if (!repurposedFormats.includes(formatId)) {
          const updatedRepurposedFormats = [...repurposedFormats, formatId];
          
          // Don't check the return value of updateContentItem since it returns void
          await updateContentItem(content.id, {
            ...content,
            metadata: {
              ...currentMetadata,
              repurposedFormats: updatedRepurposedFormats
            }
          });
        }
        
        return true; // Return a boolean value for success
      }
      
      return false; // Return a boolean value for failure
    } catch (error) {
      console.error('Error saving as new content:', error);
      toast.error('Failed to save content');
      return false; // Return a boolean value for failure
    }
  };
  
  const deleteRepurposedContent = async (contentId: string): Promise<boolean> => {
    if (!contentId) return false;
    
    setIsDeleting(true);
    
    try {
      // Get the content to be deleted
      const contentToDelete = contentItems.find(item => item.id === contentId);
      if (!contentToDelete) {
        toast.error('Content not found');
        return false;
      }
      
      // Get the original content ID and format
      const originalContentId = contentToDelete.metadata?.originalContentId;
      const repurposedType = contentToDelete.metadata?.repurposedType;
      
      // Delete the content
      await deleteContentItem(contentId);
      
      // If we have the original content, update its metadata
      if (originalContentId && repurposedType) {
        const originalContent = contentItems.find(item => item.id === originalContentId);
        if (originalContent) {
          const currentMetadata = originalContent.metadata || {};
          const repurposedFormats = currentMetadata.repurposedFormats || [];
          
          // Remove the format from the list
          const updatedFormats = repurposedFormats.filter(format => format !== repurposedType);
          
          // Don't check the return value of updateContentItem since it returns void
          await updateContentItem(originalContentId, {
            ...originalContent,
            metadata: {
              ...currentMetadata,
              repurposedFormats: updatedFormats
            }
          });
        }
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
    findRepurposedContent,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  };
};
