import React, { useState, useEffect } from 'react';
import { RepositoryFilters } from './RepositoryFilters';
import { RepositoryGrid } from './RepositoryGrid';
import { RepositoryList } from './RepositoryList';
import { RepositoryControls, ViewMode } from './RepositoryControls';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { useContent } from '@/contexts/content';
import { ContentItemType, ContentType } from '@/contexts/content/types';
import { useContentActions } from '@/components/content/repository/hooks/useContentActions';
import { ContentDialogs } from '@/components/content/repository/ContentDialogs';
import { motion } from 'framer-motion';

interface RepositoryContentProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryContent: React.FC<RepositoryContentProps> = ({ 
  onOpenDetailView 
}) => {
  const { contentItems, loading } = useContent();
  const {
    selectedContentId,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    actions
  } = useContentActions();
  const [filteredItems, setFilteredItems] = useState<ContentItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [advancedFilters, setAdvancedFilters] = useState<any>({});

  // Filter content based on selected filters
  useEffect(() => {
    let filtered = [...contentItems];

    // Filter by content type (now from advanced filters)
    if (advancedFilters.contentType && advancedFilters.contentType !== 'all') {
      filtered = filtered.filter(item => item.content_type === advancedFilters.contentType);
    }

    // Filter by status (now from advanced filters)
    if (advancedFilters.status && advancedFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status === advancedFilters.status);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.metadata?.description?.toLowerCase().includes(query) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply advanced filters
    if (advancedFilters.dateRange?.from || advancedFilters.dateRange?.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.updated_at);
        const fromDate = advancedFilters.dateRange?.from ? new Date(advancedFilters.dateRange.from) : null;
        const toDate = advancedFilters.dateRange?.to ? new Date(advancedFilters.dateRange.to) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    if (advancedFilters.keywords) {
      const keywords = advancedFilters.keywords.toLowerCase();
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(keywords) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(keywords))
      );
    }

    if (advancedFilters.tags?.length > 0) {
      filtered = filtered.filter(item => 
        advancedFilters.tags.some(filterTag => 
          item.metadata?.tags?.some(itemTag => 
            itemTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    // Sort by updated_at descending
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredItems(filtered);
  }, [contentItems, searchQuery, advancedFilters]);

  // Calculate content statistics
  const contentStats = {
    total: contentItems.length,
    articles: contentItems.filter(item => item.content_type === 'article').length,
    blogs: contentItems.filter(item => item.content_type === 'blog').length,
    glossaries: contentItems.filter(item => item.content_type === 'glossary').length,
    socialPosts: contentItems.filter(item => item.content_type === 'social_post').length,
    emails: contentItems.filter(item => item.content_type === 'email').length,
    landingPages: contentItems.filter(item => item.content_type === 'landing_page').length,
    drafts: contentItems.filter(item => item.status === 'draft').length,
    published: contentItems.filter(item => item.status === 'published').length,
    archived: contentItems.filter(item => item.status === 'archived').length
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <RepositoryControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersApply={setAdvancedFilters}
        contentStats={contentStats}
      />

      <RepositoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredItems.length === 0 && !loading ? (
        <EmptyState 
          contentType={'all'}
          status={advancedFilters.status || 'all'}
          searchQuery={searchQuery}
        />
      ) : viewMode === 'grid' ? (
        <RepositoryGrid 
          items={filteredItems}
          onOpenDetailView={onOpenDetailView}
        />
      ) : (
        <RepositoryList 
          items={filteredItems}
          onOpenDetailView={onOpenDetailView}
          onEdit={(content) => actions.handleEditContent(content.id)}
          onPreview={(content) => actions.handlePreviewContent(content.id)}
          onAnalyze={(content) => actions.handleAnalyzeContent(content.id)}
          onPublish={(content) => actions.handlePublishContent(content.id)}
          onArchive={(content) => actions.handleArchiveContent(content.id)}
          onDelete={(content) => actions.handleDeleteContent(content.id)}
        />
      )}

      <ContentDialogs
        selectedContent={contentItems.find(item => item.id === selectedContentId) || null}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onSaveContent={actions.handleSaveContent}
        onConfirmDelete={actions.confirmDelete}
      />
    </motion.div>
  );
};