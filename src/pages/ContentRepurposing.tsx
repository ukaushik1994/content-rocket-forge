
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import { ContentFormatSelection } from '@/components/content-repurposing/ContentFormatSelection';
import { GeneratedContentDisplay } from '@/components/content-repurposing/GeneratedContentDisplay';
import RepurposedContentDialog from '@/components/content-repurposing/RepurposedContentDialog';
import { Helmet } from 'react-helmet-async';
import { ContentSelectionView, ContentRepurposingView } from './content-repurposing';
import { useContentRepurposing } from '@/components/content-repurposing/hooks/useContentRepurposing';

/**
 * Content Repurposing Page
 * This page acts as a container for the repurposing views
 */
const ContentRepurposing = () => {
  const {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isDeleting,
    isSaving,
    savedContentFormats,
    handleContentSelection,
    handleGenerateContent,
    handleOpenRepurposedContentWithFormats,
    handleCloseRepurposedDialog,
    handleFormatChange,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    resetContent
  } = useContentRepurposing();
  
  // Determine which view to show based on whether content is selected
  const viewState = content ? 'repurposing' : 'selection';
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Content Repurposing | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        {viewState === 'selection' ? (
          <ContentSelectionView 
            contentItems={contentItems}
            onSelectContent={handleContentSelection}
            onOpenRepurposedContent={handleOpenRepurposedContentWithFormats}
            repurposedDialogOpen={repurposedDialogOpen}
            onCloseRepurposedDialog={handleCloseRepurposedDialog}
            selectedRepurposedContent={selectedRepurposedContent}
            copyToClipboard={copyToClipboard}
            downloadAsText={downloadAsText}
            deleteRepurposedContent={deleteRepurposedContent}
            handleFormatChange={handleFormatChange}
            isDeleting={isDeleting}
            generatedFormats={generatedFormats}
          />
        ) : (
          <ContentRepurposingView 
            content={content}
            selectedFormats={selectedFormats}
            generatedContents={generatedContents}
            isGenerating={isGenerating}
            activeFormat={activeFormat}
            isDeleting={isDeleting}
            isSaving={isSaving}
            isSavingAll={false}
            savedContentFormats={savedContentFormats}
            setSelectedFormats={selectedFormats => handleGenerateContent(selectedFormats)}
            setActiveFormat={handleFormatChange}
            handleGenerateContent={handleGenerateContent}
            copyToClipboard={copyToClipboard}
            downloadAsText={downloadAsText}
            saveAsNewContent={saveAsNewContent}
            handleSaveAllContent={async () => false}
            handleDeleteActiveFormat={handleDeleteActiveFormat}
            resetContent={resetContent}
          />
        )}
      </main>
      
      {repurposedDialogOpen && selectedRepurposedContent && (
        <RepurposedContentDialog
          open={repurposedDialogOpen}
          onClose={handleCloseRepurposedDialog}
          content={selectedRepurposedContent}
          onCopy={copyToClipboard}
          onDownload={downloadAsText}
          onDelete={deleteRepurposedContent}
          onFormatChange={handleFormatChange}
          isDeleting={isDeleting}
          generatedFormats={generatedFormats}
        />
      )}
    </div>
  );
};

export default ContentRepurposing;
