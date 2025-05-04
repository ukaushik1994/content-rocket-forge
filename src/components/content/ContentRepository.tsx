
import React, { useState, useEffect } from 'react';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  EnhancedContentFilters, 
  ContentGrid, 
  ViewToggle,
  ContentDetailView,
  ContentEditDialog,
  DeleteConfirmationDialog
} from './repository';
import { ContentItemType } from '@/contexts/content';
import { format } from 'date-fns';

export function ContentRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('grid');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { contentItems, loading, updateContentItem, deleteContentItem } = useContent();
  const [filteredItems, setFilteredItems] = useState<ContentItemType[]>(contentItems);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const navigate = useNavigate();
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, dateRange, keywordFilter, sortBy]);
  
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
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Apply date filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.updated_at);
        if (dateRange.from && dateRange.to) {
          // Set time to end of day for the to date for inclusive range
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate >= dateRange.from && itemDate <= endDate;
        } else if (dateRange.from) {
          return itemDate >= dateRange.from;
        } else if (dateRange.to) {
          // Set time to end of day for inclusive to date
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate <= endDate;
        }
        return true;
      });
    }
    
    // Apply keyword filter
    if (keywordFilter) {
      const normalizedKeyword = keywordFilter.toLowerCase();
      filtered = filtered.filter(item =>
        item.keywords.some(keyword => keyword.toLowerCase().includes(normalizedKeyword))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'score') {
        return (b.seo_score || 0) - (a.seo_score || 0);
      } else if (sortBy === 'wordCount') {
        const aWordCount = a.content ? a.content.split(/\s+/).length : 0;
        const bWordCount = b.content ? b.content.split(/\s+/).length : 0;
        return bWordCount - aWordCount;
      }
      return 0;
    });
    
    setFilteredItems(filtered);
    
    // If the currently selected item is filtered out, select the first available one
    if (selectedContentId && !filtered.find(item => item.id === selectedContentId)) {
      setSelectedContentId(filtered.length > 0 ? filtered[0].id : null);
    }
  }, [contentItems, searchQuery, sortBy, filterStatus, dateRange, keywordFilter]);

  // Generate applied filters list for display
  const getAppliedFilters = () => {
    const filters: string[] = [];
    
    if (filterStatus !== 'all') {
      filters.push(`Status: ${filterStatus}`);
    }
    
    if (dateRange.from && dateRange.to) {
      filters.push(`Date: ${format(dateRange.from, 'MM/dd/yyyy')} to ${format(dateRange.to, 'MM/dd/yyyy')}`);
    } else if (dateRange.from) {
      filters.push(`Date: From ${format(dateRange.from, 'MM/dd/yyyy')}`);
    } else if (dateRange.to) {
      filters.push(`Date: Until ${format(dateRange.to, 'MM/dd/yyyy')}`);
    }
    
    if (keywordFilter) {
      filters.push(`Keyword: ${keywordFilter}`);
    }
    
    return filters;
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setDateRange({ from: undefined, to: undefined });
    setKeywordFilter('');
  };

  const clearFilter = (filter: string) => {
    if (filter.startsWith('Status:')) {
      setFilterStatus('all');
    } else if (filter.startsWith('Date:')) {
      setDateRange({ from: undefined, to: undefined });
    } else if (filter.startsWith('Keyword:')) {
      setKeywordFilter('');
    }
  };

  const handleSelectContent = (id: string) => {
    setSelectedContentId(id);
  };

  const handleEditContent = (id: string) => {
    setSelectedContentId(id);
    setIsEditDialogOpen(true);
  };
  
  const handlePreviewContent = (id: string) => {
    setSelectedContentId(id);
    setIsPreviewOpen(true);
    // Implement preview functionality
    toast.info('Content preview coming soon');
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
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedContent = selectedContentId 
    ? filteredItems.find(item => item.id === selectedContentId) || null
    : null;

  // Get applied filters
  const appliedFilters = getAppliedFilters();

  return (
    <div className="space-y-6">
      <EnhancedContentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        dateRange={dateRange}
        setDateRange={setDateRange}
        keywordFilter={keywordFilter}
        setKeywordFilter={setKeywordFilter}
        appliedFilters={appliedFilters}
        clearFilters={clearAllFilters}
        clearFilter={clearFilter}
      />
      
      <div className="flex justify-between items-center">
        <ViewToggle view={view} setView={setView} />
        
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className={`${selectedContent ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          <ContentGrid 
            loading={loading}
            filteredItems={filteredItems}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            selectedContentId={selectedContentId}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onSelect={handleSelectContent}
            onEdit={handleEditContent}
            onPreview={handlePreviewContent}
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
