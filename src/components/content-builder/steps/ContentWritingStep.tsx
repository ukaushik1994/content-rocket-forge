
import React, { useEffect, useState } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useWritingStep } from './writing/useWritingStep';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import { saveContentToDraft } from './writing/ContentGenerationService';
import { useTitleSuggestions } from '@/hooks/final-review/useTitleSuggestions';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export const ContentWritingStep = () => {
  const {
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
    secondaryKeywords,
    outline,
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
  } = useWritingStep();
  
  // Title generation hook
  const { generateTitleSuggestions } = useTitleSuggestions();
  
  // New state for advanced content generation
  const [writingStyle, setWritingStyle] = useState('Conversational');
  const [expertiseLevel, setExpertiseLevel] = useState('Beginner');
  const [contentType, setContentType] = useState<'how-to' | 'listicle' | 'comprehensive' | 'general'>('general');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeCaseStudies, setIncludeCaseStudies] = useState(true);
  const [includeFAQs, setIncludeFAQs] = useState(true);
  
  // Setup leave confirmation
  useEffect(() => {
    const handleBeforeNavigate = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmMessage = "You have unsaved changes. Are you sure you want to leave?";
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
          history.pushState(null, '', window.location.pathname);
        }
      }
    };
    
    window.addEventListener('popstate', handleBeforeNavigate);
    return () => window.removeEventListener('popstate', handleBeforeNavigate);
  }, [hasUnsavedChanges]);

  const handleGenerateContent = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    // Auto-generate title if none exists or if it's a generic default
    if (!state.contentTitle || 
        state.contentTitle.includes('Complete Guide') || 
        state.contentTitle === `${mainKeyword}: Professional Guide and Best Practices`) {
      console.log('Auto-generating unique title before content generation');
      await generateTitleSuggestions();
    }
    
    // Convert outline to a formatted string for the prompt
    const outlineText = Array.isArray(state.outline) 
      ? state.outline.map((item, index) => {
          if (typeof item === 'string') {
            return `${index + 1}. ${item}`;
          } else if (item && typeof item === 'object' && 'title' in item) {
            return `${index + 1}. ${(item as { title: string }).title}`;
          }
          return '';
        }).filter(Boolean).join('\n')
      : '';
        
    // Prepare secondary keywords
    const secondaryKeywordsStr = state.selectedKeywords?.join(', ') || '';
    
    // Create advanced generation config
    // Use the current title or generate a simple one from keyword
    const finalTitle = state.contentTitle || `${mainKeyword}: Expert Guide and Strategies`;

    const config: ContentGenerationConfig = {
      mainKeyword,
      title: finalTitle,
      outline: outlineText,
      secondaryKeywords: secondaryKeywordsStr,
      writingStyle,
      expertiseLevel,
      targetLength: wordCountLimit || 1500,
      contentType,
      serpSelections: state.serpSelections || [],
      selectedSolution,
      additionalInstructions,
      includeStats,
      includeCaseStudies,
      includeFAQs
    };
    
    console.log('📝 Content generation config:', {
      title: finalTitle,
      serpSelectionsCount: state.serpSelections?.length || 0,
      selectedItems: state.serpSelections?.filter(item => item.selected).length || 0
    });
    
    setIsGenerating(true);
    
    try {
      const generatedContent = await generateAdvancedContent(config, aiProvider);
      
      if (generatedContent) {
        handleContentChange(generatedContent);
        toast.success('High-quality content generated successfully!');
      } else {
        toast.error('Failed to generate content. Please try again.');
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast.error('Content generation failed. Please check your settings.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveToDraft = async () => {
    await saveContentToDraft(
      saveTitle,
      content,
      mainKeyword,
      secondaryKeywords || [],
      saveNote,
      Array.isArray(outline) ? outline.map(item => typeof item === 'string' ? item : item.title) : [],
      setIsSaving,
      setShowSaveDialog
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ContentGenerationHeader
        isGenerating={isGenerating}
        handleGenerateContent={handleGenerateContent}
        handleToggleOutline={handleToggleOutline}
        showOutline={showOutline}
        outlineLength={state.outline.length}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
        autoSaveTimestamp={autoSaveTimestamp}
        hasUnsavedChanges={hasUnsavedChanges}
        onManualSave={handleManualSave}
        wordCountLimit={wordCountLimit}
        onWordCountChange={handleWordCountChange}
        onGenerateTitle={generateTitleSuggestions}
      />
      
      {/* Display content title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {state.contentTitle ? (
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              {state.contentTitle}
            </span>
          ) : (
            <span className="text-muted-foreground text-base">No title set</span>
          )}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {showOutline && (
          <div className="lg:col-span-1 space-y-4 h-full">
            <ContentSidebar
              outline={outline}
              selectedSolution={selectedSolution}
              additionalInstructions={additionalInstructions}
              handleInstructionsChange={handleInstructionsChange}
            />
          </div>
        )}
        
        <div className={`${showOutline ? 'lg:col-span-3' : 'lg:col-span-4'} h-full flex flex-col`}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Content Editor</span>
          </div>
          
          <div className="flex-1 flex flex-col">
            <ContentEditor
              content={content}
              onContentChange={handleContentChange}
            />
            
            {/* Add auto-save notice at the bottom */}
            {(autoSaveTimestamp || hasUnsavedChanges) && (
              <div className="mt-2 text-xs text-white/50 flex items-center justify-end gap-1 px-4 py-2 border-t border-white/5">
                {hasUnsavedChanges ? (
                  <>
                    <span className="inline-block h-2 w-2 bg-amber-400 rounded-full animate-pulse"></span>
                    Unsaved changes
                  </>
                ) : (
                  <>
                    <span className="text-green-400">✓</span> Auto-saved
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveContentDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        saveTitle={saveTitle}
        setSaveTitle={setSaveTitle}
        saveNote={saveNote}
        setSaveNote={setSaveNote}
        handleSaveToDraft={handleSaveToDraft}
        isSaving={isSaving}
        mainKeyword={mainKeyword}
        secondaryKeywords={secondaryKeywords || []}
        content={content}
        outlineLength={state.outline.length}
      />
    </div>
  );
};
