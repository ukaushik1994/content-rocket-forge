
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineSection } from '@/contexts/content-builder/types';
import { toast } from 'sonner';
import { useContentGeneration } from './useContentGeneration';

export function useWritingStep() {
  const { 
    state, 
    dispatch, 
    setAdditionalInstructions, 
    generateContent: contextGenerateContent 
  } = useContentBuilder();
  
  const { 
    mainKeyword, 
    outline, 
    content, 
    additionalInstructions, 
    serpData, 
    selectedSolution,
    contentTitle
  } = state;
  
  const {
    isGenerating: aiIsGenerating,
    aiProvider,
    setAiProvider,
    generateContent: aiGenerateContent,
    availableProviders
  } = useContentGeneration();
  
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(contentTitle || mainKeyword || '');
  const [saveNote, setSaveNote] = useState('');

  // Mark this step as complete when we have content
  useEffect(() => {
    if (content && content.trim().length > 100) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  }, [content, dispatch]);

  useEffect(() => {
    if (contentTitle && contentTitle !== saveTitle) {
      setSaveTitle(contentTitle);
    }
  }, [contentTitle, saveTitle]);

  const handleContentChange = (newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInstructions(e.target.value);
  };

  const handleToggleOutline = () => {
    setShowOutline(!showOutline);
  };
  
  const handleToggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };

  const handleContentTemplateSelection = (template: string) => {
    dispatch({ type: 'SET_CONTENT', payload: template });
    setShowGenerator(false);
    toast.success("Content template applied");
  };
  
  // Generate content function with improved error handling
  const handleGenerateContent = async () => {
    if (!mainKeyword) {
      toast.error("Main keyword is required");
      return;
    }
    
    if (!outline || outline.length === 0) {
      toast.error("Content outline is required");
      return;
    }
    
    try {
      // Convert outline to OutlineSection[] format if it's not already
      const processedOutline: OutlineSection[] = Array.isArray(outline) 
        ? outline.map((item, index) => {
            if (typeof item === 'string') {
              return { 
                id: `section-${index}`, 
                title: item, 
                level: 2 
              };
            } else if (item && typeof item === 'object' && 'title' in item) {
              return item as OutlineSection;
            }
            return { id: `section-${index}`, title: '', level: 2 };
          })
        : [];
      
      // Use AI generation if available, otherwise use context generation
      if (aiGenerateContent) {
        const success = await aiGenerateContent(state, handleContentChange);
        if (success) {
          toast.success("Content generated successfully!");
        }
      } else {
        await contextGenerateContent(processedOutline);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    }
  };

  // Convert outline to the appropriate format for the sidebar component
  const processedOutline = Array.isArray(outline) 
    ? outline.map((item, index) => {
        if (typeof item === 'string') {
          return { id: `section-${index}`, title: item, level: 2 };
        } else if (item && typeof item === 'object' && 'title' in item) {
          return item as OutlineSection;
        }
        return { id: `section-${index}`, title: '', level: 2 };
      })
    : [];

  return {
    state,
    isGenerating: aiIsGenerating,
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
    outline: processedOutline,
    selectedSolution,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    setAiProvider,
    handleGenerateContent,
    availableProviders
  };
}
