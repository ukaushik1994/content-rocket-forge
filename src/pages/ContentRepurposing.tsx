
import React, { useState, useEffect } from 'react';
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
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    resetContent,
    markAsSaved,
    saveAllFormats
  } = useContentRepurposing();
  
  // Function to save all generated content
  const handleSaveAllContent = async (): Promise<boolean> => {
    if (!content || Object.keys(generatedContents || {}).length === 0) {
      toast.error('No content to save');
      return false;
    }
    
    setIsSavingAll(true);
    try {
      const formatIds = Object.keys(generatedContents || {}).filter(id => !!id); // Filter out empty IDs
      let allSuccess = true;
      let savedCount = 0;
      
      // Save each format one by one
      for (const formatId of formatIds) {
        try {
          // Skip already saved formats
          if (savedContentFormats.includes(formatId)) {
            savedCount++;
            continue;
          }
          
          console.log(`Saving format: ${formatId}`);
          const success = await saveAsNewContent(formatId, generatedContents[formatId]);
          if (success) {
            // Mark as saved in frontend state
            markAsSaved(formatId);
            savedCount++;
          } else {
            allSuccess = false;
          }
        } catch (err) {
          console.error(`Error saving format ${formatId}:`, err);
          allSuccess = false;
        }
      }
      
      // After saving all formats to the backend, update the local savedContentFormats state
      if (savedCount > 0) {
        // Update local state with all saved formats
        saveAllFormats();
        
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

  return (
    <>
      {!content ? (
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
          generatedFormats={generatedFormats || []} // Add fallback empty array
        />
      ) : (
        <ContentRepurposingView
          content={content}
          selectedFormats={selectedFormats}
          generatedContents={generatedContents || {}} // Add fallback empty object
          isGenerating={isGenerating}
          activeFormat={activeFormat}
          isDeleting={isDeleting}
          isSaving={isSaving}
          isSavingAll={isSavingAll}
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
      )}
    </>
  );
};

export default ContentRepurposing;
