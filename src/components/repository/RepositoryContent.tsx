import React, { useState, useEffect } from 'react';
import { RepositoryFilters } from './RepositoryFilters';
import { RepositoryGrid } from './RepositoryGrid';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { useContent } from '@/contexts/content';
import { ContentItemType, ContentType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

interface RepositoryContentProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryContent: React.FC<RepositoryContentProps> = ({ 
  onOpenDetailView 
}) => {
  const { contentItems, loading } = useContent();
  const [filteredItems, setFilteredItems] = useState<ContentItemType[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter content based on selected filters
  useEffect(() => {
    let filtered = [...contentItems];

    // Filter by content type
    if (selectedContentType !== 'all') {
      filtered = filtered.filter(item => item.content_type === selectedContentType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
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

    // Sort by updated_at descending
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredItems(filtered);
  }, [contentItems, selectedContentType, selectedStatus, searchQuery]);

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
      <RepositoryFilters
        contentStats={contentStats}
        selectedContentType={selectedContentType}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        onContentTypeChange={setSelectedContentType}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearchQuery}
      />

      {filteredItems.length === 0 && !loading ? (
        <EmptyState 
          contentType={selectedContentType}
          status={selectedStatus}
          searchQuery={searchQuery}
        />
      ) : (
        <RepositoryGrid 
          items={filteredItems}
          onOpenDetailView={onOpenDetailView}
        />
      )}
    </motion.div>
  );
};