
import React, { useState, useEffect } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinalReview } from '@/hooks/useFinalReview';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OverviewTab } from '../final-review/tabs/OverviewTab';
import { OptimizeTab } from '../final-review/tabs/OptimizeTab';
import { SeoTabContent } from '../final-review/tabs/SeoTabContent';
import { TechnicalTabContent } from '../final-review/tabs/TechnicalTabContent';
import { RepurposeTab } from '../final-review/tabs/RepurposeTab';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { SaveAndExportPanel } from '../final-review/SaveAndExportPanel';
import { useSaveContent } from '@/hooks/final-review/useSaveContent';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';
import { toast } from 'sonner';

export const OptimizeAndReviewStep = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { state, dispatch } = useContentBuilder();
  
  const {
    isAnalyzing,
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks
  } = useFinalReview();
  
  const { isSaving, isSavedToDraft, handleSaveToDraft, handlePublish } = useSaveContent();
  const { checklistItems, passedChecks, totalChecks, completionPercentage } = useChecklistItems();
  
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
  
  // Handler for running checks specific to the current tab
  const handleRunTabChecks = () => {
    switch(activeTab) {
      case 'overview':
        runAllChecks();
        break;
      case 'optimize':
        analyzeSolutionUsage();
        break;
      case 'seo':
        analyzeSolutionUsage();
        break;
      case 'technical':
        generateTitleSuggestions();
        break;
      default:
        runAllChecks();
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const onMetaTitleChange = (value: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: value });
  };
  
  const onMetaDescriptionChange = (value: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };

  // Mock function to handle repurposing content
  const handleRepurposeContent = async (contentType: string) => {
    toast.info(`Repurposing content to ${contentType} format`);
    // In a real implementation, this would call an AI service to transform the content
  };
  
  // Wrapper functions to convert Promise<string | null> to Promise<void>
  const handleSaveToDraftWrapper = async () => {
    try {
      await handleSaveToDraft();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error saving to draft:", error);
      toast.error("Failed to save to draft");
    }
  };
  
  const handlePublishWrapper = async () => {
    try {
      await handlePublish();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish content");
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
      
      <FinalReviewQuickActions 
        isRunningAllChecks={isRunningAllChecks}
        onRunAllChecks={runAllChecks}
        activeTab={activeTab}
        onRunTabChecks={handleRunTabChecks}
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
            value="optimize"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Optimize
          </TabsTrigger>
          <TabsTrigger 
            value="seo"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            SEO
          </TabsTrigger>
          <TabsTrigger 
            value="technical"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Technical
          </TabsTrigger>
          <TabsTrigger 
            value="repurpose"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Repurpose
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab
            content={state.content}
            checklistItems={checklistItems}
            onRunAllChecks={runAllChecks}
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
        
        <TabsContent value="optimize">
          <OptimizeTab
            keywordUsage={keywordUsage}
            mainKeyword={state.mainKeyword}
            selectedKeywords={state.selectedKeywords}
            metaTitle={state.metaTitle}
            metaDescription={state.metaDescription}
            onMetaTitleChange={onMetaTitleChange}
            onMetaDescriptionChange={onMetaDescriptionChange}
            onGenerateMeta={generateMeta}
            solutionIntegrationMetrics={state.solutionIntegrationMetrics}
            selectedSolution={state.selectedSolution}
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzeSolutionUsage}
            titleSuggestions={titleSuggestions}
            isGeneratingTitles={isGeneratingTitles}
            onGenerateTitleSuggestions={generateTitleSuggestions}
            completionPercentage={completionPercentage}
          />
        </TabsContent>
        
        <TabsContent value="seo">
          <SeoTabContent 
            keywordUsage={keywordUsage}
            mainKeyword={state.mainKeyword}
            selectedKeywords={state.selectedKeywords}
            metaTitle={state.metaTitle}
            metaDescription={state.metaDescription}
            onMetaTitleChange={onMetaTitleChange}
            onMetaDescriptionChange={onMetaDescriptionChange}
            onGenerateMeta={generateMeta}
            solutionIntegrationMetrics={state.solutionIntegrationMetrics}
            selectedSolution={state.selectedSolution}
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzeSolutionUsage}
            titleSuggestions={titleSuggestions}
            isGeneratingTitles={isGeneratingTitles}
            onGenerateTitleSuggestions={generateTitleSuggestions}
          />
        </TabsContent>
        
        <TabsContent value="technical">
          <TechnicalTabContent
            documentStructure={state.documentStructure}
            metaTitle={state.metaTitle}
            metaDescription={state.metaDescription}
            serpData={serpData}
          />
        </TabsContent>
        
        <TabsContent value="repurpose">
          <RepurposeTab
            content={state.content}
            title={state.contentTitle}
            isGenerating={false}
            onGenerateRepurposedContent={handleRepurposeContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
