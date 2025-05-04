
import React, { useState, useEffect } from 'react';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ContentFilters, 
  ContentGrid, 
  ViewToggle,
  ContentDetailView,
  ContentEditDialog,
  DeleteConfirmationDialog
} from './repository';
import { ContentItemType } from '@/contexts/content';

export function ContentRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('grid');
  const { contentItems, loading, updateContentItem, deleteContentItem } = useContent();
  const [filteredItems, setFilteredItems] = useState(contentItems);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Set the first content item as selected by default when items load
  useEffect(() => {
    if (filteredItems.length > 0 && !selectedContentId) {
      setSelectedContentId(filteredItems[0].id);
    } else if (filteredItems.length === 0) {
      setSelectedContentId(null);
    }
  }, [filteredItems]);
  
  useEffect(() => {
    let filtered = [...contentItems];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'score') {
        return b.seo_score - a.seo_score;
      }
      return 0;
    });
    
    setFilteredItems(filtered);
    
    // If the currently selected item is filtered out, select the first available one
    if (selectedContentId && !filtered.find(item => item.id === selectedContentId)) {
      setSelectedContentId(filtered.length > 0 ? filtered[0].id : null);
    }
  }, [contentItems, searchQuery, sortBy, filterStatus]);

  const handleSelectContent = (id: string) => {
    setSelectedContentId(id);
  };

  const handleEditContent = (id: string) => {
    setSelectedContentId(id);
    setIsEditDialogOpen(true);
  };

  const handleSaveContent = async (updates: Partial<ContentItemType>) => {
    if (!selectedContentId) return;
    
    try {
      await updateContentItem(selectedContentId, updates);
      toast.success('Content updated successfully');
    } catch (error) {
      toast.error('Failed to update content');
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleAnalyzeContent = (id: string) => {
    navigate(`/analytics?content=${id}`);
  };

  const handlePublishContent = async (id: string) => {
    try {
      await updateContentItem(id, { status: 'published' });
      toast.success('Content published successfully');
    } catch (error) {
      toast.error('Failed to publish content');
    }
  };

  const handleArchiveContent = async (id: string) => {
    try {
      await updateContentItem(id, { status: 'archived' });
      toast.success('Content archived successfully');
    } catch (error) {
      toast.error('Failed to archive content');
    }
  };

  const handleDeleteContent = (id: string) => {
    setSelectedContentId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContentId) return;
    
    try {
      await deleteContentItem(selectedContentId);
      toast.success('Content deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedContentId(filteredItems.length > 1 ? 
        filteredItems.find(item => item.id !== selectedContentId)?.id || null : null);
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const selectedContent = selectedContentId 
    ? filteredItems.find(item => item.id === selectedContentId) || null
    : null;

  return (
    <div className="space-y-6">
      <ContentFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      
      <div className="flex justify-between items-center">
        <ViewToggle view={view} setView={setView} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className={`${selectedContent ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          <ContentGrid 
            loading={loading}
            filteredItems={filteredItems}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            selectedContentId={selectedContentId}
            onSelect={handleSelectContent}
            onEdit={handleEditContent}
            onAnalyze={handleAnalyzeContent}
            onPublish={handlePublishContent}
            onArchive={handleArchiveContent}
            onDelete={handleDeleteContent}
          />
        </div>
        
        {selectedContent && (
          <div className="lg:col-span-3">
            <ContentDetailView 
              item={selectedContent}
              onEdit={handleEditContent}
              onAnalyze={handleAnalyzeContent}
              onPublish={handlePublishContent}
              onArchive={handleArchiveContent}
              onDelete={handleDeleteContent}
            />
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <ContentEditDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        content={selectedContent}
        onSave={handleSaveContent}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={selectedContent?.title || ''}
      />
    </div>
  );
}
