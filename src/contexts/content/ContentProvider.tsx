import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { ContentItemType, ContentContextType } from './types';
import { fetchItemKeywords, processContentItems } from './utils';
import { createContentActions } from './actions';

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [contentItems, setContentItems] = useState<ContentItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch content items function
  const fetchContentItems = useCallback(async () => {
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
        setContentItems([]);
        setLoading(false);
        return;
      }
      
      // Process the content items with keywords
      const processedItems = await processContentItems(contentData);
      setContentItems(processedItems);
    } catch (error: any) {
      console.error('Error fetching content items:', error);
      toast.error('Failed to load content items');
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial loading of content
  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]);

  // Set up realtime subscription
  useEffect(() => {
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
              // Remove the item from state immediately
              setContentItems(prev => prev.filter(item => item.id !== deletedItem.id));
              // Re-fetch all items to ensure state is fresh (optional, helps with complex deletions)
              setTimeout(fetchContentItems, 500);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchContentItems]);
  
  // Create all content-related actions using our refactored approach
  const actions = createContentActions(contentItems, setContentItems, user?.id);

  return (
    <ContentContext.Provider 
      value={{ 
        contentItems, 
        loading,
        ...actions,
        refreshContent: fetchContentItems
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
