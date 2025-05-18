
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ContentSelectionView, ContentRepurposingView } from './content-repurposing';
import { useContentRepurposing } from '@/components/content-repurposing/hooks';
import { ContentItemType } from '@/contexts/content/types';

const ContentRepurposing = () => {
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
    generatedFormats,
    isDeleting,
    isSaving,
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
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    resetContent,
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
      <ContentSelectionView
        contentItems={contentItems}
        onSelectContent={(selectedContent: ContentItemType) => handleContentSelection(selectedContent.id)}
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
    );
  }

  return (
    <ContentRepurposingView
      content={content}
      selectedFormats={selectedFormats}
      generatedContents={generatedContents}
      isGenerating={isGenerating}
      activeFormat={activeFormat}
      isDeleting={isDeleting}
      isSaving={isSaving}
      isSavingAll={isSavingAll}
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

export default ContentRepurposing;
