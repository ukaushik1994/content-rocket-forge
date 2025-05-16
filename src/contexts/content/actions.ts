import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from './types';
import { fetchItemKeywords } from './utils';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true },
  info: { duration: 4000, closeButton: true }
};

export const createContentActions = (
  contentItems: ContentItemType[],
  setContentItems: React.Dispatch<React.SetStateAction<ContentItemType[]>>,
  userId?: string
) => {
  const addContentItem = async (item: Omit<ContentItemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
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
        user_id: userId
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
          // First, check if the keywords exist or create them
          for (const keywordText of item.keywords) {
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
                  content_id: data.id,
                  keyword_id: keywordId
                });
                
              if (relationError) throw relationError;
            } catch (error) {
              console.error(`Error processing keyword: ${keywordText}`, error);
            }
          }
        }
        
        toast.success('Content item created successfully', toastConfig.success);
        
        // Add to local state with keywords
        const createdItem: ContentItemType = {
          ...data,
          keywords: item.keywords || [],
          content: data.content || '',
          status: data.status as 'draft' | 'published' | 'archived',
          metadata: data.metadata
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

  const updateContentItem = async (id: string, updates: Partial<ContentItemType>) => {
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
      
      // Prepare updates for the database
      const dbUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
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
        // First, get current keywords
        const { data: currentRelations, error: relationsError } = await supabase
          .from('content_keywords')
          .select('keyword_id')
          .eq('content_id', id);
          
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
                .eq('content_id', id)
                .eq('keyword_id', keywordId);
            }
          }
          
          // Add new keyword relationships
          for (const kwToAdd of keywordsToAdd) {
            // Check if keyword exists
            let { data: existingKeyword, error: kwError } = await supabase
              .from('keywords')
              .select('id')
              .eq('keyword', kwToAdd)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (kwError && kwError.code !== 'PGRST116') throw kwError;
            
            let keywordId;
            
            if (!existingKeyword) {
              // Create keyword if it doesn't exist
              const { data: newKeyword, error: insertError } = await supabase
                .from('keywords')
                .insert({
                  keyword: kwToAdd,
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
                content_id: id,
                keyword_id: keywordId
              });
              
            if (relationError) throw relationError;
          }
        } else if (keywordsToUpdate && keywordsToUpdate.length > 0) {
          // No existing keywords but new ones to add
          for (const kwToAdd of keywordsToUpdate) {
            // Check if keyword exists
            let { data: existingKeyword, error: kwError } = await supabase
              .from('keywords')
              .select('id')
              .eq('keyword', kwToAdd)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (kwError && kwError.code !== 'PGRST116') throw kwError;
            
            let keywordId;
            
            if (!existingKeyword) {
              // Create keyword if it doesn't exist
              const { data: newKeyword, error: insertError } = await supabase
                .from('keywords')
                .insert({
                  keyword: kwToAdd,
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
                content_id: id,
                keyword_id: keywordId
              });
              
            if (relationError) throw relationError;
          }
        }
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

  const deleteContentItem = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete content', toastConfig.error);
      return;
    }

    try {
      // First delete associated keyword relationships
      const { error: relationsError } = await supabase
        .from('content_keywords')
        .delete()
        .eq('content_id', id);
        
      if (relationsError) throw relationsError;
      
      // Then delete the content item
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      toast.success('Content deleted successfully', toastConfig.success);
      
      // Update local state
      setContentItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting content item:', error);
      toast.error(error.message || 'Error deleting content', toastConfig.error);
      
      // Fallback for development: Delete from memory if database fails
      if (process.env.NODE_ENV === 'development') {
        setContentItems(prev => prev.filter(item => item.id !== id));
        toast.info('Deleted content from memory (development mode)', toastConfig.info);
      }
    }
  };

  const getContentItem = (id: string) => {
    return contentItems.find(item => item.id === id);
  };

  const publishContent = async (id: string) => {
    return updateContentItem(id, { 
      status: 'published',
      updated_at: new Date().toISOString()
    });
  };

  return {
    addContentItem,
    updateContentItem,
    deleteContentItem,
    getContentItem,
    publishContent
  };
};
