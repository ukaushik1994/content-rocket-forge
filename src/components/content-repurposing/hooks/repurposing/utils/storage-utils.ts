
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';

/**
 * Loads repurposed content from localStorage (transitional approach)
 */
export const loadFromLocalStorage = (contentId: string) => {
  const savedLocalData = localStorage.getItem(`repurposed_content_${contentId}`);
  
  if (savedLocalData) {
    try {
      const parsedLocalData = JSON.parse(savedLocalData);
      
      return {
        contents: parsedLocalData.contents || {},
        formats: Array.isArray(parsedLocalData.formats) ? parsedLocalData.formats : [],
        savedFormats: Array.isArray(parsedLocalData.savedFormats) ? parsedLocalData.savedFormats : [],
        activeFormat: parsedLocalData.activeFormat && typeof parsedLocalData.activeFormat === 'string' 
          ? parsedLocalData.activeFormat 
          : null
      };
    } catch (error) {
      console.error('Error parsing saved local content:', error);
    }
  }
  
  return null;
};

/**
 * Saves repurposed content to localStorage (transitional approach)
 */
export const saveToLocalStorage = (
  contentId: string, 
  generatedContents: Record<string, string>, 
  selectedFormats: string[], 
  savedContentFormats: string[], 
  activeFormat: string | null
) => {
  if (!contentId) return;
  
  const dataToSave = {
    contents: generatedContents,
    formats: selectedFormats,
    savedFormats: savedContentFormats,
    activeFormat: activeFormat,
    timestamp: new Date().toISOString(),
    contentId: contentId
  };
  
  try {
    localStorage.setItem(`repurposed_content_${contentId}`, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Loads repurposed content from Supabase database
 */
export const loadFromDatabase = async (contentId: string) => {
  try {
    const { data: repurposedContents, error } = await supabase
      .from('repurposed_contents')
      .select('*')
      .eq('content_id', contentId);
    
    if (error) {
      console.error('Error loading repurposed content from database:', error);
      return null;
    }
    
    if (repurposedContents && repurposedContents.length > 0) {
      const dbContents: Record<string, string> = {};
      const dbFormats: string[] = [];
      const dbSavedFormats: string[] = [];
      
      repurposedContents.forEach(item => {
        dbContents[item.format_code] = item.content;
        
        if (!dbFormats.includes(item.format_code)) {
          dbFormats.push(item.format_code);
        }
        
        if (item.status === 'saved' && !dbSavedFormats.includes(item.format_code)) {
          dbSavedFormats.push(item.format_code);
        }
      });
      
      return {
        contents: dbContents,
        formats: dbFormats,
        savedFormats: dbSavedFormats
      };
    }
  } catch (error) {
    console.error('Error in database load operation:', error);
  }
  
  return null;
};

/**
 * Stores generated content to the database
 */
export const storeContentInDatabase = async (
  contentId: string,
  formatId: string,
  generatedContent: string,
  contentTitle: string,
  userId: string,
  status: 'draft' | 'saved' = 'draft'
) => {
  if (!contentId || !formatId || !generatedContent) return false;
  
  const formatInfo = getFormatByIdOrDefault(formatId);
  
  try {
    const { error } = await supabase
      .from('repurposed_contents')
      .upsert({
        content_id: contentId,
        format_code: formatId,
        content: generatedContent,
        title: `${contentTitle} - ${formatInfo.name}`,
        status: status,
        user_id: userId
      }, {
        onConflict: 'content_id,format_code',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error storing generated content in database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error storing content:', error);
    return false;
  }
};

/**
 * Updates the format status in the database
 */
export const updateFormatStatus = async (
  contentId: string,
  formatId: string,
  status: 'draft' | 'saved' = 'saved'
) => {
  if (!contentId || !formatId) return false;
  
  try {
    const { error } = await supabase
      .from('repurposed_contents')
      .update({ status })
      .eq('content_id', contentId)
      .eq('format_code', formatId);
      
    if (error) {
      console.error('Error updating format status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateFormatStatus:', error);
    return false;
  }
};

/**
 * Fetches available content formats from the database
 */
export const fetchFormatsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('content_formats')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching available formats:', error);
      return contentFormats; // Fall back to the hardcoded formats
    }
    
    return data || contentFormats;
  } catch (error) {
    console.error('Error in fetchAvailableFormats:', error);
    return contentFormats; // Fall back to the hardcoded formats
  }
};
