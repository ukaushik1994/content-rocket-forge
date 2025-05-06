
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DraftsHeader } from '@/components/drafts/DraftsHeader';
import { DraftsList } from '@/components/drafts/DraftsList';
import { DraftDetailView } from '@/components/drafts/DraftDetailView';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';

const Drafts = () => {
  const { contentItems, refreshContent } = useContent();
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  
  // Refresh content when component mounts
  useEffect(() => {
    refreshContent();
    
    // Clear any session storage flags that might have been set by ContentBuilder
    sessionStorage.removeItem('from_content_builder');
    sessionStorage.removeItem('content_save_timestamp');
  }, [refreshContent]);
  
  const handleOpenDetailView = (draft: any) => {
    setSelectedDraft(draft);
    setDetailViewOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background bg-slate-950">
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
