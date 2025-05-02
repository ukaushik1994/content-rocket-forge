
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Define content item type
export interface ContentItem {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  user_id: string;
  seo_score?: number;
  keywords?: string[];
}

interface ContentContextType {
  contentItems: ContentItem[];
  loading: boolean;
  createContent: (content: Partial<ContentItem>, selectedKeywords?: string[]) => Promise<string | null>;
  updateContent: (id: string, content: Partial<ContentItem>, selectedKeywords?: string[]) => Promise<boolean>;
  deleteContent: (id: string) => Promise<boolean>;
  getContentById: (id: string) => Promise<ContentItem | null>;
  refreshContentItems: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType>({
  contentItems: [],
  loading: false,
  createContent: async () => null,
  updateContent: async () => false,
  deleteContent: async () => false,
  getContentById: async () => null,
  refreshContentItems: async () => {},
});

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const refreshContentItems = async () => {
    if (!user) {
      setContentItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch content items
      const { data: items, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // For each content item, fetch associated keywords
      const itemsWithKeywords = await Promise.all(
        items.map(async (item) => {
          // Ensure status is one of the valid types
          const validStatus = (item.status as string) === 'draft' || 
                              (item.status as string) === 'published' || 
                              (item.status as string) === 'archived' 
                              ? (item.status as 'draft' | 'published' | 'archived') 
                              : 'draft';
                              
          const { data: keywordLinks, error: keywordError } = await supabase
            .from('content_keywords')
            .select('keyword_id')
            .eq('content_id', item.id);
            
          if (keywordError) {
            console.error('Error fetching keyword links:', keywordError);
            return { 
              ...item, 
              keywords: [],
              status: validStatus
            } as ContentItem;
          }
          
          if (keywordLinks && keywordLinks.length > 0) {
            // Get all keyword IDs
            const keywordIds = keywordLinks.map(link => link.keyword_id);
            
            // Fetch the keywords
            const { data: keywords, error: keywordDataError } = await supabase
              .from('keywords')
              .select('keyword')
              .in('id', keywordIds);
              
            if (keywordDataError) {
              console.error('Error fetching keywords:', keywordDataError);
              return { 
                ...item, 
                keywords: [],
                status: validStatus
              } as ContentItem;
            }
            
            return { 
              ...item, 
              keywords: keywords.map(k => k.keyword),
              status: validStatus
            } as ContentItem;
          }
          
          return { 
            ...item, 
            keywords: [],
            status: validStatus
          } as ContentItem;
        })
      );
      
      setContentItems(itemsWithKeywords);
    } catch (err) {
      console.error('Error fetching content items:', err);
      toast.error('Failed to load content items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContentItems();
  }, [user]);

  const createContent = async (content: Partial<ContentItem>, selectedKeywords?: string[]): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create content');
      return null;
    }
    
    try {
      // Ensure status is a valid type
      const validStatus = (content.status as string) === 'draft' || 
                          (content.status as string) === 'published' || 
                          (content.status as string) === 'archived' 
                          ? content.status 
                          : 'draft';
    
      // Insert the content item
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          title: content.title || 'Untitled Content',
          content: content.content || '',
          status: validStatus,
          user_id: user.id,
          seo_score: content.seo_score || 0,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If keywords are provided, link them to the content
      if (selectedKeywords && selectedKeywords.length > 0 && data) {
        // First, lookup keyword IDs
        for (const keyword of selectedKeywords) {
          // Check if the keyword exists
          const { data: existingKeyword, error: lookupError } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.id)
            .single();
            
          if (lookupError && lookupError.code !== 'PGRST116') { // Not found error
            console.error('Error looking up keyword:', lookupError);
            continue;
          }
          
          let keywordId;
          
          if (!existingKeyword) {
            // Keyword doesn't exist, create it
            const { data: newKeyword, error: insertError } = await supabase
              .from('keywords')
              .insert({
                keyword,
                user_id: user.id
              })
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating keyword:', insertError);
              continue;
            }
            
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }
          
          // Now link the keyword to the content
          const { error: linkError } = await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });
            
