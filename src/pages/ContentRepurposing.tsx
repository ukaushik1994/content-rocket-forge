import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import our components
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import ContentDetails from '@/components/content-repurposing/ContentDetails';
import ContentFormatSelection from '@/components/content-repurposing/ContentFormatSelection';
import GeneratedContentDisplay from '@/components/content-repurposing/GeneratedContentDisplay';
import { useContentRepurposing } from '@/components/content-repurposing/hooks/useContentRepurposing';
import BreadcrumbNav from '@/components/content-repurposing/layout/BreadcrumbNav';

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

  // Helper function to get workflow step
  const getWorkflowStep = (): number => {
    if (!content) return 1;
    if (Object.keys(generatedContents).length === 0) return 2;
    return 3;
  }

  const currentStep = getWorkflowStep();
  
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
        <div className="container max-w-7xl py-6 mx-auto px-4">
          <div className="flex flex-col space-y-4">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
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
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                Content Repurposing
              </h1>
              
              <div className="w-24"></div> {/* For balance */}
            </div>
            
            {/* Workflow Step Indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center w-full max-w-md">
                <WorkflowStep 
                  number={1} 
                  title="Select Content" 
                  active={currentStep === 1} 
                  completed={currentStep > 1} 
                />
                <div className={`h-0.5 flex-1 ${currentStep > 1 ? 'bg-neon-purple' : 'bg-gray-700'}`} />
                <WorkflowStep 
                  number={2} 
                  title="Choose Formats" 
                  active={currentStep === 2} 
                  completed={currentStep > 2} 
                />
                <div className={`h-0.5 flex-1 ${currentStep > 2 ? 'bg-neon-purple' : 'bg-gray-700'}`} />
                <WorkflowStep 
                  number={3} 
                  title="View Results" 
                  active={currentStep === 3} 
                  completed={false} 
                />
              </div>
            </div>

            {!content ? (
              /* Content Selection View */
              <div className="glass-panel border border-white/10 bg-black/40 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                  Select Content to Repurpose
                </h2>
                <ContentSelection 
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
              </div>
            ) : (
              /* Content Repurposing View */
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
      </motion.main>
    </div>
  );
};

// Workflow Step Component
interface WorkflowStepProps {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}

const WorkflowStep = ({ number, title, active, completed }: WorkflowStepProps) => {
  return (
    <div className="flex flex-col items-center relative">
      <div 
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
          ${active ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white' : 
            completed ? 'bg-neon-purple text-white' : 'bg-gray-800 text-gray-400'} 
          ${active ? 'ring-2 ring-neon-purple ring-opacity-50' : ''}
        `}
      >
        {completed ? <ChevronRight className="h-5 w-5" /> : number}
      </div>
      <span className={`text-xs mt-1 ${active ? 'text-white font-medium' : 'text-gray-400'}`}>{title}</span>
      
      {active && (
        <motion.div 
          className="absolute -bottom-1 w-16 h-0.5 bg-neon-purple" 
          layoutId="activeStep"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  );
};

export default ContentRepurposing;
