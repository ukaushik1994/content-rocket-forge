
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DraftsHeader } from '@/components/drafts/DraftsHeader';
import { DraftsList } from '@/components/drafts/DraftsList';
import { DraftDetailView } from '@/components/drafts/DraftDetailView';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';

const Drafts = () => {
  const {
    contentItems,
    refreshContent
  } = useContent();
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Refresh content when component mounts
  useEffect(() => {
    // Force refresh of content items when the page loads
    refreshContent();

    // Check if we're coming from the content builder
    const fromContentBuilder = sessionStorage.getItem('from_content_builder');
    if (fromContentBuilder === 'true') {
      console.log('Coming from content builder, refreshing content...');
      // Double-check with a slight delay to ensure DB operations have completed
      setTimeout(() => {
        refreshContent();
      }, 1000);
    }

    // Clear any session storage flags that might have been set by ContentBuilder
    sessionStorage.removeItem('from_content_builder');
    sessionStorage.removeItem('content_save_timestamp');
  }, [refreshContent]);

  const handleOpenDetailView = (draft: any) => {
    setSelectedDraft(draft);
    setDetailViewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Drafts | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <DraftsHeader />
        <DraftsList />
        
        <DraftDetailView 
          open={detailViewOpen} 
          onClose={() => setDetailViewOpen(false)} 
          draft={selectedDraft} 
        />
      </main>
    </div>
  );
};

export default Drafts;
