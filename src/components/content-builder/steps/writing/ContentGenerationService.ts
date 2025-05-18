
import React from 'react';
import { useWritingStep } from './useWritingStep';
import { ContentGenerationHeader } from './ContentGenerationHeader';
import { UnsavedChangesDialog } from '@/components/content-builder/UnsavedChangesDialog';
import { useContentGeneration } from './useContentGeneration';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const ContentGenerationService = () => {
  const {
    state,
    isGenerating: isLoadingContent,
    setIsGenerating: setIsLoadingContent,
    showOutline,
    aiProvider,
    hasUnsavedChanges,
    autoSaveTimestamp,
    handleToggleOutline,
    handleToggleGenerator,
    handleAiProviderChange,
    handleManualSave,
    handleGenerateTitle
  } = useWritingStep();
  
  const { isGenerating, generateContent } = useContentGeneration();
  const { dispatch } = useContentBuilder();
  const [showUnsavedDialog, setShowUnsavedDialog] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<() => void | null>(null);
  
  const handleGenerateContent = async () => {
    setIsLoadingContent(true);
    const success = await generateContent(state, (content) => {
      dispatch({ type: 'SET_CONTENT', payload: content });
    });
    setIsLoadingContent(false);
    return success;
  };
  
  const handleCloseUnsavedDialog = () => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
  };
  
  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };
  
  const handleSaveAndContinue = async () => {
    await handleManualSave();
    handleDiscardChanges();
  };
  
  return (
    <>
      <ContentGenerationHeader 
        isGenerating={isGenerating}
        handleGenerateContent={handleGenerateContent}
        handleToggleOutline={handleToggleOutline}
        handleToggleGenerator={handleToggleGenerator}
        showOutline={showOutline}
        outlineLength={state.outline?.length || 0}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
        autoSaveTimestamp={autoSaveTimestamp}
        hasUnsavedChanges={hasUnsavedChanges}
        onManualSave={handleManualSave}
        onGenerateTitle={handleGenerateTitle}
      />
      
      <UnsavedChangesDialog 
        open={showUnsavedDialog}
        onClose={handleCloseUnsavedDialog}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardChanges}
      />
    </>
  );
};
