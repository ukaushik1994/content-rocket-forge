
import React from 'react';
import { useContentRepurposing } from '@/components/content-repurposing/hooks/useContentRepurposing';
import { ContentRepurposingErrorBoundary } from '@/components/content-repurposing/ErrorBoundary';
import ContentRepurposingView from './content-repurposing/ContentRepurposingView';
import ContentSelectionView from './content-repurposing/ContentSelectionView';

const ContentRepurposing: React.FC = () => {
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
    isSaving,
    isSavingAll,
    isDeleting,
    savedContentFormats,
    isLoadingFormat,
    aiProvider,
    setAiProvider,
    availableProviders,
        selectedPersonas={selectedPersonas}
        setSelectedPersonas={setSelectedPersonas}
        availablePersonas={availablePersonas}
        setSelectedFormats={setSelectedFormats}
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
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    resetContent,
  } = useContentRepurposing();

  if (!content) {
    return (
      <ContentRepurposingErrorBoundary>
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
      </ContentRepurposingErrorBoundary>
    );
  }

  return (
    <ContentRepurposingErrorBoundary>
      <ContentRepurposingView
        content={content}
        selectedFormats={selectedFormats}
        generatedContents={generatedContents}
        isGenerating={isGenerating}
        activeFormat={activeFormat}
        isSaving={isSaving}
        isSavingAll={isSavingAll}
        savedContentFormats={savedContentFormats}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        availableProviders={availableProviders}
        selectedPersonas={selectedPersonas}
        setSelectedPersonas={setSelectedPersonas}
        availablePersonas={availablePersonas}
        setSelectedFormats={setSelectedFormats}
        setActiveFormat={setActiveFormat}
        handleGenerateContent={handleGenerateContent}
        copyToClipboard={copyToClipboard}
        downloadAsText={downloadAsText}
        saveAsNewContent={saveAsNewContent}
        handleSaveAllContent={handleSaveAllContent}
        handleDeleteActiveFormat={handleDeleteActiveFormat}
        isDeleting={isDeleting}
        resetContent={resetContent}
      />
    </ContentRepurposingErrorBoundary>
  );
};

export default ContentRepurposing;
