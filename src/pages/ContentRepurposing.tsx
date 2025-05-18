
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import our components
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import ContentDetails from '@/components/content-repurposing/ContentDetails';
import ContentFormatSelection from '@/components/content-repurposing/ContentFormatSelection';
import GeneratedContentDisplay from '@/components/content-repurposing/GeneratedContentDisplay';
import { useContentRepurposing } from '@/components/content-repurposing/hooks/useContentRepurposing';

const ContentRepurposing = () => {
  const navigate = useNavigate();
  
  const {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    isRegenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    isDeleting,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleRegenerateContent,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
  } = useContentRepurposing();
  
  // If no content is selected yet, show the content selection view
  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Helmet>
          <title>Content Repurposing | Content Platform</title>
        </Helmet>
        
        <Navbar />
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">Content Repurposing</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Transform your existing content into various formats and platforms with AI assistance</p>
          </div>
          
          <ContentSelection 
            contentItems={contentItems}
            onSelectContent={handleContentSelection}
            onOpenRepurposedContent={handleOpenRepurposedContent}
            repurposedDialogOpen={repurposedDialogOpen}
            onCloseRepurposedDialog={handleCloseRepurposedDialog}
            selectedRepurposedContent={selectedRepurposedContent}
            onCopyToClipboard={copyToClipboard}
            onDownloadAsText={downloadAsText}
            onDeleteRepurposedContent={deleteRepurposedContent}
            isDeleting={isDeleting}
          />
        </motion.main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Repurposing | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6"
      >
        {/* Header with back button */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              navigate('/content-repurposing');
              window.location.search = '';
            }}
            className="gap-1 hover:bg-white/5 border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content List
          </Button>
          
          <h1 className="text-3xl font-bold text-center flex-1 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            Content Repurposing
          </h1>
          
          <div className="w-24"></div> {/* For balance */}
        </motion.div>

        {/* Selection of content formats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ContentDetails content={content} />
            <ContentFormatSelection
              selectedFormats={selectedFormats}
              setSelectedFormats={setSelectedFormats}
              onGenerateContent={handleGenerateContent}
              isGenerating={isGenerating}
            />
          </div>

          <div className="md:col-span-2">
            <GeneratedContentDisplay
              generatedContents={generatedContents}
              activeFormat={activeFormat}
              setActiveFormat={setActiveFormat}
              onCopyToClipboard={copyToClipboard}
              onDownloadAsText={downloadAsText}
              onSaveAsNewContent={saveAsNewContent}
              onDeleteRepurposedContent={handleDeleteActiveFormat}
              onRegenerateContent={handleRegenerateContent}
              isDeleting={isDeleting}
              isRegenerating={isRegenerating}
            />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default ContentRepurposing;
