
import React from 'react';
import { useContentRepurposing } from '@/components/content-repurposing/hooks';
import { ContentSelectionView, ContentRepurposingView } from './views';
import { toast } from 'sonner';

const ContentRepurposingPage = () => {
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
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleOpenRepurposedContentWithFormats,
    handleCloseRepurposedDialog,
    handleFormatChange,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    handleDeleteActiveFormat,
    resetContent,
    saveAllFormats
  } = useContentRepurposing();
  
  const handleSaveAllContent = async (): Promise<boolean> => {
    if (!content || !generatedContents || Object.keys(generatedContents).length === 0) {
      toast.error('No content to save');
      return false;
    }
    
    try {
      // Get all format IDs and mark them as saved in UI state
      const formatIds = saveAllFormats();
      
      if (formatIds.length === 0) {
        toast.info('All formats are already saved');
        return true;
      }
      
      toast.success(`Successfully saved ${formatIds.length} content format${formatIds.length > 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error saving all content:', error);
      toast.error('Error saving all content formats');
      return false;
    }
  };

  // If no content is selected yet, show the content selection view
  if (!content) {
    return (
      <ContentSelectionView
        contentItems={contentItems || []}
        onSelectContent={handleContentSelection}
        onOpenRepurposedContent={handleOpenRepurposedContentWithFormats}
        repurposedDialogOpen={repurposedDialogOpen}
        onCloseRepurposedDialog={handleCloseRepurposedDialog}
        selectedRepurposedContent={selectedRepurposedContent}
        copyToClipboard={copyToClipboard}
        downloadAsText={downloadAsText}
        deleteRepurposedContent={isDeleting}
        handleFormatChange={handleFormatChange}
        isDeleting={isDeleting}
        generatedFormats={generatedFormats || []}
      />
    );
  }

  return (
    <ContentRepurposingView
      content={content}
      selectedFormats={selectedFormats || []}
      generatedContents={generatedContents || {}}
      isGenerating={isGenerating}
      activeFormat={activeFormat}
      isDeleting={isDeleting}
      isSaving={isSaving}
      isSavingAll={false}
      savedContentFormats={savedContentFormats}
      setSelectedFormats={setSelectedFormats}
      setActiveFormat={setActiveFormat}
      handleGenerateContent={handleGenerateContent}
      copyToClipboard={copyToClipboard}
      downloadAsText={downloadAsText}
      saveAsNewContent={saveAsNewContent}
      handleSaveAllContent={handleSaveAllContent}
      handleDeleteActiveFormat={handleDeleteActiveFormat}
      resetContent={resetContent}
    />
  );
};

export default ContentRepurposingPage;
