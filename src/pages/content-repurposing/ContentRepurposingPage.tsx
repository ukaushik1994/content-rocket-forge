
import React from 'react';
import { useContentRepurposingPage } from './hooks/useContentRepurposingPage';
import { ContentSelectionView, ContentRepurposingView } from './views';

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
    isSavingAll,
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
    handleSaveAllContent,
    handleDeleteActiveFormat,
    resetContent
  } = useContentRepurposingPage();

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
        deleteRepurposedContent={handleDeleteActiveFormat}
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
  );
};

export default ContentRepurposingPage;
