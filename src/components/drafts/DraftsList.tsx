
import React, { useEffect, useState } from 'react';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  TabSelector,
  ContentGrid, 
  EmptyState, 
  LoadingState 
} from './list';

interface DraftsListProps {
  onOpenDetailView?: (draft: any) => void;
}

export function DraftsList({ onOpenDetailView }: DraftsListProps) {
  const { contentItems, loading, deleteContentItem, refreshContent } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshCount, setRefreshCount] = useState(0);

  // Filter drafts from content items
  const drafts = contentItems.filter(item => item.status === 'draft');
  const publishedItems = contentItems.filter(item => item.status === 'published');

  // Check for updates from content builder
  useEffect(() => {
    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    const timestamp = sessionStorage.getItem('content_save_timestamp');
    
    console.log('[DraftsList] Checking for saved draft flag:', contentDraftSaved);
    console.log('[DraftsList] Content save timestamp:', timestamp);
    console.log('[DraftsList] Current content items:', contentItems.length);
    
    if (contentDraftSaved === 'true') {
      console.log('[DraftsList] Draft saved flag found, refreshing content...');
      
      const toastId = toast.loading('Updating drafts list...');
      refreshContent().then(() => {
        console.log('[DraftsList] Content refreshed after draft saved');
        toast.success('Drafts list updated', { id: toastId });
        setRefreshCount(prev => prev + 1);
      });
      
      sessionStorage.removeItem('content_draft_saved');
    }
  }, [refreshContent, contentItems.length]);

  // Function to get displayed items based on selected tab
  const getDisplayedItems = () => {
    switch(selectedTab) {
      case 'drafts':
        return drafts;
      case 'published':
        return publishedItems;
      case 'all':
      default:
        return contentItems;
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to content wizard with the selected draft
    navigate(`/ai-chat`, { state: { contentId: id } });
  };

  const handleView = (id: string) => {
    // If we have a detail view handler, use it
    const itemToView = contentItems.find(item => item.id === id);
    if (onOpenDetailView && itemToView) {
      onOpenDetailView(itemToView);
    } else {
      // Fallback to toast
      toast.info('Preview functionality will be implemented soon');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContentItem(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleRefresh = () => {
    const toastId = toast.loading('Refreshing content...');
    refreshContent().then(() => {
      console.log('[DraftsList] Content manually refreshed, found items:', contentItems.length);
      toast.success('Content refreshed successfully', { id: toastId });
      setRefreshCount(prev => prev + 1);
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  const displayedItems = getDisplayedItems();
  console.log('[DraftsList] Displaying items:', displayedItems.length);

  return (
    <div className="space-y-6">
      <TabSelector 
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        contentCount={contentItems.length}
        draftsCount={drafts.length}
        publishedCount={publishedItems.length}
      />
      
      {displayedItems.length === 0 ? (
        <EmptyState selectedTab={selectedTab} />
      ) : (
        <ContentGrid 
          items={displayedItems}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
