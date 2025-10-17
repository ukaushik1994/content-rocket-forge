import React, { useState, useEffect, useRef } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinalReview } from '@/hooks/useFinalReview';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OverviewTab } from '../final-review/tabs/OverviewTab';
import { TechnicalTabContent } from '../final-review/tabs/TechnicalTabContent';

import { SaveAndExportPanel } from '../final-review/SaveAndExportPanel';

import { useSaveContent } from '@/hooks/final-review/useSaveContent';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';

export const OptimizeAndReviewStep = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  
  const { state, updateContent, setMetaTitle, setMetaDescription } = useContentBuilder();
  
  const {
    isAnalyzing,
    isGeneratingTitles,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    checkStepCompletion
  } = useFinalReview();
  
  const { isSaving, isSavedToDraft, handleSaveToDraft, handlePublish } = useSaveContent();
  const { checklistItems, passedChecks, totalChecks, completionPercentage } = useChecklistItems();
  
  // Auto-trigger existing button functions on component mount
  const hasAutoTriggered = useRef(false);
  
  useEffect(() => {
    if (hasAutoTriggered.current) return;
    if (!state.content) return;
    
    const needsMeta = !state.metaTitle || !state.metaDescription;
    const needsSolution = state.selectedSolution && !state.solutionIntegrationMetrics;
    
    if (needsMeta || needsSolution) {
      hasAutoTriggered.current = true;
      
      // Trigger the same functions that the buttons call
      if (needsMeta) generateMeta();
      if (needsSolution) analyzeSolutionUsage();
    }
  }, [state.content, state.metaTitle, state.metaDescription, state.selectedSolution, state.solutionIntegrationMetrics, generateMeta, analyzeSolutionUsage]);
  
  // Debug the state when component loads
  useEffect(() => {
    console.log("OptimizeAndReviewStep - Current state:", {
      content: state.content?.substring(0, 50) + '...',
      mainKeyword: state.mainKeyword,
      metaTitle: state.metaTitle,
      metaDescription: state.metaDescription,
      selectedKeywords: state.selectedKeywords,
      seoScore: state.seoScore
    });
  }, [state]);

  const handleContentUpdate = (newContent: string) => {
    updateContent(newContent);
  };
  
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const onMetaTitleChange = (value: string) => {
    setMetaTitle(value);
  };
  
  const onMetaDescriptionChange = (value: string) => {
    setMetaDescription(value);
  };

  
  // Wrapper functions to convert Promise<string | null> to Promise<void>
  const handleSaveToDraftWrapper = async () => {
    try {
      await handleSaveToDraft();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error saving to draft:", error);
    }
  };
  
  const handlePublishWrapper = async () => {
    try {
      await handlePublish();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error publishing:", error);
    }
  };
  
  return (
    <div className="space-y-8">
      <SaveAndExportPanel 
        completionPercentage={completionPercentage}
        onSave={handleSaveToDraftWrapper}
        onPublish={handlePublishWrapper}
        isSaving={isSaving}
        isSavedToDraft={isSavedToDraft}
      />
      
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-2 w-full gap-4 h-auto p-1 bg-transparent">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="technical"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Technical
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-6 mb-6">
          <TabsContent value="overview" className="space-y-6 mt-0">
            <OverviewTab 
              content={state.content}
              checklistItems={checklistItems}
              metaTitle={state.metaTitle}
              metaDescription={state.metaDescription}
              onMetaTitleChange={onMetaTitleChange}
              onMetaDescriptionChange={onMetaDescriptionChange}
              onGenerateMeta={generateMeta}
              solutionIntegrationMetrics={state.solutionIntegrationMetrics}
              selectedSolution={state.selectedSolution}
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeSolutionUsage}
            />
          </TabsContent>
          
          <TabsContent value="technical" className="mt-0">
            <TechnicalTabContent
              documentStructure={state.documentStructure}
              metaTitle={state.metaTitle}
              metaDescription={state.metaDescription}
              serpData={serpData}
            />
          </TabsContent>
          
          <TabsContent value="export" className="mt-0">
            <SaveAndExportPanel 
              completionPercentage={completionPercentage}
              onSave={handleSaveToDraftWrapper}
              onPublish={handlePublishWrapper}
              isSaving={isSaving}
              isSavedToDraft={isSavedToDraft}
            />
          </TabsContent>
        </div>
        
      </Tabs>

      {/* Modals removed */}
      
    </div>
  );
};