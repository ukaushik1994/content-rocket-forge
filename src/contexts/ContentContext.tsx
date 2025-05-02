
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
        const { data, error } = await supabase
          .from('content_items')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;

        if (data) {
          // Map database items to ContentItemType format
          const mappedData: ContentItemType[] = data.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content || '',
            status: item.status as 'draft' | 'published' | 'archived',
            created_at: item.created_at,
            updated_at: item.updated_at,
            seo_score: item.seo_score || 0,
            keywords: [], // We'll need to fetch keywords separately in a real implementation
            user_id: item.user_id,
          }));
          
          setContentItems(mappedData);
        } else {
          // If no data, use fallback only in development
          if (process.env.NODE_ENV === 'development') {
            setContentItems(initialContent);
          } else {
            setContentItems([]);
          }
        }
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
                setContentItems(prev => [newItem, ...prev]);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ContentItemType;
              if (updatedItem.user_id === user.id) {
                setContentItems(prev => prev.map(item => 
                  item.id === updatedItem.id ? updatedItem : item
                ));
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
        // Keywords are handled separately in a real implementation
      };
      
      const { data, error } = await supabase
        .from('content_items')
        .insert(newItem)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        toast.success('Content item created successfully');
        
        // Add to local state (realtime subscription should handle this, but for safety)
        const createdItem: ContentItemType = {
          ...data,
          keywords: item.keywords,
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
      // Prepare updates for the database
      const dbUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        // Remove id and user_id from updates if present
        id: undefined,
        user_id: undefined,
        keywords: undefined, // Handle keywords separately
      };
      
      // Filter out undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });
      
      const { error } = await supabase
        .from('content_items')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Content updated successfully');
      
      // Update local state (realtime subscription should handle this, but for safety)
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
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Content deleted successfully');
      
      // Update local state (realtime subscription should handle this, but for safety)
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
