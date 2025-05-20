
import { supabase } from '@/integrations/supabase/client';
import { contentFormats } from '@/components/content-repurposing/formats';

/**
 * Fetches formats that have been saved for a specific content
 */
export const fetchSavedFormats = async (contentId: string): Promise<string[]> => {
  if (!contentId) return [];
  
  try {
    // First check in Supabase
    const { data, error } = await supabase
      .from('repurposed_contents')
      .select('format_code')
      .eq('content_id', contentId)
      .eq('status', 'saved');
      
    if (error) {
      console.error('Error fetching saved formats:', error);
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map(item => item.format_code);
    }
    
    // Also check local storage (legacy approach)
    const savedLocalData = localStorage.getItem(`repurposed_content_${contentId}`);
    
    if (savedLocalData) {
      try {
        const parsedData = JSON.parse(savedLocalData);
        if (Array.isArray(parsedData.savedFormats)) {
          return parsedData.savedFormats;
        }
      } catch (e) {
        console.error('Error parsing saved formats from localStorage:', e);
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchSavedFormats:', error);
    return [];
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
    console.error('Error in fetchFormatsFromDatabase:', error);
    return contentFormats; // Fall back to the hardcoded formats
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
