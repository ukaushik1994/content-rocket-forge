import React, { useEffect, useState } from 'react';
import { EnhancedContentEditor } from '../editor/EnhancedContentEditor';
import { CollapsibleSerpSidebar } from './writing/CollapsibleSerpSidebar';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useWritingStep } from './writing/useWritingStep';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import { saveContentToDraft } from './writing/ContentGenerationService';
import { useTitleSuggestions } from '@/hooks/final-review/useTitleSuggestions';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContentWritingStep = () => {
  const {
    state,
    isGenerating,
    setIsGenerating,
    showOutline,
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
  
  const { generateTitleSuggestions } = useTitleSuggestions();
  const [writingStyle, setWritingStyle] = useState('Conversational');
  const [expertiseLevel, setExpertiseLevel] = useState('Beginner');
  const [contentType, setContentType] = useState<'how-to' | 'listicle' | 'comprehensive' | 'general'>('general');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeCaseStudies, setIncludeCaseStudies] = useState(true);
  const [includeFAQs, setIncludeFAQs] = useState(true);

  const handleGenerateContent = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    const config: ContentGenerationConfig = {
      mainKeyword,
      title: state.contentTitle || `${mainKeyword}: Expert Guide`,
      outline: '',
      secondaryKeywords: state.selectedKeywords?.join(', ') || '',
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
    
    setIsGenerating(true);
    
    try {
      const generatedContent = await generateAdvancedContent(config, aiProvider);
      if (generatedContent) {
        handleContentChange(generatedContent);
        toast.success('Content generated successfully!');
      }
    } catch (error) {
      toast.error('Content generation failed');
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
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
            {state.contentTitle || 'Create Amazing Content'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhanced editor with real-time SERP integration analysis
          </p>
        </div>

        <div className="mb-8">
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
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Enhanced Content Editor</h3>
                  <p className="text-sm text-muted-foreground">With real-time SERP integration highlighting</p>
                </div>
              </div>
              
              <EnhancedContentEditor
                content={content}
                onContentChange={handleContentChange}
                isLoading={isGenerating}
                serpSelections={state.serpSelections}
              />
              
              {autoSaveTimestamp && (
                <div className="mt-6 text-xs text-muted-foreground text-center px-4 py-2 bg-muted/50 rounded-lg">
                  Auto-saved at {new Date(autoSaveTimestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible SERP Sidebar */}
      <CollapsibleSerpSidebar
        content={content}
        serpSelections={state.serpSelections}
        onIntegrateItem={(item) => {
          toast.info(`Integration suggestion for: ${item.type.replace(/_/g, ' ')}`);
        }}
      />

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
    </motion.div>
  );
};
