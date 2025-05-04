
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

type ContentItemType = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  seo_score: number;
  keywords: string[];
  user_id: string;
};

type ContentContextType = {
  contentItems: ContentItemType[];
  loading: boolean;
  addContentItem: (item: Omit<ContentItemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateContentItem: (id: string, updates: Partial<ContentItemType>) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  getContentItem: (id: string) => ContentItemType | undefined;
  publishContent: (id: string) => Promise<void>;
};

// Sample data for fallback
const initialContent: ContentItemType[] = [
  {
    id: '1',
    title: 'Top 10 Project Management Tools for Remote Teams',
    content: 'Content about project management tools...',
    status: 'published',
    created_at: new Date(2025, 3, 28).toISOString(),
    updated_at: new Date(2025, 3, 28).toISOString(),
    seo_score: 87,
    keywords: ['project management', 'remote work', 'productivity tools'],
    user_id: 'placeholder-user-id',
  },
  {
    id: '2',
    title: 'Email Marketing Best Practices in 2025',
    content: 'Content about email marketing...',
    status: 'draft',
    created_at: new Date(2025, 3, 25).toISOString(),
    updated_at: new Date(2025, 3, 27).toISOString(),
    seo_score: 74,
    keywords: ['email marketing', 'digital marketing', 'marketing automation'],
    user_id: 'placeholder-user-id',
  },
  {
    id: '3',
    title: 'How to Choose the Best CRM for Your Business',
    content: 'Content about selecting a CRM system...',
    status: 'published',
    created_at: new Date(2025, 4, 1).toISOString(),
    updated_at: new Date(2025, 4, 1).toISOString(),
    seo_score: 91,
    keywords: ['crm', 'sales software', 'customer relationship'],
    user_id: 'placeholder-user-id',
  },
];

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [contentItems, setContentItems] = useState<ContentItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContentItems = async () => {
      if (!user) {
        setContentItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First, fetch the content items
        const { data: contentData, error: contentError } = await supabase
          .from('content_items')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (contentError) throw contentError;
        
        if (!contentData || contentData.length === 0) {
          setContentItems(process.env.NODE_ENV === 'development' ? initialContent : []);
          setLoading(false);
          return;
        }
        
        // Get all content IDs to fetch their associated keywords
        const contentIds = contentData.map(item => item.id);
        
        // Fetch the keyword relationships
        const { data: keywordRelations, error: relationsError } = await supabase
          .from('content_keywords')
          .select('content_id, keyword_id')
          .in('content_id', contentIds);
        
        if (relationsError) throw relationsError;
        
        // Get unique keyword IDs to fetch the actual keyword texts
        const keywordIds = keywordRelations ? 
          [...new Set(keywordRelations.map(rel => rel.keyword_id))] 
          : [];
        
        let keywordMap: Record<string, string> = {};
        
        // Only fetch keywords if there are any relationships
        if (keywordIds.length > 0) {
          const { data: keywordsData, error: keywordsError } = await supabase
            .from('keywords')
            .select('id, keyword')
            .in('id', keywordIds);
          
          if (keywordsError) throw keywordsError;
          
          // Create a map of keyword IDs to their text values
          keywordMap = (keywordsData || []).reduce((acc, kw) => {
            acc[kw.id] = kw.keyword;
            return acc;
          }, {} as Record<string, string>);
        }
        
        // Map content data with their keywords
        const mappedData: ContentItemType[] = contentData.map(item => {
          // Find all keyword relations for this content item
          const itemKeywordRelations = keywordRelations ? 
            keywordRelations.filter(rel => rel.content_id === item.id) 
            : [];
            
          // Get the actual keyword texts using the map
          const itemKeywords = itemKeywordRelations
            .map(rel => keywordMap[rel.keyword_id])
            .filter(kw => kw !== undefined);
          
          return {
            id: item.id,
            title: item.title,
            content: item.content || '',
            status: item.status as 'draft' | 'published' | 'archived',
            created_at: item.created_at,
            updated_at: item.updated_at,
            seo_score: item.seo_score || 0,
            keywords: itemKeywords,
            user_id: item.user_id,
          };
        });
          
        setContentItems(mappedData);
      } catch (error: any) {
        console.error('Error fetching content items:', error);
        toast.error('Failed to load content items');
        
        // Use fallback data in development mode if fetch fails
        if (process.env.NODE_ENV === 'development') {
          setContentItems(initialContent);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContentItems();

    // Set up realtime subscription
    if (user) {
      const channel = supabase
        .channel('content-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'content_items' },
          (payload) => {
            // Handle the change based on the event type
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as ContentItemType;
              if (newItem.user_id === user.id) {
                // For newly inserted items, we need to fetch any keywords that might be associated
                fetchItemKeywords(newItem).then(itemWithKeywords => {
                  setContentItems(prev => [itemWithKeywords, ...prev]);
                });
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ContentItemType;
              if (updatedItem.user_id === user.id) {
                // For updated items, we need to fetch any keywords that might be updated
                fetchItemKeywords(updatedItem).then(itemWithKeywords => {
                  setContentItems(prev => prev.map(item => 
                    item.id === itemWithKeywords.id ? itemWithKeywords : item
                  ));
                });
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as ContentItemType;
              setContentItems(prev => prev.filter(item => item.id !== deletedItem.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  // Helper function to fetch keywords for a single content item
  const fetchItemKeywords = async (item: any): Promise<ContentItemType> => {
    try {
      // Fetch keyword relationships for this item
      const { data: relations, error: relationsError } = await supabase
        .from('content_keywords')
        .select('keyword_id')
        .eq('content_id', item.id);
      
      if (relationsError) throw relationsError;
      
      if (!relations || relations.length === 0) {
        // No keywords for this item
        return {
          ...item,
          content: item.content || '',
          keywords: [],
          status: item.status as 'draft' | 'published' | 'archived'
        };
      }
      
      // Get the keyword IDs
      const keywordIds = relations.map(rel => rel.keyword_id);
      
      // Fetch the actual keywords
      const { data: keywordsData, error: keywordsError } = await supabase
        .from('keywords')
        .select('keyword')
        .in('id', keywordIds);
      
      if (keywordsError) throw keywordsError;
      
      // Extract the keyword texts
      const keywords = keywordsData ? keywordsData.map(kw => kw.keyword) : [];
      
      return {
        ...item,
        content: item.content || '',
        keywords,
        status: item.status as 'draft' | 'published' | 'archived'
      };
    } catch (error) {
      console.error('Error fetching keywords for content item:', error);
      return {
        ...item,
        content: item.content || '',
        keywords: [],
        status: item.status as 'draft' | 'published' | 'archived'
      };
    }
  };

  const addContentItem = async (item: Omit<ContentItemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to create content');
      return;
    }

    try {
      const newItem = {
        title: item.title,
        content: item.content,
        status: item.status,
        seo_score: item.seo_score,
        user_id: user.id // Add user_id to the insert
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
                .eq('user_id', user.id)
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
                    user_id: user.id
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
        
        toast.success('Content item created successfully');
        
        // Add to local state with keywords
        const createdItem: ContentItemType = {
          ...data,
          keywords: item.keywords || [],
          content: data.content || '',
          status: data.status as 'draft' | 'published' | 'archived'
        };
        
        setContentItems(prev => [createdItem, ...prev]);
      }
    } catch (error: any) {
      console.error('Error adding content item:', error);
      toast.error(error.message || 'Error creating content item');
      
      // Fallback for development: Create in memory if database fails
      if (process.env.NODE_ENV === 'development') {
        const now = new Date().toISOString();
        const newItem: ContentItemType = {
          ...item,
          id: uuidv4(),
          created_at: now,
          updated_at: now,
          user_id: user.id
        };
        setContentItems(prev => [newItem, ...prev]);
        toast.info('Created content in memory (development mode)');
      }
    }
  };

  const updateContentItem = async (id: string, updates: Partial<ContentItemType>) => {
    if (!user) {
      toast.error('You must be logged in to update content');
      return;
    }

    // Get the existing item
    const existingItem = contentItems.find(item => item.id === id);
    if (!existingItem) {
      toast.error('Content item not found');
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
        .eq('user_id', user.id);
        
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
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (kwError && kwError.code !== 'PGRST116') throw kwError;
            
            let keywordId;
            
            if (!existingKeyword) {
              // Create keyword if it doesn't exist
              const { data: newKeyword, error: insertError } = await supabase
                .from('keywords')
                .insert({
                  keyword: kwToAdd,
                  user_id: user.id
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
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (kwError && kwError.code !== 'PGRST116') throw kwError;
            
            let keywordId;
            
            if (!existingKeyword) {
              // Create keyword if it doesn't exist
              const { data: newKeyword, error: insertError } = await supabase
                .from('keywords')
                .insert({
                  keyword: kwToAdd,
                  user_id: user.id
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
      
      toast.success('Content updated successfully');
      
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
      toast.error(error.message || 'Error updating content');
      
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
    if (!user) {
      toast.error('You must be logged in to delete content');
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
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Content deleted successfully');
      
      // Update local state
      setContentItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting content item:', error);
      toast.error(error.message || 'Error deleting content');
      
      // Fallback for development: Delete from memory if database fails
      if (process.env.NODE_ENV === 'development') {
        setContentItems(prev => prev.filter(item => item.id !== id));
        toast.info('Deleted content from memory (development mode)');
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

  return (
    <ContentContext.Provider 
      value={{ 
        contentItems, 
        loading,
        addContentItem, 
        updateContentItem, 
        deleteContentItem, 
        getContentItem,
        publishContent
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
