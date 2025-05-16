
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { toastConfig } from './index';

export const createAddContentAction = (
  contentItems: ContentItemType[],
  setContentItems: React.Dispatch<React.SetStateAction<ContentItemType[]>>,
  userId?: string
) => {
  return async (item: Omit<ContentItemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!userId) {
      toast.error('You must be logged in to create content', toastConfig.error);
      return;
    }

    try {
      const newItem = {
        title: item.title,
        content: item.content,
        status: item.status,
        seo_score: item.seo_score,
        user_id: userId,
        metadata: item.metadata || {}
      };
      
      const { data, error } = await supabase
        .from('content_items')
        .insert(newItem)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // If the content has keywords, create the relationships
        if (item.keywords && item.keywords.length > 0) {
          await processKeywords(data.id, item.keywords, userId);
        }
        
        toast.success('Content item created successfully', toastConfig.success);
        
        // Add to local state with keywords
        const createdItem: ContentItemType = {
          ...data,
          keywords: item.keywords || [],
          content: data.content || '',
          status: data.status as 'draft' | 'approved' | 'published' | 'archived',
          // Safely handle metadata by ensuring it's an object
          metadata: typeof data.metadata === 'object' ? data.metadata : {}
        };
        
        setContentItems(prev => [createdItem, ...prev]);
      }
    } catch (error: any) {
      console.error('Error adding content item:', error);
      toast.error(error.message || 'Error creating content item', toastConfig.error);
      
      // Fallback for development: Create in memory if database fails
      if (process.env.NODE_ENV === 'development') {
        const now = new Date().toISOString();
        const newItem: ContentItemType = {
          ...item,
          id: uuidv4(),
          created_at: now,
          updated_at: now,
          user_id: userId
        };
        setContentItems(prev => [newItem, ...prev]);
        toast.info('Created content in memory (development mode)');
      }
    }
  };
};

// Helper function to process keywords
async function processKeywords(contentId: string, keywords: string[], userId: string) {
  // First, check if the keywords exist or create them
  for (const keywordText of keywords) {
    try {
      // Check if keyword exists
      const { data: existingKeyword, error: searchError } = await supabase
        .from('keywords')
        .select('id')
        .eq('keyword', keywordText)
        .eq('user_id', userId)
        .single();
        
      if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        throw searchError;
      }
      
      let keywordId;
      
      if (!existingKeyword) {
        // Create the keyword if it doesn't exist
        const { data: newKeyword, error: insertError } = await supabase
          .from('keywords')
          .insert({
            keyword: keywordText,
            user_id: userId
          })
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        
        keywordId = newKeyword.id;
      } else {
        keywordId = existingKeyword.id;
      }
      
      // Create the relationship between content item and keyword
      const { error: relationError } = await supabase
        .from('content_keywords')
        .insert({
          content_id: contentId,
          keyword_id: keywordId
        });
        
      if (relationError) throw relationError;
    } catch (error) {
      console.error(`Error processing keyword: ${keywordText}`, error);
    }
  }
}
