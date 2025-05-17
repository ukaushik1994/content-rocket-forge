
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DraftsHeader } from '@/components/drafts/DraftsHeader';
import { DraftsList } from '@/components/drafts/DraftsList';
import { DraftDetailView } from '@/components/drafts/DraftDetailView';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Drafts = () => {
  const {
    contentItems,
    refreshContent
  } = useContent();
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const location = useLocation();

  // Refresh content when component mounts or when redirected from content builder
  useEffect(() => {
    refreshContent();

    // Check if we have a selected draft from navigation
    if (location.state?.selectedDraft) {
      setSelectedDraft(location.state.selectedDraft);
      setDetailViewOpen(true);
    }

    // Check if we need to refresh content (coming from content builder)
    if (location.state?.contentRefresh || sessionStorage.getItem('from_content_builder')) {
      console.log('Refreshing content from builder redirect');
      sessionStorage.removeItem('from_content_builder');
      sessionStorage.removeItem('content_save_timestamp');
    }
  }, [refreshContent, location.state]);
  
  const handleOpenDetailView = (draft: any) => {
    setSelectedDraft(draft);
    setDetailViewOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Content Drafts | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-12 px-4 md:px-8 max-w-7xl mx-auto">
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
