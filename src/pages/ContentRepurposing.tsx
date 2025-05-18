
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import our components
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import ContentDetails from '@/components/content-repurposing/ContentDetails';
import ContentFormatSelection from '@/components/content-repurposing/ContentFormatSelection';
import GeneratedContentDisplay from '@/components/content-repurposing/GeneratedContentDisplay';
import { useContentRepurposing } from '@/components/content-repurposing/hooks/useContentRepurposing';
import { ContentItemType } from '@/contexts/content/types';

const ContentRepurposing = () => {
  const navigate = useNavigate();
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  
  const {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    isDeleting,
    isSaving,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleOpenRepurposedContent,
    handleCloseRepurposedDialog,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
  } = useContentRepurposing();
  
  // Function to save all generated content
  const handleSaveAllContent = async (): Promise<boolean> => {
    if (!content || Object.keys(generatedContents).length === 0) {
      toast.error('No content to save');
      return false;
    }
    
    setIsSavingAll(true);
    try {
      const formatIds = Object.keys(generatedContents);
      let allSuccess = true;
      let savedCount = 0;
      
      // Save each format one by one
      for (const formatId of formatIds) {
        try {
          const success = await saveAsNewContent(formatId, generatedContents[formatId]);
          if (success) {
            savedCount++;
          } else {
            allSuccess = false;
          }
        } catch (err) {
          console.error(`Error saving format ${formatId}:`, err);
          allSuccess = false;
        }
      }
      
      if (savedCount > 0) {
        toast.success(`Successfully saved ${savedCount} content format${savedCount > 1 ? 's' : ''}`);
        return true;
      } else {
        toast.error('Failed to save any content formats');
        return false;
      }
      
    } catch (error) {
      console.error('Error saving all content:', error);
      toast.error('Error saving all content formats');
      return false;
    } finally {
      setIsSavingAll(false);
    }
  };
  
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
            onSelectContent={(selectedContent: ContentItemType) => handleContentSelection(selectedContent.id)}
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
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/content-repurposing')}
            className="hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Content List</span>
          </Button>
          
          <h1 className="text-3xl font-bold text-center flex-1 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            Content Repurposing
          </h1>
          
          <div className="w-10"></div> {/* For balance */}
        </div>

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
              onSaveAllContent={handleSaveAllContent}
              onDeleteRepurposedContent={handleDeleteActiveFormat}
              isDeleting={isDeleting}
              isSaving={isSaving}
              isSavingAll={isSavingAll}
            />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default ContentRepurposing;
