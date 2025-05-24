import React, { useEffect } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { RealTimeSeoScore } from '@/components/seo/RealTimeSeoScore';
import { KeywordIntelligenceDashboard } from '@/components/seo/KeywordIntelligenceDashboard';
import { useWritingStep } from './writing/useWritingStep';
import { useRealTimeSeoAnalysis } from '@/hooks/seo/useRealTimeSeoAnalysis';
import { useKeywordIntelligence } from '@/hooks/seo/useKeywordIntelligence';
import { generateContent, saveContentToDraft } from './writing/ContentGenerationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Brain } from 'lucide-react';

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
  
  // Real-time SEO analysis
  const { analysisResult, isAnalyzing: isSeoAnalyzing } = useRealTimeSeoAnalysis();
  
  // Advanced keyword intelligence
  const { intelligenceResult, isAnalyzing: isKeywordAnalyzing } = useKeywordIntelligence();
  
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
    
    // Pass SERP selections to content generation
    await generateContent(
      aiProvider,
      mainKeyword,
      state.contentTitle,
      outlineText,
      secondaryKeywordsStr,
      selectedSolution,
      additionalInstructions,
      state.serpSelections,
      wordCountLimit,
      setIsGenerating,
      handleContentChange
    );
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
        {/* Sidebar with outline and advanced SEO analysis */}
        {showOutline && (
          <div className="lg:col-span-1 space-y-4 h-full">
            <ContentSidebar
              outline={outline}
              selectedSolution={selectedSolution}
              additionalInstructions={additionalInstructions}
              handleInstructionsChange={handleInstructionsChange}
            />
            
            {/* Advanced SEO Analysis Panel */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Brain className="h-4 w-4" />
                  Advanced SEO Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="realtime" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="realtime" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Live SEO
                    </TabsTrigger>
                    <TabsTrigger value="intelligence" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      Keywords
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="realtime" className="space-y-3">
                    {analysisResult && (
                      <RealTimeSeoScore
                        score={analysisResult.score}
                        suggestions={analysisResult.suggestions}
                        isAnalyzing={isSeoAnalyzing}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="intelligence" className="space-y-3">
                    {intelligenceResult ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        <KeywordIntelligenceDashboard
                          result={intelligenceResult}
                          isAnalyzing={isKeywordAnalyzing}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        {isKeywordAnalyzing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                            Analyzing keywords...
                          </div>
                        ) : (
                          'Start typing to see keyword intelligence'
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className={`${showOutline ? 'lg:col-span-3' : 'lg:col-span-4'} h-full flex flex-col`}>
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
