
import React, { useState, useEffect } from 'react';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ContentFilters, 
  ContentGrid, 
  ViewToggle
} from './repository';

export function ContentRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('grid');
  const { contentItems, loading, updateContentItem } = useContent();
  const [filteredItems, setFilteredItems] = useState(contentItems);
  const navigate = useNavigate();
  
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
  }, [contentItems, searchQuery, sortBy, filterStatus]);

  const handleViewContent = (id: string) => {
    // In a real app, navigate to content view page
    toast.info(`Viewing content: ${id}`);
  };

  const handleEditContent = (id: string) => {
    // In a real app, navigate to content editor with the content loaded
    navigate(`/content-builder?edit=${id}`);
  };

  const handleAnalyzeContent = (id: string) => {
    // In a real app, navigate to content analytics page
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
      
      <ViewToggle view={view} setView={setView} />
      
      <ContentGrid 
        loading={loading}
        filteredItems={filteredItems}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onEdit={handleEditContent}
        onView={handleViewContent}
        onAnalyze={handleAnalyzeContent}
        onPublish={handlePublishContent}
        onArchive={handleArchiveContent}
      />
    </div>
  );
}
