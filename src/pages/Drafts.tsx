
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DraftsHeader } from '@/components/drafts/DraftsHeader';
import { DraftsList } from '@/components/drafts/DraftsList';
import { DraftDetailView } from '@/components/drafts/DraftDetailView';
import { KeywordRepository } from '@/components/drafts/KeywordRepository';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Drafts = () => {
  const {
    contentItems,
    refreshContent,
    loading
  } = useContent();
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

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
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Drafts | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <DraftsHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content Drafts</TabsTrigger>
            <TabsTrigger value="keywords">Keyword Repository</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            <DraftsList 
              onOpenDetailView={handleOpenDetailView}
            />
          </TabsContent>
          
          <TabsContent value="keywords" className="space-y-6">
            <KeywordRepository />
          </TabsContent>
        </Tabs>
        
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
