
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ChangeEvent } from 'react';

export const useWritingStep = () => {
  const { state, setContent, generateContent, setAdditionalInstructions } = useContentBuilder();
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [contextData, setContextData] = useState<any>(null);
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Calculate word count whenever content changes
  useEffect(() => {
    if (state.content) {
      const words = state.content.split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [state.content]);
  
  // Prepare context data for AI generation
  useEffect(() => {
    if (!contextData && state.serpData) {
      const data: any = {
        keywords: state.selectedKeywords,
        mainKeyword: state.mainKeyword,
        outline: state.outlineSections?.map(section => section.title) || state.outline || [],
      };
      
      // Add SERP data if available
      if (state.serpData) {
        // Use results instead of topResults for compatibility
        if (state.serpData.results && state.serpData.results.length > 0) {
          data.topResults = state.serpData.results.slice(0, 3).map(result => ({
            title: result.title,
            snippet: result.snippet
          }));
        }
        
        if (state.serpData.relatedQuestions && state.serpData.relatedQuestions.length > 0) {
          data.questions = state.serpData.relatedQuestions.slice(0, 3).map(q => q.question);
        }
      }
      
      setContextData(data);
    }
  }, [state.serpData, state.selectedKeywords, state.mainKeyword, state.outline, state.outlineSections, contextData]);
  
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };
  
  const handleFocus = () => {
    setIsTextareaFocused(true);
  };
  
  const handleBlur = () => {
    setIsTextareaFocused(false);
  };
  
  const handleGenerateContent = async () => {
    if (state.outlineSections && state.outlineSections.length > 0) {
      await generateContent(state.outlineSections);
    }
  };

  const setIsGenerating = (isGenerating: boolean) => {
    // This method would typically update a state in the context
    console.log("Setting isGenerating to:", isGenerating);
  };

  const handleToggleOutline = () => {
    setShowOutline(!showOutline);
  };

  const handleToggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };

  const handleInstructionsChange = (value: string) => {
    setAdditionalInstructions(value);
  };

  const handleAiProviderChange = (provider: string) => {
    console.log("AI provider changed to:", provider);
  };

  const handleManualSave = () => {
    setAutoSaveTimestamp(new Date().toISOString());
    setHasUnsavedChanges(false);
  };
  
  return {
    content: state.content,
    isGenerating: state.isGenerating,
    isTextareaFocused,
    wordCount,
    handleContentChange,
    handleFocus,
    handleBlur,
    handleGenerateContent,
    title: state.contentTitle,
    state,
    showOutline,
    setShowOutline,
    showGenerator,
    setShowGenerator,
    isSaving,
    setIsSaving,
    showSaveDialog,
    setShowSaveDialog,
    saveTitle,
    setSaveTitle,
    saveNote,
    setSaveNote,
    aiProvider: state.aiProvider,
    additionalInstructions: state.additionalInstructions,
    mainKeyword: state.mainKeyword,
    secondaryKeywords: state.selectedKeywords || [],
    // Additional properties needed by ContentWritingStep
    setIsGenerating,
    outline: state.outline || [],
    selectedSolution: state.selectedSolution,
    autoSaveTimestamp,
    hasUnsavedChanges,
    wordCountLimit: state.wordCountLimit,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleAiProviderChange,
    handleManualSave
  };
};
