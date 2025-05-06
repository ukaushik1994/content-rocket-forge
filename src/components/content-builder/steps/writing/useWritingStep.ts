
import { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

export function useWritingStep() {
  const { state, setContent, setAdditionalInstructions } = useContentBuilder();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');

  // Set initial save title based on content title or main keyword
  useEffect(() => {
    if (!saveTitle && (state.contentTitle || state.mainKeyword)) {
      setSaveTitle(state.contentTitle || `Content about ${state.mainKeyword}`);
    }
  }, [state.contentTitle, state.mainKeyword, saveTitle]);

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, [setContent]);

  // Handle instructions change
  const handleInstructionsChange = useCallback((instructions: string) => {
    setAdditionalInstructions(instructions);
  }, [setAdditionalInstructions]);

  // Handle toggle outline section
  const handleToggleOutline = useCallback(() => {
    setShowOutline(prev => !prev);
  }, []);

  // Handle toggle generator section
  const handleToggleGenerator = useCallback(() => {
    setShowGenerator(prev => !prev);
  }, []);

  // Handle AI provider change
  const handleAiProviderChange = useCallback((provider: AiProvider) => {
    setAiProvider(provider);
    toast.info(`AI provider set to ${provider}`);
  }, []);

  // Handle content template selection
  const handleContentTemplateSelection = useCallback((templateType: string) => {
    toast.info(`Selected template: ${templateType}`);
    setShowGenerator(false);
    // Implementation would go here in a real app
  }, []);

  return {
    state,
    isGenerating,
    setIsGenerating,
    showOutline,
    showGenerator,
    isSaving,
    setIsSaving,
    showSaveDialog,
    setShowSaveDialog,
    saveTitle,
    setSaveTitle,
    saveNote,
    setSaveNote,
    aiProvider,
    additionalInstructions: state.additionalInstructions || '',
    content: state.content,
    mainKeyword: state.mainKeyword,
    outline: state.outline,
    selectedSolution: state.selectedSolution,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    handleAiProviderChange
  };
}
