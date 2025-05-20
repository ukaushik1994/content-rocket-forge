
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';

/**
 * Load content from local storage (transitional approach)
 */
export const loadFromLocalStorage = (contentId: string) => {
  try {
    const savedData = localStorage.getItem(`repurposed_content_${contentId}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
};

/**
 * Save content to local storage (transitional approach)
 */
export const saveToLocalStorage = (
  contentId: string,
  contents: Record<string, string>,
  formats: string[],
  savedFormats: string[] = [],
  activeFormat: string | null = null
) => {
  try {
    localStorage.setItem(
      `repurposed_content_${contentId}`,
      JSON.stringify({
        contents,
        formats,
        savedFormats,
        activeFormat
      })
    );
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Load content from database
 */
export const loadFromDatabase = async (contentId: string) => {
  if (!contentId) return null;
  
  try {
    // Query repurposed contents table
    const { data, error } = await supabase
      .from('repurposed_contents')
      .select('*')
      .eq('content_id', contentId);
      
    if (error) {
      console.error('Error loading content from database:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      // Process the data into expected format
      const contents: Record<string, string> = {};
      const formats: string[] = [];
      const savedFormats: string[] = [];
      
      // Process each item
      data.forEach(item => {
        contents[item.format_code] = item.content;
        if (!formats.includes(item.format_code)) {
          formats.push(item.format_code);
        }
        if (item.status === 'saved' && !savedFormats.includes(item.format_code)) {
          savedFormats.push(item.format_code);
        }
      });
      
      return {
        contents,
        formats,
        savedFormats
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in loadFromDatabase:', error);
    return null;
  }
};

/**
 * Store content in the database
 */
export const storeContentInDatabase = async (
  contentId: string, 
  formatId: string, 
  generatedContent: string,
  title: string,
  userId: string,
  status: 'draft' | 'saved' = 'draft'
): Promise<boolean> => {
  if (!contentId || !formatId || !generatedContent) return false;
  
  try {
    // Insert or update content in database
    const { error } = await supabase
      .from('repurposed_contents')
      .upsert({
        content_id: contentId,
        format_code: formatId,
        content: generatedContent,
        title,
        user_id: userId,
        status
      }, {
        onConflict: 'content_id,format_code',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error storing content in database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in storeContentInDatabase:', error);
    return false;
  }
};

/**
 * Update format status in the database
 */
export const updateFormatStatus = async (
  contentId: string,
  formatId: string,
  status: 'draft' | 'saved' = 'saved'
): Promise<boolean> => {
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
 * Fetch available formats from database
 */
export const fetchFormatsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('content_formats')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching available formats:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchFormatsFromDatabase:', error);
    return [];
  }
};
