import React, { useEffect } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { RealTimeSeoScore } from '@/components/seo/RealTimeSeoScore';
import { KeywordIntelligenceDashboard } from '@/components/seo/KeywordIntelligenceDashboard';
import { RealTimeOptimizationDashboard } from '@/components/optimization/RealTimeOptimizationDashboard';
import { AdvancedSeoGenerator } from '@/components/seo/AdvancedSeoGenerator';
import { useWritingStep } from './writing/useWritingStep';
import { useRealTimeSeoAnalysis } from '@/hooks/seo/useRealTimeSeoAnalysis';
import { useKeywordIntelligence } from '@/hooks/seo/useKeywordIntelligence';
import { useRealTimeOptimization } from '@/hooks/optimization/useRealTimeOptimization';
import { generateContent, saveContentToDraft } from './writing/ContentGenerationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Brain, Zap, Wand2 } from 'lucide-react';

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
  
  // Real-time optimization engine
  const { optimizationResult, isOptimizing, applyAutoFix } = useRealTimeOptimization();
  
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

  const handleApplyOptimization = (suggestionId: string) => {
    const optimizedContent = applyAutoFix(suggestionId);
    if (optimizedContent && optimizedContent !== content) {
      handleContentChange(optimizedContent);
      toast.success("Optimization applied successfully!");
    }
  };

  const handleSeoContentGenerated = (generatedContent: string, title: string, metaDescription: string) => {
    handleContentChange(generatedContent);
    toast.success("Advanced SEO content generated successfully!");
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Sidebar with outline */}
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
        
        {/* Advanced Analysis Panel - Now bigger and wider */}
        <div className={`${showOutline ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          {/* Main Content Editor */}
          <div className="h-96">
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

          {/* Expanded Advanced Analysis Panel */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 min-h-[600px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Brain className="h-5 w-5" />
                Advanced Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <Tabs defaultValue="seo-generator" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="seo-generator" className="text-sm">
                    <Wand2 className="h-4 w-4 mr-2" />
                    SEO Generator
                  </TabsTrigger>
                  <TabsTrigger value="optimization" className="text-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Live Optimization
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="text-sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    SEO Analysis
                  </TabsTrigger>
                  <TabsTrigger value="keywords" className="text-sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Keywords
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="seo-generator" className="space-y-4 h-full">
                  <div className="max-h-[500px] overflow-y-auto">
                    <AdvancedSeoGenerator onContentGenerated={handleSeoContentGenerated} />
                  </div>
                </TabsContent>
                
                <TabsContent value="optimization" className="space-y-4 h-full">
                  {optimizationResult ? (
                    <div className="max-h-[500px] overflow-y-auto">
                      <RealTimeOptimizationDashboard
                        result={optimizationResult}
                        isOptimizing={isOptimizing}
                        onApplyAutoFix={handleApplyOptimization}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {isOptimizing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Analyzing optimization...
                        </div>
                      ) : (
                        'Start writing to see live optimization suggestions'
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="seo" className="space-y-4 h-full">
                  {analysisResult && (
                    <RealTimeSeoScore
                      score={analysisResult.score}
                      suggestions={analysisResult.suggestions}
                      isAnalyzing={isSeoAnalyzing}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="keywords" className="space-y-4 h-full">
                  {intelligenceResult ? (
                    <div className="max-h-[500px] overflow-y-auto">
                      <KeywordIntelligenceDashboard
                        result={intelligenceResult}
                        isAnalyzing={isKeywordAnalyzing}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {isKeywordAnalyzing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
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
