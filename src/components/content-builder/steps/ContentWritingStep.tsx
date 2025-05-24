
import React, { useEffect, useState } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { ContentQualityPanel } from './writing/ContentQualityPanel';
import { useWritingStep } from './writing/useWritingStep';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import { saveContentToDraft } from './writing/ContentGenerationService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3, Settings } from 'lucide-react';

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
  
  // New state for advanced content generation
  const [writingStyle, setWritingStyle] = useState('Conversational');
  const [expertiseLevel, setExpertiseLevel] = useState('Beginner');
  const [contentType, setContentType] = useState<'how-to' | 'listicle' | 'comprehensive' | 'general'>('general');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeCaseStudies, setIncludeCaseStudies] = useState(true);
  const [includeFAQs, setIncludeFAQs] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  
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
    
    // Create advanced generation config
    const config: ContentGenerationConfig = {
      mainKeyword,
      title: state.contentTitle || `Complete Guide to ${mainKeyword}`,
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Quality
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="flex-1 flex flex-col mt-4">
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
            </TabsContent>
            
            <TabsContent value="quality" className="flex-1 mt-4">
              <ContentQualityPanel
                content={content}
                title={state.contentTitle || mainKeyword}
                writingStyle={writingStyle}
                expertiseLevel={expertiseLevel}
                onWritingStyleChange={setWritingStyle}
                onExpertiseLevelChange={setExpertiseLevel}
                aiProvider={aiProvider}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 mt-4">
              <div className="space-y-6 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold">Content Generation Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Type</label>
                      <select 
                        value={contentType} 
                        onChange={(e) => setContentType(e.target.value as any)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="general">General Article</option>
                        <option value="how-to">How-To Guide</option>
                        <option value="listicle">Listicle</option>
                        <option value="comprehensive">Comprehensive Guide</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Word Count</label>
                      <input
                        type="number"
                        value={wordCountLimit || 1500}
                        onChange={(e) => handleWordCountChange(parseInt(e.target.value))}
                        className="w-full p-2 border rounded-md"
                        min="300"
                        max="5000"
                        step="100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Elements</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includeStats}
                            onChange={(e) => setIncludeStats(e.target.checked)}
                          />
                          <span className="text-sm">Include Statistics</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includeCaseStudies}
                            onChange={(e) => setIncludeCaseStudies(e.target.checked)}
                          />
                          <span className="text-sm">Include Case Studies</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includeFAQs}
                            onChange={(e) => setIncludeFAQs(e.target.checked)}
                          />
                          <span className="text-sm">Include FAQ Section</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleGenerateContent} disabled={isGenerating} className="w-full">
                  {isGenerating ? 'Generating...' : 'Generate Content with Current Settings'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
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
