
import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import { ContentItemType } from '@/contexts/content/types';
import ContentBreadcrumbs from '@/components/content-repurposing/navigation/ContentBreadcrumbs';
import ContentRepurposingTour from '@/components/content-repurposing/tour/ContentRepurposingTour';
import { Sparkles, Zap } from 'lucide-react';

interface ContentSelectionViewProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: any;
  copyToClipboard: (text: string) => void;
  downloadAsText: (text: string, formatName: string) => void;
  deleteRepurposedContent: (contentId: string, formatId: string) => Promise<boolean>;
  handleFormatChange: (contentId: string, formatId: string) => void;
  isDeleting: boolean;
  generatedFormats: string[];
}

const ContentSelectionView: React.FC<ContentSelectionViewProps> = memo(({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  copyToClipboard,
  downloadAsText,
  deleteRepurposedContent,
  handleFormatChange,
  isDeleting,
  generatedFormats = [],
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      <Helmet>
        <title>Content Repurposing | Content Platform</title>
      </Helmet>
      
      {/* Background Effects */}
      <div className="absolute inset-0 futuristic-grid opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl" />
      
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 container py-12 max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
      >
        {/* Breadcrumb navigation */}
        <ContentBreadcrumbs />
        
        {/* Enhanced Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-white/10 backdrop-blur-sm"
            >
              <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
              <span className="text-sm font-medium text-gradient">AI-Powered Content Transformation</span>
              <Zap className="h-5 w-5 text-neon-blue animate-pulse" />
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink bg-clip-text text-transparent animate-gradient-shift bg-300%">
                Content Repurposing
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your existing content into various formats and platforms with AI assistance. 
              <span className="text-neon-blue font-medium"> Maximize your content's reach and impact</span> across different audiences and channels.
            </p>
            
            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto"
            >
              <div className="card-glass p-6 text-center group hover:shadow-neon transition-all duration-300">
                <div className="text-3xl font-bold text-gradient mb-2">{contentItems.length}</div>
                <div className="text-sm text-muted-foreground">Available Content</div>
              </div>
              <div className="card-glass p-6 text-center group hover:shadow-neon transition-all duration-300">
                <div className="text-3xl font-bold text-gradient mb-2">12+</div>
                <div className="text-sm text-muted-foreground">Output Formats</div>
              </div>
              <div className="card-glass p-6 text-center group hover:shadow-neon transition-all duration-300">
                <div className="text-3xl font-bold text-gradient mb-2">AI</div>
                <div className="text-sm text-muted-foreground">Powered Engine</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Content Selection Component with Enhanced Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="card-glass p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
          <ContentSelection 
            contentItems={contentItems}
            onSelectContent={onSelectContent}
            onOpenRepurposedContent={onOpenRepurposedContent}
            repurposedDialogOpen={repurposedDialogOpen}
            onCloseRepurposedDialog={onCloseRepurposedDialog}
            selectedRepurposedContent={selectedRepurposedContent}
            onCopyToClipboard={copyToClipboard}
            onDownloadAsText={downloadAsText}
            onDeleteRepurposedContent={deleteRepurposedContent}
            onFormatChange={handleFormatChange}
            isDeleting={isDeleting}
            generatedFormats={generatedFormats}
          />
        </motion.div>
        
        {/* Guided Tour Component */}
        <ContentRepurposingTour />
      </motion.main>
    </div>
  );
});

ContentSelectionView.displayName = 'ContentSelectionView';

export default ContentSelectionView;
