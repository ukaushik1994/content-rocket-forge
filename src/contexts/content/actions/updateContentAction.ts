
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '../types';
import { toast } from 'sonner';
import { toastConfig } from './index';

export const createUpdateContentAction = (
  contentItems: ContentItemType[],
  setContentItems: React.Dispatch<React.SetStateAction<ContentItemType[]>>,
  userId?: string
) => {
  return async (id: string, updates: Partial<ContentItemType>) => {
    if (!userId) {
      toast.error('You must be logged in to update content', toastConfig.error);
      return;
    }

    // Get the existing item
    const existingItem = contentItems.find(item => item.id === id);
    if (!existingItem) {
      toast.error('Content item not found', toastConfig.error);
      return;
    }

    try {
      // Handle keyword updates separately
      const keywordsToUpdate = updates.keywords;
      
      // Prepare updates for the database - ensure approval_status is valid
      const dbUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        // Handle approval_status conversion
        approval_status: updates.approval_status === 'archived' ? 'draft' : updates.approval_status,
        // Remove id, user_id and keywords from updates
        id: undefined,
        user_id: undefined,
        keywords: undefined,
      };
      
      // Filter out undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });
      
      // Update the content item
      const { error } = await supabase
        .from('content_items')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // If keywords are being updated
      if (keywordsToUpdate !== undefined) {
        await updateKeywords(id, keywordsToUpdate, userId);
      }
      
      toast.success('Content updated successfully', toastConfig.success);
      
      // Update local state
      setContentItems(prev => 
        prev.map(item => item.id === id ? { 
          ...item, 
          ...updates, 
          updated_at: new Date().toISOString() 
        } : item)
      );
    } catch (error: any) {
      console.error('Error updating content item:', error);
      toast.error(error.message || 'Error updating content', toastConfig.error);
      
      // Fallback for development: Update in memory if database fails
      if (process.env.NODE_ENV === 'development') {
        setContentItems(prev => 
          prev.map(item => item.id === id ? { 
            ...item, 
            ...updates, 
            updated_at: new Date().toISOString() 
          } : item)
        );
        toast.info('Updated content in memory (development mode)');
      }
    }
  };
};

// Helper function to update keywords
async function updateKeywords(contentId: string, keywordsToUpdate: string[] | undefined, userId: string) {
  if (keywordsToUpdate === undefined) return;

  // First, get current keywords
  const { data: currentRelations, error: relationsError } = await supabase
    .from('content_keywords')
    .select('keyword_id')
    .eq('content_id', contentId);
    
  if (relationsError) throw relationsError;
  
  // Get the current keywords
  const currentKeywordIds = currentRelations ? currentRelations.map(rel => rel.keyword_id) : [];
  
  if (currentKeywordIds.length > 0) {
    const { data: currentKeywords, error: keywordsError } = await supabase
      .from('keywords')
      .select('id, keyword')
      .in('id', currentKeywordIds);
      
    if (keywordsError) throw keywordsError;
    
    const currentKeywordTexts = currentKeywords ? currentKeywords.map(k => k.keyword) : [];
    const currentKeywordMap = currentKeywords ? 
      currentKeywords.reduce((acc, k) => {
        acc[k.keyword] = k.id;
        return acc;
      }, {} as Record<string, string>) : {};
      
    // Keywords to add (in updates but not in current)
    const keywordsToAdd = keywordsToUpdate ? 
      keywordsToUpdate.filter(kw => !currentKeywordTexts.includes(kw)) : [];
      
    // Keywords to remove (in current but not in updates)
    const keywordsToRemove = keywordsToUpdate ? 
      currentKeywordTexts.filter(kw => !keywordsToUpdate.includes(kw)) : [];
    
    // Remove keyword relationships
    for (const kwToRemove of keywordsToRemove) {
      const keywordId = currentKeywordMap[kwToRemove];
      if (keywordId) {
        await supabase
          .from('content_keywords')
          .delete()
          .eq('content_id', contentId)
          .eq('keyword_id', keywordId);
      }
    }
    
    // Add new keyword relationships
    for (const kwToAdd of keywordsToAdd) {
      await addKeywordRelationship(contentId, kwToAdd, userId);
    }
  } else if (keywordsToUpdate && keywordsToUpdate.length > 0) {
    // No existing keywords but new ones to add
    for (const kwToAdd of keywordsToUpdate) {
      await addKeywordRelationship(contentId, kwToAdd, userId);
    }
  }
}

async function addKeywordRelationship(contentId: string, keywordText: string, userId: string) {
  // Check if keyword exists
  let { data: existingKeyword, error: kwError } = await supabase
    .from('keywords')
    .select('id')
    .eq('keyword', keywordText)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (kwError && kwError.code !== 'PGRST116') throw kwError;
  
  let keywordId;
  
  if (!existingKeyword) {
    // Create keyword if it doesn't exist
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
  
  // Create relationship
  const { error: relationError } = await supabase
    .from('content_keywords')
    .insert({
      content_id: contentId,
      keyword_id: keywordId
    });
    
  if (relationError) throw relationError;
}
