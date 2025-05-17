
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentEditor } from '@/components/content-builder/editor/ContentEditor';
import { ContentSidebar } from './writing/ContentSidebar';
import { ContentWritingHeader } from './writing/ContentWritingHeader';
import { useWritingStep } from './writing/useWritingStep';
import { ContentSaveDialog } from './writing/ContentSaveDialog';
import { SerpSelectedItemsSidebar } from '../serp/SerpSelectedItemsSidebar';

export const ContentWritingStep = () => {
  const {
    state,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    handleAiProviderChange,
    showOutline,
    showGenerator,
    isSaving,
    showSaveDialog,
    setShowSaveDialog,
    saveTitle,
    setSaveTitle,
    saveNote,
    setSaveNote,
    aiProvider,
    additionalInstructions,
    content,
    mainKeyword,
    outline,
    selectedSolution,
    contentType,
    contentFormat,
    serpSelections
  } = useWritingStep();

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <ContentWritingHeader
        showOutline={showOutline}
        showGenerator={showGenerator}
        handleToggleOutline={handleToggleOutline}
        handleToggleGenerator={handleToggleGenerator}
        mainKeyword={mainKeyword}
        setShowSaveDialog={setShowSaveDialog}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SERP Selected Items Sidebar - Left */}
        <div className="lg:col-span-1">
          <SerpSelectedItemsSidebar serpSelections={serpSelections} />
        </div>

        {/* Main Content Editor - Center */}
        <div className="lg:col-span-2">
          <ContentEditor
            content={content}
            onChange={handleContentChange}
            outline={outline}
            showOutline={showOutline}
            solutionName={selectedSolution?.name || ''}
          />
        </div>

        {/* Content Sidebar - Right */}
        <div className="lg:col-span-1 space-y-4">
          <ContentSidebar
            outline={outline}
            selectedSolution={selectedSolution}
            additionalInstructions={additionalInstructions}
            handleInstructionsChange={handleInstructionsChange}
            showGenerator={showGenerator}
          />
        </div>
      </div>

      {/* Content Save Dialog */}
      {showSaveDialog && (
        <ContentSaveDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          isSaving={isSaving}
          title={saveTitle}
          setTitle={setSaveTitle}
          notes={saveNote}
          setNotes={setSaveNote}
        />
      )}
    </div>
  );
};
