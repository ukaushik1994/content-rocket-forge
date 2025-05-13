
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineSection } from '@/contexts/content-builder/types';
import { AiProvider } from '@/services/aiService/types';

export function useWritingStep() {
  const { state, dispatch, setAdditionalInstructions } = useContentBuilder();
  const { 
    mainKeyword, 
    outline, 
    outlineSections,
    content, 
    additionalInstructions, 
    serpData, 
    selectedSolution,
    contentTitle,
    selectedKeywords
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(contentTitle || mainKeyword || '');
  const [saveNote, setSaveNote] = useState('');
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');

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
  };

  const handleAiProviderChange = (provider: AiProvider) => {
    setAiProvider(provider);
  };
  
  const setOutlineData = (newOutline: OutlineSection[] | string[]) => {
    if (Array.isArray(newOutline)) {
      if (typeof newOutline[0] === 'string') {
        // Convert string array to OutlineSection array
        const outlineSections = (newOutline as string[]).map(item => ({
          id: Math.random().toString(36).substring(7),
          title: item,
          type: "heading" as const,
          level: 2 as const,
          content: ''
        }));
        dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: outlineSections });
      } else {
        // It's already an OutlineSection array
        dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: newOutline as OutlineSection[] });
      }
    }
  };

  // Convert outline to the appropriate format for the sidebar component
  const processedOutline = Array.isArray(outline) 
    ? outline.map(item => {
        if (typeof item === 'string') {
          return { 
            id: Math.random().toString(), 
            title: item, 
            level: 2 as const, 
            type: "heading" as const, 
            content: '' 
          };
        } else if (item && typeof item === 'object' && 'title' in item) {
          // Ensure type property is compatible with OutlineSection
          const section = { ...item } as OutlineSection;
          if (typeof section.type === 'string' && !['heading', 'subheading', 'paragraph', 'bullet', 'numbered', 'blockquote', 'custom'].includes(section.type)) {
            section.type = 'heading';
          }
          return section;
        }
        return { 
          id: Math.random().toString(), 
          title: '', 
          level: 2 as const, 
          type: "heading" as const, 
          content: '' 
        };
      })
    : [];

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
    secondaryKeywords: selectedKeywords,
    outline: processedOutline,
    selectedSolution,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    handleAiProviderChange,
    setOutline: setOutlineData,
    outlineSections,
    setOutlineSections
  };
}
