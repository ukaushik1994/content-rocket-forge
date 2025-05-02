
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  seo_score?: number;
  keywords?: string[];
}

interface ContentContextType {
  contentItems: ContentItem[];
  loading: boolean;
  createContent: (contentData: Partial<ContentItem>, keywords?: string[]) => Promise<string | null>;
  updateContent: (id: string, contentData: Partial<ContentItem>, keywords?: string[]) => Promise<boolean>;
  deleteContent: (id: string) => Promise<boolean>;
  refreshContentItems: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType>({
  contentItems: [],
  loading: false,
  createContent: async () => null,
  updateContent: async () => false,
  deleteContent: async () => false,
  refreshContentItems: async () => {},
});

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContentItems = async () => {
    try {
      setLoading(true);
      
      const { data: items, error } = await supabase
        .from('content_items')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Fetch keywords for each content item
      const contentWithKeywords = await Promise.all(
        items.map(async (item) => {
          const { data: keywordLinks, error: linkError } = await supabase
            .from('content_keywords')
            .select('keyword_id')
            .eq('content_id', item.id);
          
          if (linkError) {
            console.error('Error fetching keyword links:', linkError);
            return { ...item, keywords: [] };
          }
          
          if (keywordLinks && keywordLinks.length > 0) {
            const keywordIds = keywordLinks.map(link => link.keyword_id);
            
            const { data: keywords, error: keywordError } = await supabase
              .from('keywords')
              .select('keyword')
              .in('id', keywordIds);
            
            if (keywordError) {
              console.error('Error fetching keywords:', keywordError);
              return { ...item, keywords: [] };
            }
            
            return {
              ...item,
              keywords: keywords.map(k => k.keyword)
            };
          }
          
          return { ...item, keywords: [] };
        })
      );
      
      setContentItems(contentWithKeywords);
    } catch (error) {
      console.error('Error fetching content items:', error);
      toast.error('Failed to load content items');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch content items on mount
  useEffect(() => {
    fetchContentItems();
  }, []);
  
  const createContent = async (contentData: Partial<ContentItem>, keywords?: string[]) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create content');
        return null;
      }
      
      // Insert the content item
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          ...contentData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // If keywords were provided, create the keyword-content relationships
      if (keywords && keywords.length > 0 && data) {
        // First get existing keywords or create new ones
        const keywordIds = await Promise.all(
          keywords.map(async (keyword) => {
            // Check if the keyword already exists
            const { data: existingKeywords } = await supabase
              .from('keywords')
              .select('id')
              .eq('keyword', keyword)
              .limit(1);
            
            if (existingKeywords && existingKeywords.length > 0) {
              return existingKeywords[0].id;
            } else {
              // Create a new keyword
              const { data: newKeyword, error: keywordError } = await supabase
                .from('keywords')
                .insert({
                  keyword,
                  user_id: user.id,
                })
                .select()
                .single();
              
              if (keywordError) {
                console.error('Error creating keyword:', keywordError);
                return null;
              }
              
              return newKeyword?.id;
            }
          })
        );
        
        // Filter out any null values
        const validKeywordIds = keywordIds.filter(id => id !== null) as string[];
        
        // Create content_keywords entries
        if (validKeywordIds.length > 0) {
          const contentKeywords = validKeywordIds.map(keywordId => ({
            content_id: data.id,
            keyword_id: keywordId,
          }));
          
          const { error: linkError } = await supabase
            .from('content_keywords')
            .insert(contentKeywords);
          
          if (linkError) {
            console.error('Error linking keywords to content:', linkError);
          }
        }
      }
      
      // Update the local state with the new content item
      const newContentItem = {
        ...data,
        keywords: keywords || [],
      };
      
      setContentItems(prev => [newContentItem, ...prev]);
      toast.success('Content created successfully');
      return data.id;
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
      return null;
    }
  };
  
  const updateContent = async (id: string, contentData: Partial<ContentItem>, keywords?: string[]) => {
    try {
      // Update the content item
      const { error } = await supabase
        .from('content_items')
        .update(contentData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update keywords if provided
      if (keywords !== undefined) {
        // First, get the current user for creating new keywords if needed
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('You must be logged in to update keywords');
          return false;
        }
        
        // Delete existing content_keywords relationships
        const { error: deleteError } = await supabase
          .from('content_keywords')
          .delete()
          .eq('content_id', id);
        
        if (deleteError) {
          console.error('Error deleting existing keyword links:', deleteError);
        }
        
        // Create new relationships if keywords were provided
        if (keywords.length > 0) {
          // Get or create keywords
          const keywordIds = await Promise.all(
            keywords.map(async (keyword) => {
              // Check if the keyword already exists
              const { data: existingKeywords } = await supabase
                .from('keywords')
                .select('id')
                .eq('keyword', keyword)
                .limit(1);
              
              if (existingKeywords && existingKeywords.length > 0) {
                return existingKeywords[0].id;
              } else {
                // Create a new keyword
                const { data: newKeyword, error: keywordError } = await supabase
                  .from('keywords')
                  .insert({
                    keyword,
                    user_id: user.id,
                  })
                  .select()
                  .single();
                
                if (keywordError) {
                  console.error('Error creating keyword:', keywordError);
                  return null;
                }
                
                return newKeyword?.id;
              }
            })
          );
          
          // Filter out any null values
          const validKeywordIds = keywordIds.filter(id => id !== null) as string[];
          
          // Create content_keywords entries
          if (validKeywordIds.length > 0) {
            const contentKeywords = validKeywordIds.map(keywordId => ({
              content_id: id,
              keyword_id: keywordId,
            }));
            
            const { error: linkError } = await supabase
              .from('content_keywords')
              .insert(contentKeywords);
            
            if (linkError) {
              console.error('Error linking keywords to content:', linkError);
            }
          }
        }
      }
      
      // Refresh content items to get the updated data
      await fetchContentItems();
      toast.success('Content updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
      return false;
    }
  };
  
  const deleteContent = async (id: string) => {
    try {
      // First, delete keyword relationships to prevent foreign key constraints
      const { error: keywordLinkError } = await supabase
        .from('content_keywords')
        .delete()
        .eq('content_id', id);
      
      if (keywordLinkError) {
        console.error('Error deleting keyword links:', keywordLinkError);
      }
      
      // Then delete the content item
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setContentItems(prev => prev.filter(item => item.id !== id));
      toast.success('Content deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
      return false;
    }
  };
  
  const refreshContentItems = async () => {
    await fetchContentItems();
  };
  
  return (
    <ContentContext.Provider value={{ contentItems, loading, createContent, updateContent, deleteContent, refreshContentItems }}>
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;
