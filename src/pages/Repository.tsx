import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { RepositoryHero } from '@/components/repository/RepositoryHero';
import { RepositoryTabs } from '@/components/repository/RepositoryTabs';
import { ContentDetailModal } from '@/components/repository/ContentDetailModal';
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
    <motion.div 
      className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Helmet>
        <title>Content Repository | Creaiter</title>
        <meta name="description" content="Centralized content repository with advanced filtering, AI analysis, and performance tracking. Manage all your content in one powerful workspace." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      
      
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Interactive floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-6 pt-24 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <RepositoryHero />
          <RepositoryTabs onOpenDetailView={handleOpenDetailView} />
        </motion.div>
      </div>

      <ContentDetailModal 
        content={selectedContent} 
        open={detailViewOpen} 
        onClose={() => setDetailViewOpen(false)} 
      />
    </motion.div>
  );
};

export default Repository;