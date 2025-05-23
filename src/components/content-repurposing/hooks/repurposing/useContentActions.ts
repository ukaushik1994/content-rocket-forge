
import { useState } from 'react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { getFormatByIdOrDefault } from '../../formats';
import { repurposedContentService } from '@/services/repurposedContentService';
import { useAuth } from '@/contexts/AuthContext';

export const useContentActions = (content: ContentItemType | null) => {
  const { contentItems } = useContent();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Utility function to find content by original content ID and format
  const findRepurposedContent = async (originalContentId: string, formatId: string): Promise<string | null> => {
    if (!originalContentId || !formatId) return null;
    
    try {
      const repurposedContent = await repurposedContentService.getRepurposedContentByFormat(originalContentId, formatId);
      return repurposedContent?.content || null;
    } catch (error) {
      console.error('Error finding repurposed content:', error);
      return null;
    }
  };
  
  const copyToClipboard = (content: string) => {
    if (!content) return;
    
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const downloadAsText = (content: string, formatName: string) => {
    if (!content) return;
    
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
    if (!content || !user || !formatId || !generatedContent) {
      toast.error('Missing required information to save content');
      return false;
    }
    
    try {
      setIsSaving(true);
      const formatInfo = getFormatByIdOrDefault(formatId);
      const formatName = formatInfo.name;
      
      const result = await repurposedContentService.saveRepurposedContent({
        contentId: content.id,
        formatCode: formatId,
        content: generatedContent,
        title: `${content.title} - ${formatName}`,
        userId: user.id
      });
      
      if (result) {
        toast.success(`${formatName} content saved successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(`Failed to save ${formatId} content`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const deleteRepurposedContent = async (contentId: string, formatId: string): Promise<boolean> => {
    if (!contentId || !formatId) return false;
    
    setIsDeleting(true);
    
    try {
      const success = await repurposedContentService.deleteRepurposedContent(contentId, formatId);
      if (success) {
        toast.success('Content deleted successfully');
        return true;
      }
      return false;
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
