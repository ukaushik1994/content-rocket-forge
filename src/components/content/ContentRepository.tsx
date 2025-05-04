
import React, { useEffect, useCallback, useState } from 'react';
import { useContent } from '@/contexts/content';
import { useContentFiltering } from './repository/hooks/useContentFiltering';
import { useContentActions } from './repository/hooks/useContentActions';
import { EnhancedContentFilters } from './repository/EnhancedContentFilters';
import { ContentDisplay } from './repository/ContentDisplay';
import { ContentDialogs } from './repository/ContentDialogs';
import { useLocation } from 'react-router-dom';

export function ContentRepository() {
  // Standard configuration
  const [itemsPerPage] = React.useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get content data and loading state
  const { contentItems, loading } = useContent();
  const location = useLocation();
  
  // Use custom hooks for filtering and actions
  const { 
    filterState, 
    filteredItems, 
    appliedFilters, 
    clearAllFilters, 
    clearFilter,
    handlePageChange,
    resetFilters
  } = useContentFiltering(contentItems);
  
  const {
    selectedContentId,
    setSelectedContentId,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    actions
  } = useContentActions();

  // Function to handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    // Reset to first page and maintain current filters
    handlePageChange(1);
  }, [handlePageChange]);
  
  // Check if we should highlight a specific item from navigation
  useEffect(() => {
    if (location.state?.highlightId) {
      setSelectedContentId(location.state.highlightId);
      // Clear the state to prevent persistent highlighting
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setSelectedContentId]);
  
  // Set the first content item as selected by default when items load
  useEffect(() => {
    if (filteredItems.length > 0 && !selectedContentId) {
      setSelectedContentId(filteredItems[0].id);
    } else if (filteredItems.length === 0) {
      setSelectedContentId(null);
    }
  }, [filteredItems, selectedContentId, setSelectedContentId]);
  
  // If the currently selected item is filtered out, select the first available one
  useEffect(() => {
    if (selectedContentId && !filteredItems.find(item => item.id === selectedContentId)) {
      setSelectedContentId(filteredItems.length > 0 ? filteredItems[0].id : null);
    }
  }, [filteredItems, selectedContentId, setSelectedContentId]);

  // After deletion, make sure we refresh the view
  useEffect(() => {
    if (!isDeleting && !isDeleteDialogOpen) {
      handleRefresh();
    }
  }, [isDeleting, isDeleteDialogOpen, handleRefresh]);

  // Get selected content for dialogs
  const selectedContent = selectedContentId 
    ? filteredItems.find(item => item.id === selectedContentId) || null
    : null;

  return (
    <div className="space-y-6">
      <EnhancedContentFilters
        searchQuery={filterState.searchQuery}
        setSearchQuery={filterState.setSearchQuery}
        filterStatus={filterState.filterStatus}
        setFilterStatus={filterState.setFilterStatus}
        sortBy={filterState.sortBy}
        setSortBy={filterState.setSortBy}
        dateRange={filterState.dateRange}
        setDateRange={filterState.setDateRange}
        keywordFilter={filterState.keywordFilter}
        setKeywordFilter={filterState.setKeywordFilter}
        appliedFilters={appliedFilters}
        clearFilters={clearAllFilters}
        clearFilter={clearFilter}
      />
      
      <ContentDisplay
        key={`content-display-${refreshKey}`}
        loading={loading}
        filteredItems={filteredItems}
        searchQuery={filterState.searchQuery}
        filterStatus={filterState.filterStatus}
        selectedContentId={selectedContentId}
        currentPage={filterState.currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onSelect={actions.handleSelectContent}
        onEdit={actions.handleEditContent}
        onPreview={actions.handlePreviewContent}
        onAnalyze={actions.handleAnalyzeContent}
        onPublish={actions.handlePublishContent}
        onArchive={actions.handleArchiveContent}
        onDelete={actions.handleDeleteContent}
      />

      <ContentDialogs
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        selectedContent={selectedContent}
        onSaveContent={actions.handleSaveContent}
        onConfirmDelete={actions.confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
