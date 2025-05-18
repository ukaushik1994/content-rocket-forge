
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import our components
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import ContentDetails from '@/components/content-repurposing/ContentDetails';
import ContentFormatSelection from '@/components/content-repurposing/ContentFormatSelection';
import GeneratedContentDisplay from '@/components/content-repurposing/GeneratedContentDisplay';
import { useContentRepurposing } from '@/components/content-repurposing/hooks/useContentRepurposing';
import BreadcrumbNav from '@/components/content-repurposing/layout/BreadcrumbNav';
import RepurposingSidebar from '@/components/content-repurposing/layout/RepurposingSidebar';

const ContentRepurposing = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
    isSaving,
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
    deleteContentItem,
  } = useContentRepurposing();
  
  // Function to handle content item deletion from selection view
  const handleContentItemDelete = async (contentId: string, formatId: string = ''): Promise<boolean> => {
    try {
      if (formatId) {
        // If formatId is provided, delete only that specific format
        await deleteRepurposedContent(contentId, formatId);
      } else {
        // Otherwise delete the entire content item
        await deleteContentItem(contentId);
      }
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
        className="flex-1 flex flex-col"
      >
        <div className="container py-4 max-w-full mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (!content) {
                    navigate('/');
                  } else {
                    // Just clear the content selection
                    navigate('/content-repurposing');
                  }
                }}
                className="gap-1 hover:bg-white/5 border border-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                {content ? 'Back to Content List' : 'Back to Dashboard'}
              </Button>
              
              {content && (
                <BreadcrumbNav 
                  content={content}
                  hasGeneratedContent={Object.keys(generatedContents).length > 0}
                />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              Content Repurposing
            </h1>
            
            <div className="w-24"></div> {/* For balance */}
          </div>
        </div>

        <div className="flex-1 flex relative">
          {/* Collapsible Sidebar */}
          <RepurposingSidebar 
            isOpen={sidebarOpen} 
            onToggle={toggleSidebar}
            contentItems={contentItems}
            onSelectContent={handleContentSelection}
            onOpenRepurposedContent={handleOpenRepurposedContent}
            repurposedDialogOpen={repurposedDialogOpen}
            onCloseRepurposedDialog={handleCloseRepurposedDialog}
            selectedRepurposedContent={selectedRepurposedContent}
            onCopyToClipboard={copyToClipboard}
            onDownloadAsText={downloadAsText}
            onDeleteRepurposedContent={handleContentItemDelete}
            isDeleting={isDeleting}
            selectedContentId={content?.id}
          />

          {/* Main Content Area */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[320px]' : 'ml-[50px]'}`}>
            <div className="container py-4 px-4 max-w-full mx-auto">
              {!content ? (
                <div className="flex items-center justify-center h-[70vh]">
                  <div className="text-center max-w-lg">
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                      Select Content to Repurpose
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Choose a content item from the sidebar to get started with repurposing it into different formats.
                    </p>
                    {!sidebarOpen && (
                      <Button onClick={toggleSidebar} className="bg-gradient-to-r from-neon-purple to-neon-blue">
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Open Content Selection
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
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
                      isSaving={isSaving}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default ContentRepurposing;
