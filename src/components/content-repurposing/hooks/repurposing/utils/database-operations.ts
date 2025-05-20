
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '@/contexts/content/types';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { RepurposedContentData, RepurposedContentRecord } from '../types/action-types';

/**
 * Finds a repurposed content by original content ID and format
 */
export const findRepurposedContent = async (
  originalContentId: string, 
  formatId: string,
  contentItems: ContentItemType[]
): Promise<RepurposedContentData | null> => {
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
      return mapDbRecordToContentData(data);
    }
  } catch (error) {
    console.error('Error finding repurposed content:', error);
  }
  
  return null;
};

/**
 * Maps a database record to a content data object
 */
export const mapDbRecordToContentData = (record: RepurposedContentRecord): RepurposedContentData => {
  return {
    id: record.id,
    contentId: record.content_id,
    formatId: record.format_code,
    title: record.title,
    content: record.content,
    status: record.status,
    version: record.version
  };
};

/**
 * Fetches all saved formats for a content
 */
export const fetchSavedFormats = async (contentId: string): Promise<string[]> => {
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

/**
 * Saves a new content or updates an existing one
 */
export const saveContent = async (
  contentId: string,
  formatId: string,
  generatedContent: string,
  contentTitle: string,
  userId: string,
  updateContentItem: (id: string, updates: any) => Promise<void>
): Promise<boolean> => {
  if (!contentId || !formatId || !generatedContent) {
    toast.error('Missing required data to save content');
    return false;
  }
  
  try {
    const formatInfo = getFormatByIdOrDefault(formatId);
    const formatName = formatInfo.name;
    
    // Check if this content has already been saved
    const { data: existingContent, error: checkError } = await supabase
      .from('repurposed_contents')
      .select('id, version')
      .eq('content_id', contentId)
      .eq('format_code', formatId)
      .single();
    
    let result;
    
    if (checkError || !existingContent) {
      // This format doesn't exist yet, create a new record
      const { data, error } = await supabase
        .from('repurposed_contents')
        .insert({
          content_id: contentId,
          format_code: formatId,
          content: generatedContent,
          title: `${contentTitle} - ${formatName}`,
          status: 'saved',
          user_id: userId
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
    
    await updateLegacyMetadata(contentId, formatId, generatedContent, updateContentItem);
    
    toast.success(`${formatName} content saved successfully`);
    return true;
  } catch (error) {
    console.error('Error saving content:', error);
    toast.error('Failed to save content');
    return false;
  }
};

/**
 * Updates legacy metadata for backward compatibility
 */
const updateLegacyMetadata = async (
  contentId: string, 
  formatId: string, 
  generatedContent: string, 
  updateContentItem: (id: string, updates: any) => Promise<void>
) => {
  try {
    // Get the content item
    const { data: contentItem, error } = await supabase
      .from('content_items')
      .select('metadata')
      .eq('id', contentId)
      .single();
      
    if (error) {
      console.warn('Error getting content item for metadata update:', error);
      return;
    }
    
    const currentMetadata = contentItem.metadata ? 
      (typeof contentItem.metadata === 'object' ? contentItem.metadata : {}) : {};
    
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
    await updateContentItem(contentId, {
      metadata: updatedMetadata
    });
  } catch (metadataError) {
    console.warn('Error updating legacy metadata:', metadataError);
    // Continue anyway since the primary storage is now the repurposed_contents table
  }
};

/**
 * Deletes a repurposed content from the database
 */
export const deleteRepurposedContent = async (
  contentId: string, 
  formatId: string,
  contentItems: ContentItemType[],
  updateContentItem: (id: string, updates: any) => Promise<void>
): Promise<boolean> => {
  if (!contentId || !formatId) {
    toast.error('Missing required data to delete content');
    return false;
  }
  
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
    
    await updateLegacyMetadataOnDelete(contentId, formatId, contentItems, updateContentItem);
    await updateLocalStorageOnDelete(contentId, formatId);
    
    toast.success('Content deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting content:', error);
    toast.error('Failed to delete content');
    return false;
  }
};

/**
 * Updates legacy metadata on delete for backward compatibility
 */
const updateLegacyMetadataOnDelete = async (
  contentId: string,
  formatId: string,
  contentItems: ContentItemType[],
  updateContentItem: (id: string, updates: any) => Promise<void>
) => {
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
    console.warn('Error updating legacy metadata on delete:', metadataError);
    // Continue anyway since the primary storage is now the repurposed_contents table
  }
};

/**
 * Updates localStorage on delete for backward compatibility
 */
const updateLocalStorageOnDelete = async (contentId: string, formatId: string) => {
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
    console.warn('Error updating localStorage on delete:', localStorageError);
    // Continue anyway since localStorage is just a fallback
  }
};

import { toast } from 'sonner';
