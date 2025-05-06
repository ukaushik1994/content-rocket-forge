
import React, { useEffect } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { ContentTemplateCard } from './writing/ContentTemplateCard';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useWritingStep } from './writing/useWritingStep';
import { generateContent, saveContentToDraft } from './writing/ContentGenerationService';
import { useSeoRecommendations } from '@/hooks/seo-analysis/useSeoRecommendations';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';

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
    outline,
    selectedSolution,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    handleAiProviderChange
  } = useWritingStep();

  // Get SEO recommendations that can be applied
  const { 
    recommendations: seoRecommendations,
    seoInstructions,
    unappliedRecommendationsCount
  } = useSeoRecommendations();

  const useSeoOptimizations = state.seoImprovements && state.seoImprovements.length > 0;

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
    const secondaryKeywords = state.selectedKeywords?.join(', ') || '';
    
    // Pass SEO recommendations if they exist and haven't been applied yet
    const unappliedSeoRecommendations = seoRecommendations?.filter(rec => !rec.applied) || [];
    
    await generateContent(
      aiProvider,
      mainKeyword,
      state.contentTitle,
      outlineText,
      secondaryKeywords,
      selectedSolution,
      additionalInstructions,
      setIsGenerating,
      handleContentChange,
      useSeoOptimizations ? unappliedSeoRecommendations : undefined,
      state.keywordUsage
    );
  };
  
  const handleSaveToDraft = async () => {
    await saveContentToDraft(
      saveTitle,
      content,
      mainKeyword,
      saveNote,
      setIsSaving,
      setShowSaveDialog
    );
  };

  return (
    <div className="space-y-6">
      <ContentGenerationHeader
        isGenerating={isGenerating}
        handleGenerateContent={handleGenerateContent}
        handleToggleOutline={handleToggleOutline}
        handleToggleGenerator={handleToggleGenerator}
        showOutline={showOutline}
        outlineLength={state.outline.length}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
      />
      
      {/* SEO Recommendations Badge */}
      {useSeoOptimizations && unappliedRecommendationsCount > 0 && (
        <div className="flex items-center justify-center">
          <Badge 
            variant="outline" 
            className="bg-green-50 text-green-700 border-green-200 px-3 py-1 flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4 text-green-500" />
            {unappliedRecommendationsCount} SEO recommendations will be applied when generating content
          </Badge>
        </div>
      )}
      
      {showGenerator && (
        <ContentTemplateCard
          serpData={state.serpData}
          onGenerateContent={handleContentTemplateSelection}
          mainKeyword={mainKeyword}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showOutline && (
          <div className="lg:col-span-1 space-y-4">
            <ContentSidebar
              outline={outline}
              selectedSolution={selectedSolution}
              additionalInstructions={additionalInstructions}
              handleInstructionsChange={handleInstructionsChange}
              seoInstructions={seoInstructions}
              unappliedRecommendationsCount={unappliedRecommendationsCount}
            />
          </div>
        )}
        
        <div className={showOutline ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <ContentEditor
            content={content}
            onContentChange={handleContentChange}
          />
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
        content={content}
        outlineLength={state.outline.length}
      />
    </div>
  );
};
