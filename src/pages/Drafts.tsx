
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DraftsHeader } from '@/components/drafts/DraftsHeader';
import { DraftsList } from '@/components/drafts/DraftsList';
import { DraftDetailView } from '@/components/drafts/DraftDetailView';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { RecentDraftsCarousel } from '@/components/drafts/RecentDraftsCarousel';
import { motion } from 'framer-motion';

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

  // Get drafts only for the carousel
  const drafts = contentItems.filter(item => item.status === 'draft');
  const hasRecentDrafts = drafts.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Library | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <div className="relative w-full overflow-hidden">
        {/* Hero Section with Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-blue/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-repeat bg-center pointer-events-none" />
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 bg-futuristic-grid bg-grid opacity-10 pointer-events-none animate-pulse-glow" />
        
        {/* Glowing orb decorations */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        <main className="relative z-10 flex-1 container py-8 space-y-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DraftsHeader />
          </motion.div>
          
          {hasRecentDrafts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <RecentDraftsCarousel drafts={drafts.slice(0, Math.min(5, drafts.length))} />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DraftsList 
              onOpenDetailView={handleOpenDetailView}
            />
          </motion.div>
          
          <DraftDetailView 
            open={detailViewOpen} 
            onClose={() => setDetailViewOpen(false)} 
            draft={selectedDraft} 
          />
        </main>
      </div>
    </div>
  );
};

export default Drafts;
