
import { useState } from 'react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { getFormatByIdOrDefault } from '../../formats';
import { supabase } from '@/integrations/supabase/client';

// Define the type for repurposed content from database
interface RepurposedContentRecord {
  id: string;
  content_id: string;
  format_code: string;
  content: string;
  title: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export const useContentActions = (content: ContentItemType | null) => {
  const { contentItems, updateContentItem } = useContent();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Utility function to find content by original content ID and format
  const findRepurposedContent = async (originalContentId: string, formatId: string): Promise<any | null> => {
    if (!originalContentId || !formatId) {
      return null;
    }
    
    try {
      // First check in Supabase for the repurposed content
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('*')
        .eq('content_id', originalContentId)
        .eq('format_code', formatId)
        .single();
      
      if (error) {
        console.error('Error fetching repurposed content from DB:', error);
        
        // Fall back to metadata in the content_items if available
        const originalContent = contentItems.find(item => item.id === originalContentId);
        const metadata = originalContent?.metadata as { repurposedContentMap?: Record<string, string> } | undefined;
        
        if (metadata && metadata.repurposedContentMap && metadata.repurposedContentMap[formatId]) {
          return {
            contentId: originalContentId,
            formatId,
            title: originalContent.title || 'Untitled',
            content: metadata.repurposedContentMap[formatId]
          };
        }
        
        // As a last resort, check localStorage
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
      } else if (data) {
        // Data found in Supabase
        return {
          id: data.id,
          contentId: data.content_id,
          formatId: data.format_code,
          title: data.title,
          content: data.content,
          status: data.status,
          version: data.version
        };
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
      
      // Check if this content has already been saved
      const { data: existingContent, error: checkError } = await supabase
        .from('repurposed_contents')
        .select('id, version')
        .eq('content_id', content.id)
        .eq('format_code', formatId)
        .single();
      
      let result;
      
      if (checkError || !existingContent) {
        // This format doesn't exist yet, create a new record
        const { data, error } = await supabase
          .from('repurposed_contents')
          .insert({
            content_id: content.id,
            format_code: formatId,
            content: generatedContent,
            title: `${content.title} - ${formatName}`,
            status: 'saved',
            user_id: content.user_id // This assumes the user_id is available on the content item
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        result = data;
      } else {
        // Update the existing record with a new version
        const { data, error } = await supabase
          .from('repurposed_contents')
          .update({
            content: generatedContent,
            version: (existingContent.version || 1) + 1,
            updated_at: new Date().toISOString(),
            status: 'saved'
          })
          .eq('id', existingContent.id)
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        result = data;
      }
      
      // For backward compatibility, also update the metadata
      // This can be removed once the migration is complete
      try {
        const currentMetadata = content.metadata ? 
          (typeof content.metadata === 'object' ? content.metadata : {}) : {};
        
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
      } catch (metadataError) {
        console.warn('Error updating legacy metadata:', metadataError);
        // Continue anyway since the primary storage is now the repurposed_contents table
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
      // Delete from the repurposed_contents table
      const { error } = await supabase
        .from('repurposed_contents')
        .delete()
        .eq('content_id', contentId)
        .eq('format_code', formatId);
      
      if (error) {
        throw error;
      }
      
      // For backward compatibility, also update the metadata
      // This can be removed once the migration is complete
      try {
        // Get the content item
        const originalContent = contentItems.find(item => item.id === contentId);
        if (originalContent) {
          const currentMetadata = originalContent.metadata ? 
            (typeof originalContent.metadata === 'object' ? originalContent.metadata : {}) : {};
          
          const repurposedFormats = currentMetadata.repurposedFormats || [];
          const repurposedContentMap = currentMetadata.repurposedContentMap || {};
          
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
          
          // Update the content with the new metadata
          await updateContentItem(contentId, {
            metadata: updatedMetadata
          });
        }
      } catch (metadataError) {
        console.warn('Error updating legacy metadata:', metadataError);
        // Continue anyway since the primary storage is now the repurposed_contents table
      }
      
      // Also update localStorage for backward compatibility
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
        console.warn('Error updating localStorage:', localStorageError);
        // Continue anyway since localStorage is just a fallback
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
  
  // Function to fetch all saved formats for a content
  const fetchSavedFormats = async (contentId: string): Promise<string[]> => {
    if (!contentId) return [];
    
    try {
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('format_code')
        .eq('content_id', contentId)
        .eq('status', 'saved');
        
      if (error) {
        console.error('Error fetching saved formats:', error);
        return [];
      }
      
      return data.map(item => item.format_code);
    } catch (error) {
      console.error('Error in fetchSavedFormats:', error);
      return [];
    }
  };
  
  return {
    contentItems,
    isDeleting,
    isSaving,
    findRepurposedContent,
    fetchSavedFormats,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
  };
};
