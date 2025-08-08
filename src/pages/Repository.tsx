import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { RepositoryHeader } from '@/components/repository/RepositoryHeader';
import { RepositoryContent } from '@/components/repository/RepositoryContent';
import { RepositoryDetailView } from '@/components/repository/RepositoryDetailView';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';

const Repository = () => {
  const {
    contentItems,
    refreshContent,
    loading
  } = useContent();
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Refresh content when component mounts
  useEffect(() => {
    // Force refresh of content items when the page loads
    refreshContent();
    console.log('[Repository] Component mounted, refreshing content...');
    console.log('[Repository] Content items at load:', contentItems.length);

    // Check if we're coming from the content builder or glossary builder
    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    const glossarySaved = sessionStorage.getItem('glossary_saved');
    const saveTimestamp = sessionStorage.getItem('content_save_timestamp');
    
    console.log('[Repository] contentDraftSaved flag:', contentDraftSaved);
    console.log('[Repository] glossarySaved flag:', glossarySaved);
    console.log('[Repository] saveTimestamp:', saveTimestamp);
    
    if (contentDraftSaved === 'true' || glossarySaved === 'true') {
      console.log('[Repository] Content saved, refreshing content...');
      
      // Show a loading toast while we refresh
      const toastId = toast.loading('Loading your new content...');
      
      // Double-check with a slight delay to ensure DB operations have completed
      setTimeout(async () => {
        console.log('[Repository] Refreshing content after timeout');
        await refreshContent();
        console.log('[Repository] Content items after refresh:', contentItems.length);
        toast.success('Content loaded successfully', { id: toastId });
      }, 1000);
    }

    // Clear any session storage flags that might have been set by builders
    return () => {
      sessionStorage.removeItem('content_draft_saved');
      sessionStorage.removeItem('glossary_saved');
      sessionStorage.removeItem('from_content_builder');
      sessionStorage.removeItem('from_glossary_builder');
      sessionStorage.removeItem('content_save_timestamp');
      console.log('[Repository] Cleanup: session storage flags cleared');
    };
  }, [refreshContent, contentItems.length]);

  const handleOpenDetailView = (content: ContentItemType) => {
    setSelectedContent(content);
    setDetailViewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Repository | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Background elements - inspired by glossary builder */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-purple/10 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-gradient-to-r from-primary/5 to-neon-blue/5 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Futuristic grid pattern */}
        <div className="futuristic-grid absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>
      
      <main className="flex-1 w-full py-8 z-10 relative">
        <div className="w-full px-6">
          <div className="glass-panel p-8 rounded-xl border border-white/10 animate-fade-in backdrop-blur-xl bg-background/80">
            <RepositoryHeader />
            <RepositoryContent 
              onOpenDetailView={handleOpenDetailView}
            />
          </div>
        </div>
        
        <RepositoryDetailView 
          open={detailViewOpen} 
          onClose={() => setDetailViewOpen(false)} 
          content={selectedContent} 
        />
      </main>
    </div>
  );
};

export default Repository;