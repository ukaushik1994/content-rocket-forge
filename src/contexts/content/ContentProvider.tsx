
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { ContentItemType, ContentContextType } from './types';
import { fetchItemKeywords, processContentItems } from './utils';
import { createContentActions } from './actions';
import { createApprovalActions } from './actions/approvalActions';

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [contentItems, setContentItems] = useState<ContentItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const PAGE_SIZE = 20;

  // Helper function to deduplicate content items
  const deduplicateItems = (items: ContentItemType[]): ContentItemType[] => {
    const uniqueMap = new Map<string, ContentItemType>();
    items.forEach(item => {
      uniqueMap.set(item.id, item);
    });
    return Array.from(uniqueMap.values());
  };

  // Fetch content items function
  const fetchContentItems = useCallback(async (append = false) => {
    if (!user) {
      setContentItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const offset = append ? contentItems.length : 0;
      
      // First, fetch the content items
      const { data: contentData, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      
      if (contentError) throw contentError;
      
      if (!contentData || contentData.length === 0) {
        if (!append) setContentItems([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setHasMore(contentData.length === PAGE_SIZE);
      
      // Process the content items with keywords and ensure no duplicates
      const processedItems = await processContentItems(contentData);
      if (append) {
        setContentItems(prev => deduplicateItems([...prev, ...processedItems]));
      } else {
        const uniqueItems = deduplicateItems(processedItems);
        setContentItems(uniqueItems);
      }
    } catch (error: any) {
      console.error('Error fetching content items:', error);
      toast.error('Failed to load content items');
      if (!append) setContentItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, contentItems.length]);

  // Initial loading of content
  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]);

  // Set up realtime subscription for content and approval tables
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('content-approval-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'content_items' },
          (payload) => {
            // Handle content item changes
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as ContentItemType;
              if (newItem.user_id === user.id) {
                fetchItemKeywords(newItem).then(itemWithKeywords => {
                  setContentItems(prev => {
                    const exists = prev.some(item => item.id === itemWithKeywords.id);
                    if (exists) return prev;
                    return [itemWithKeywords, ...prev];
                  });
                });
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ContentItemType;
              if (updatedItem.user_id === user.id) {
                fetchItemKeywords(updatedItem).then(itemWithKeywords => {
                  setContentItems(prev => {
                    const updated = prev.map(item => 
                      item.id === itemWithKeywords.id ? itemWithKeywords : item
                    );
                    if (!updated.some(item => item.id === itemWithKeywords.id)) {
                      return [itemWithKeywords, ...prev];
                    }
                    return updated;
                  });
                });
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as ContentItemType;
              setContentItems(prev => prev.filter(item => item.id !== deletedItem.id));
            }
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'approval_history' },
          () => {
            // Refresh content when approval history changes
            fetchContentItems();
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'content_approvals' },
          () => {
            // Refresh content when approvals change
            fetchContentItems();
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
  const approvalActions = createApprovalActions(actions.updateContentItem, user?.id);

  const loadMore = useCallback(() => fetchContentItems(true), [fetchContentItems]);

  return (
    <ContentContext.Provider 
      value={{ 
        contentItems: deduplicateItems(contentItems),
        loading,
        hasMore,
        loadMore,
        ...actions,
        ...approvalActions,
        refreshContent: () => fetchContentItems(false)
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
