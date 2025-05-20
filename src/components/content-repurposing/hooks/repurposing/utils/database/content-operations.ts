
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '@/contexts/content/types';
import { RepurposedContentData } from '../../types/action-types';
import { toast } from 'sonner';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { ensureContentItemFormat } from './utils';

/**
 * Finds a specific repurposed content record
 */
export const findRepurposedContent = async (
  contentId: string,
  formatId: string,
  contentItems: ContentItemType[]
): Promise<RepurposedContentData | null> => {
  if (!contentId || !formatId) return null;
  
  try {
    // First attempt to find in Supabase
    const { data, error } = await supabase
      .from('repurposed_contents')
      .select('*')
      .eq('content_id', contentId)
      .eq('format_code', formatId)
      .order('version', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error finding repurposed content:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      return {
        id: data[0].id,
        contentId: data[0].content_id,
        formatId: data[0].format_code,
        title: data[0].title || '',
        content: data[0].content,
        status: data[0].status,
        version: data[0].version
      };
    }
    
    // If not found in database, try to find in local content item metadata (legacy approach)
    const contentItem = contentItems.find(item => item.id === contentId);
    
    if (contentItem && contentItem.metadata) {
      // Handle the case where metadata might be an array
      const metadata = typeof contentItem.metadata === 'object' && !Array.isArray(contentItem.metadata) 
        ? contentItem.metadata 
        : {};
      
      // Safely access repurposedContentMap property
      const repurposedContentMap = metadata.repurposedContentMap || {};
      
      if (repurposedContentMap && repurposedContentMap[formatId]) {
        const formatInfo = getFormatByIdOrDefault(formatId);
        
        return {
          contentId: contentId,
          formatId: formatId,
          title: `${contentItem.title} - ${formatInfo.name}`,
          content: repurposedContentMap[formatId],
          status: 'saved'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in findRepurposedContent:', error);
    return null;
  }
};

/**
 * Saves content to the database
 */
export const saveContent = async (
  contentId: string,
  formatId: string,
  generatedContent: string,
  contentTitle: string,
  userId: string,
  updateContentItem: (content: ContentItemType) => void
): Promise<boolean> => {
  if (!contentId || !formatId || !generatedContent || !contentTitle) {
    toast.error('Missing required information to save content');
    return false;
  }
  
  try {
    const formatInfo = getFormatByIdOrDefault(formatId);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('repurposed_contents')
      .upsert({
        content_id: contentId,
        format_code: formatId,
        content: generatedContent,
        title: `${contentTitle} - ${formatInfo.name}`,
        user_id: userId,
        status: 'saved'
      }, {
        onConflict: 'content_id,format_code',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error saving content:', error);
      toast.error(`Error saving ${formatInfo.name} content`);
      return false;
    }
    
    // Also update the content item metadata for backward compatibility
    const { data: contentData, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', contentId)
      .single();
      
    if (!contentError && contentData) {
      // Handle the case where metadata might be null or an array
      const metadata = contentData.metadata && typeof contentData.metadata === 'object' && !Array.isArray(contentData.metadata) 
        ? contentData.metadata 
        : {};
      
      // Update metadata with new repurposed content
      const repurposedContentMap = metadata.repurposedContentMap || {};
      const repurposedFormats = Array.isArray(metadata.repurposedFormats) 
        ? metadata.repurposedFormats 
        : [];
      
      // Update metadata
      repurposedContentMap[formatId] = generatedContent;
      
      if (!repurposedFormats.includes(formatId)) {
        repurposedFormats.push(formatId);
      }
      
      const updatedMetadata = {
        ...metadata,
        repurposedContentMap,
        repurposedFormats
      };
      
      // Update content item with new metadata
      const { data: updateData, error: updateError } = await supabase
        .from('content_items')
        .update({ metadata: updatedMetadata })
        .eq('id', contentId)
        .select('*')
        .single();
        
      if (updateError) {
        console.error('Error updating content metadata:', updateError);
      } else if (updateData) {
        // Update local content item state if needed
        const contentItem = ensureContentItemFormat(updateData);
        updateContentItem(contentItem);
      }
    }
    
    toast.success(`${formatInfo.name} content saved successfully`);
    return true;
  } catch (error) {
    console.error('Error in saveContent:', error);
    toast.error('Error saving content');
    return false;
  }
};

/**
 * Deletes repurposed content
 */
export const deleteRepurposedContent = async (
  contentId: string,
  formatId: string,
  contentItems: ContentItemType[],
  updateContentItem: (content: ContentItemType) => void
): Promise<boolean> => {
  if (!contentId || !formatId) {
    toast.error('Missing required information to delete content');
    return false;
  }
  
  try {
    const formatInfo = getFormatByIdOrDefault(formatId);
    
    // Delete from Supabase
    const { error } = await supabase
      .from('repurposed_contents')
      .delete()
      .eq('content_id', contentId)
      .eq('format_code', formatId);
      
    if (error) {
      console.error('Error deleting repurposed content:', error);
      toast.error(`Error deleting ${formatInfo.name} content`);
      return false;
    }
    
    // Also update the content item metadata for backward compatibility
    const contentItem = contentItems.find(item => item.id === contentId);
    
    if (contentItem && contentItem.metadata) {
      // Handle the case where metadata might be an array
      const metadata = typeof contentItem.metadata === 'object' && !Array.isArray(contentItem.metadata) 
        ? { ...contentItem.metadata }
        : {};
      
      // Update repurposedContentMap by removing the format
      let repurposedContentMap = metadata.repurposedContentMap || {};
      let repurposedFormats = Array.isArray(metadata.repurposedFormats) 
        ? [...metadata.repurposedFormats] 
        : [];
      
      // Remove the format from both collections
      if (repurposedContentMap && repurposedContentMap[formatId]) {
        const newMap = { ...repurposedContentMap };
        delete newMap[formatId];
        repurposedContentMap = newMap;
      }
      
      repurposedFormats = repurposedFormats.filter(format => format !== formatId);
      
      // Update content item with new metadata
      const updatedMetadata = {
        ...metadata,
        repurposedContentMap,
        repurposedFormats
      };
      
      const { data: updateData, error: updateError } = await supabase
        .from('content_items')
        .update({ metadata: updatedMetadata })
        .eq('id', contentId)
        .select('*')
        .single();
        
      if (updateError) {
        console.error('Error updating content metadata after deletion:', updateError);
      } else if (updateData) {
        // Update local content item state if needed
        const updatedContentItem = ensureContentItemFormat(updateData);
        updateContentItem(updatedContentItem);
      }
    }
    
    toast.success(`${formatInfo.name} content deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error in deleteRepurposedContent:', error);
    toast.error('Error deleting content');
    return false;
  }
};
