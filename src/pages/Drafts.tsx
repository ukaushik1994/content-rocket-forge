
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DraftsHeader } from '@/components/drafts/DraftsHeader';
import { DraftsList } from '@/components/drafts/DraftsList';
import { DraftDetailView } from '@/components/drafts/DraftDetailView';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const Drafts = () => {
  const {
    contentItems,
    refreshContent,
    loading
  } = useContent();
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Refresh content when component mounts
  useEffect(() => {
    // Force refresh of content items when the page loads
    refreshContent();
    
    // Check if we're coming from the content builder
    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    const saveTimestamp = sessionStorage.getItem('content_save_timestamp');
    
    if (contentDraftSaved === 'true') {
      // Show a loading toast while we refresh
      const toastId = toast.loading('Loading your new draft...');
      
      // Double-check with a slight delay to ensure DB operations have completed
      setTimeout(async () => {
        await refreshContent();
        toast.success('Draft loaded successfully', { id: toastId });
      }, 1000);
    }

    // Clear any session storage flags that might have been set by ContentBuilder
    return () => {
      sessionStorage.removeItem('content_draft_saved');
      sessionStorage.removeItem('from_content_builder');
      sessionStorage.removeItem('content_save_timestamp');
    };
  }, [refreshContent]);

  const handleOpenDetailView = (draft: any) => {
    setSelectedDraft(draft);
    setDetailViewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
      <Helmet>
        <title>Content Drafts | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <DraftsHeader />
        <DraftsList 
          onOpenDetailView={handleOpenDetailView}
        />
        
        <DraftDetailView 
          open={detailViewOpen} 
          onClose={() => setDetailViewOpen(false)} 
          draft={selectedDraft} 
        />
      </main>
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Drafts;
