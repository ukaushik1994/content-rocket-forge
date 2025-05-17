
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AiProvider } from '@/types/aiProvider';

export const useWritingStep = () => {
  const { state, dispatch, setContent, setAdditionalInstructions } = useContentBuilder();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [aiProvider, setAiProvider] = useState<AiProvider>('gpt-4o');
  
  // Get values from state
  const { 
    mainKeyword, 
    selectedKeywords, 
    contentTitle,
    outline,
    content,
    additionalInstructions,
    selectedSolution,
    contentType,
    contentFormat,
    serpSelections
  } = state;
  
  // Set the save title when contentTitle changes
  useEffect(() => {
    if (contentTitle) {
      setSaveTitle(contentTitle);
    } else if (mainKeyword) {
      setSaveTitle(`${mainKeyword} - ${new Date().toLocaleDateString()}`);
    }
  }, [contentTitle, mainKeyword]);
  
  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Mark step as completed if content is not empty
    if (newContent.trim().length > 0) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  };
  
  // Handle toggle outline
  const handleToggleOutline = () => {
    setShowOutline(!showOutline);
  };
  
  // Handle toggle generator
  const handleToggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };
  
  // Handle AI provider change
  const handleAiProviderChange = (provider: AiProvider) => {
    setAiProvider(provider);
  };
  
  // Handle additional instructions change
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInstructions(e.target.value);
  };
  
  // Handle content template selection
  const handleContentTemplateSelection = (template: string) => {
    setContent(template);
    setShowGenerator(false);
    
    // Mark step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
  };
  
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
    additionalInstructions,
    content,
    mainKeyword,
    outline,
    selectedSolution,
    contentType,
    contentFormat,
    serpSelections,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    handleAiProviderChange
  };
};