          if (linkError) {
            console.error('Error linking keyword to content:', linkError);
          }
        }
      }
      
      // Refresh the content list
      await refreshContentItems();
      toast.success('Content created successfully');
      return data.id;
    } catch (err) {
      console.error('Error creating content:', err);
      toast.error('Failed to create content');
      return null;
    }
  };

  const updateContent = async (id: string, content: Partial<ContentItem>, selectedKeywords?: string[]): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update content');
      return false;
    }

    try {
      // Ensure status is a valid type
      const validStatus = (content.status as string) === 'draft' || 
                          (content.status as string) === 'published' || 
                          (content.status as string) === 'archived' 
                          ? content.status 
                          : 'draft';
    
      // Update the content item
      const { error } = await supabase
        .from('content_items')
        .update({
          title: content.title,
          content: content.content,
          status: validStatus,
          seo_score: content.seo_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // If keywords are provided, update the links
      if (selectedKeywords !== undefined) {
        // First, remove all existing links
        const { error: deleteError } = await supabase
          .from('content_keywords')
          .delete()
          .eq('content_id', id);
          
        if (deleteError) {
          console.error('Error removing existing keyword links:', deleteError);
        }
        
        // Then add the new links
        if (selectedKeywords && selectedKeywords.length > 0) {
          for (const keyword of selectedKeywords) {
            // Check if the keyword exists
            const { data: existingKeyword, error: lookupError } = await supabase
              .from('keywords')
              .select('id')
              .eq('keyword', keyword)
              .eq('user_id', user.id)
              .single();
              
            if (lookupError && lookupError.code !== 'PGRST116') { // Not found error
              console.error('Error looking up keyword:', lookupError);
              continue;
            }
            
            let keywordId;
            
            if (!existingKeyword) {
              // Keyword doesn't exist, create it
              const { data: newKeyword, error: insertError } = await supabase
                .from('keywords')
                .insert({
                  keyword,
                  user_id: user.id
                })
                .select()
                .single();
                
              if (insertError) {
                console.error('Error creating keyword:', insertError);
                continue;
              }
              
              keywordId = newKeyword.id;
            } else {
              keywordId = existingKeyword.id;
            }
            
            // Now link the keyword to the content
            const { error: linkError } = await supabase
              .from('content_keywords')
              .insert({
                content_id: id,
                keyword_id: keywordId
              });
              
            if (linkError) {
              console.error('Error linking keyword to content:', linkError);
            }
          }
        }
      }
      
      // Refresh the content list
      await refreshContentItems();
      toast.success('Content updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating content:', err);
      toast.error('Failed to update content');
      return false;
    }
  };

  const deleteContent = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete content');
      return false;
    }
    
    try {
      // First delete all keyword links
      const { error: linkDeleteError } = await supabase
        .from('content_keywords')
        .delete()
        .eq('content_id', id);
        
      if (linkDeleteError) {
        console.error('Error deleting keyword links:', linkDeleteError);
      }
      
      // Then delete the content item
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh the content list
      await refreshContentItems();
      toast.success('Content deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting content:', err);
      toast.error('Failed to delete content');
      return false;
    }
  };

  const getContentById = async (id: string): Promise<ContentItem | null> => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Ensure status is a valid type
      const validStatus = (data.status as string) === 'draft' || 
                          (data.status as string) === 'published' || 
                          (data.status as string) === 'archived' 
                          ? (data.status as 'draft' | 'published' | 'archived') 
                          : 'draft';
      
      // Get associated keywords
      const { data: keywordLinks, error: keywordError } = await supabase
        .from('content_keywords')
        .select('keyword_id')
        .eq('content_id', id);
        
      if (keywordError) {
        console.error('Error fetching keyword links:', keywordError);
        return {
          ...data,
          status: validStatus
        } as ContentItem;
      }
      
      if (keywordLinks && keywordLinks.length > 0) {
        // Get all keyword IDs
        const keywordIds = keywordLinks.map(link => link.keyword_id);
        
        // Fetch the keywords
        const { data: keywords, error: keywordDataError } = await supabase
          .from('keywords')
          .select('keyword')
          .in('id', keywordIds);
          
        if (keywordDataError) {
          console.error('Error fetching keywords:', keywordDataError);
          return {
            ...data,
            status: validStatus
          } as ContentItem;
        }
        
        return { 
          ...data, 
          keywords: keywords.map(k => k.keyword),
          status: validStatus
        } as ContentItem;
      }
      
      return {
        ...data,
        status: validStatus
      } as ContentItem;
    } catch (err) {
      console.error('Error fetching content by id:', err);
      return null;
    }
  };

  const value = {
    contentItems,
    loading,
    createContent,
    updateContent,
    deleteContent,
    getContentById,
    refreshContentItems,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => useContext(ContentContext);

export default ContentContext;
