
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { OutlineSection } from '@/contexts/content-builder/types';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

export function useWritingStep() {
  const { state, dispatch, setAdditionalInstructions } = useContentBuilder();
  const { 
    mainKeyword, 
    outline, 
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
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter');
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCountLimit, setWordCountLimit] = useState<number | undefined>(1500);
  
  // Load saved word count from localStorage
  useEffect(() => {
    const savedWordCount = localStorage.getItem('content_builder_word_count');
    if (savedWordCount) {
      setWordCountLimit(parseInt(savedWordCount));
    } else if (serpData) {
      // Calculate word count based on top-ranking content or SERP recommendations
      const suggestedWordCount = serpData.topResults?.length 
        ? Math.max(1200, serpData.topResults.length * 200)
        : 1500;
        
      setWordCountLimit(suggestedWordCount);
    }
  }, [serpData]);

  // Mark this step as complete when we have content
  useEffect(() => {
    if (content && content.trim().length > 100) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 }); // Updated to step 3
    }
  }, [content, dispatch]);

  useEffect(() => {
    if (contentTitle && contentTitle !== saveTitle) {
      setSaveTitle(contentTitle);
    }
  }, [contentTitle, saveTitle]);
  
  // Load saved content from localStorage on initial render
  useEffect(() => {
    const savedDraft = localStorage.getItem('content_builder_draft');
    const savedTimestamp = localStorage.getItem('content_builder_timestamp');
    const savedKeyword = localStorage.getItem('content_builder_keyword');
    const savedTitle = localStorage.getItem('content_builder_title');
    
    if (savedDraft && (!content || content.trim().length === 0)) {
      // There's a draft in localStorage and no content in state
      const loadSavedDraft = window.confirm(
        'We found a previously unsaved draft. Would you like to load it?'
      );
      
      if (loadSavedDraft) {
        dispatch({ type: 'SET_CONTENT', payload: savedDraft });
        
        if (savedKeyword && (!mainKeyword || mainKeyword.trim().length === 0)) {
          dispatch({ type: 'SET_MAIN_KEYWORD', payload: savedKeyword });
        }
        
        if (savedTitle && (!contentTitle || contentTitle.trim().length === 0)) {
          dispatch({ type: 'SET_CONTENT_TITLE', payload: savedTitle });
        }
        
        toast.success('Loaded your unsaved draft');
        setAutoSaveTimestamp(savedTimestamp || null);
      } else {
        // Clear the saved draft since user chose not to use it
        localStorage.removeItem('content_builder_draft');
        localStorage.removeItem('content_builder_timestamp');
        localStorage.removeItem('content_builder_keyword');
        localStorage.removeItem('content_builder_title');
      }
    }
  }, [dispatch, content, mainKeyword, contentTitle]);
  
  // Set up auto-save functionality
  useEffect(() => {
    if (!content || content.trim().length === 0) return;
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && content && content.trim().length > 0) {
        localStorage.setItem('content_builder_draft', content);
        const timestamp = new Date().toISOString();
        localStorage.setItem('content_builder_timestamp', timestamp);
        setAutoSaveTimestamp(timestamp);
        setHasUnsavedChanges(false);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [content, hasUnsavedChanges]);

  // Set up before unload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleContentChange = (newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent });
    setHasUnsavedChanges(true);
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

  const handleAiProviderChange = (provider: AiProvider) => {
    setAiProvider(provider);
  };
  
  const handleWordCountChange = (count: number) => {
    setWordCountLimit(count);
    localStorage.setItem('content_builder_word_count', count.toString());
    toast.success(`Word count set to ${count} words`);
  };
  
  const handleManualSave = () => {
    if (content && content.trim().length > 0) {
      localStorage.setItem('content_builder_draft', content);
      const timestamp = new Date().toISOString();
      localStorage.setItem('content_builder_timestamp', timestamp);
      setAutoSaveTimestamp(timestamp);
      setHasUnsavedChanges(false);
      toast.success("Content saved as draft");
    }
  };

  // Convert outline to the appropriate format for the sidebar component
  const processedOutline = Array.isArray(outline) 
    ? outline.map(item => {
        if (typeof item === 'string') {
          return { id: Math.random().toString(), title: item, level: 2 };
        } else if (item && typeof item === 'object' && 'title' in item) {
          return item as OutlineSection;
        }
        return { id: Math.random().toString(), title: '', level: 2 };
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
    autoSaveTimestamp,
    hasUnsavedChanges,
    wordCountLimit,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleAiProviderChange,
    handleManualSave,
    handleWordCountChange
  };
}
