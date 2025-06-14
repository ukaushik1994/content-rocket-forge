
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
    console.log('[Drafts] Component mounted, refreshing content...');
    console.log('[Drafts] Content items at load:', contentItems.length);

    // Check if we're coming from the content builder
    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    const saveTimestamp = sessionStorage.getItem('content_save_timestamp');
    
    console.log('[Drafts] contentDraftSaved flag:', contentDraftSaved);
    console.log('[Drafts] saveTimestamp:', saveTimestamp);
    
    if (contentDraftSaved === 'true') {
      console.log('[Drafts] Content draft saved, refreshing content...');
      
      // Show a loading toast while we refresh
      const toastId = toast.loading('Loading your new draft...');
      
      // Double-check with a slight delay to ensure DB operations have completed
      setTimeout(async () => {
        console.log('[Drafts] Refreshing content after timeout');
        await refreshContent();
        console.log('[Drafts] Content items after refresh:', contentItems.length);
        toast.success('Draft loaded successfully', { id: toastId });
      }, 1000);
    }

    // Clear any session storage flags that might have been set by ContentBuilder
    return () => {
      sessionStorage.removeItem('content_draft_saved');
      sessionStorage.removeItem('from_content_builder');
      sessionStorage.removeItem('content_save_timestamp');
      console.log('[Drafts] Cleanup: session storage flags cleared');
    };
  }, [refreshContent, contentItems.length]);

  const handleOpenDetailView = (draft: any) => {
    setSelectedDraft(draft);
    setDetailViewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Drafts | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-neon-purple/10 rounded-full filter blur-3xl opacity-30"></div>
        <div className="futuristic-grid absolute inset-0 opacity-10"></div>
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <div className="glass-panel p-8 rounded-xl border border-white/10 animate-fade-in">
          <DraftsHeader />
          <DraftsList 
            onOpenDetailView={handleOpenDetailView}
          />
        </div>
        
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
