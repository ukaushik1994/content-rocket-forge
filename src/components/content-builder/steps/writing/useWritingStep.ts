
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

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
      toast.success("Content updated", { id: "content-updated" });
    }
  };
  
  // Handle toggle outline
  const handleToggleOutline = () => {
    setShowOutline(!showOutline);
  };
  
  // Handle toggle generator
  const handleToggleGenerator = () => {
    const newState = !showGenerator;
    setShowGenerator(newState);
    if (newState) {
      toast.info("AI Generator opened");
    }
  };
  
  // Handle AI provider change
  const handleAiProviderChange = (provider: AiProvider) => {
    setAiProvider(provider);
  };
  
  // Handle additional instructions change
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInstructions(e.target.value);
    
    // Debounce toast to avoid too many notifications
    if (e.target.value.length % 20 === 0) {
      toast.info("Instructions updated", { id: "instructions-updated" });
    }
  };
  
  // Handle content template selection
  const handleContentTemplateSelection = (template: string) => {
    setContent(template);
    setShowGenerator(false);
    toast.success("Template applied successfully");
    
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
