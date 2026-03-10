import React, { useState, useEffect } from 'react';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { RepositoryHero } from '@/components/repository/RepositoryHero';
import { RepositoryTabs } from '@/components/repository/RepositoryTabs';
import { ContentDetailModal } from '@/components/repository/ContentDetailModal';
import { PageContainer } from '@/components/ui/PageContainer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { toast } from 'sonner';

const Repository = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/repository` 
    : '/repository';
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
    refreshContent();

    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    const glossarySaved = sessionStorage.getItem('glossary_saved');
    const strategyContentSaved = sessionStorage.getItem('strategy_content_saved');
    
    if (contentDraftSaved === 'true' || glossarySaved === 'true' || strategyContentSaved === 'true') {
      
      // Show a loading toast while we refresh
      const toastMessage = strategyContentSaved === 'true' 
        ? 'Loading your strategy content...'
        : 'Loading your new content...';
      const toastId = toast.loading(toastMessage);
      
      // Double-check with a slight delay to ensure DB operations have completed
      setTimeout(async () => {
        await refreshContent();
        
        const successMessage = strategyContentSaved === 'true'
          ? 'Strategy content saved and published successfully!'
          : 'Content loaded successfully';
        toast.success(successMessage, { id: toastId });
      }, 1000);
    }

    // Clear any session storage flags that might have been set by builders
    return () => {
      sessionStorage.removeItem('content_draft_saved');
      sessionStorage.removeItem('glossary_saved');
      sessionStorage.removeItem('strategy_content_saved');
      sessionStorage.removeItem('from_content_builder');
      sessionStorage.removeItem('from_glossary_builder');
      sessionStorage.removeItem('content_save_timestamp');
    };
  }, [refreshContent, contentItems.length]);

  const handleOpenDetailView = (content: ContentItemType) => {
    // Look up the latest version of the content from context to ensure fresh data
    const freshContent = contentItems.find(item => item.id === content.id) || content;
    setSelectedContent(freshContent);
    setDetailViewOpen(true);
  };

  return (
    <PageContainer className="relative overflow-hidden">
      <Helmet>
        <title>Content Repository | Creaiter</title>
        <meta name="description" content="Centralized content repository with advanced filtering, AI analysis, and performance tracking. Manage all your content in one powerful workspace." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <AnimatedBackground intensity="medium" />

      <div className="relative z-10 w-full px-6 pt-24 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <RepositoryHero stats={{
            total: contentItems.length,
            published: contentItems.filter(i => i.status === 'published').length,
            drafts: contentItems.filter(i => i.status === 'draft').length,
          }} />
          <RepositoryTabs onOpenDetailView={handleOpenDetailView} />
        </motion.div>
      </div>

      <ContentDetailModal 
        content={selectedContent} 
        open={detailViewOpen} 
        onClose={() => setDetailViewOpen(false)} 
      />
    </PageContainer>
  );
};

export default Repository;