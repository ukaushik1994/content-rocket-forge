
import React, { useState } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinalReview } from '@/hooks/useFinalReview';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';
import { OverviewTab } from '../final-review/tabs/OverviewTab';
import { OptimizeTab } from '../final-review/tabs/OptimizeTab';
import { SeoTabContent } from '../final-review/tabs/SeoTabContent';
import { TechnicalTabContent } from '../final-review/tabs/TechnicalTabContent';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { SaveAndExportPanel } from '../final-review/SaveAndExportPanel';
import { useSaveContent } from '@/hooks/final-review/useSaveContent';

export const OptimizeAndReviewStep = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { state } = useContentBuilder();
  
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
  
  // Calculate completion percentage based on various completion factors
  const getCompletionPercentage = () => {
    let score = 0;
    
    // Check if meta title exists
    if (state.metaTitle) score += 25;
    
    // Check if meta description exists
    if (state.metaDescription) score += 25;
    
    // Check if document structure has been analyzed
    if (state.documentStructure) score += 20;
    
    // Check if SEO score is above threshold
    if (state.seoScore > 70) score += 20;
    else if (state.seoScore > 50) score += 15;
    else if (state.seoScore > 30) score += 10;
    
    // Check if solution integration has been done
    if (state.solutionIntegrationMetrics) score += 10;
    
    // Cap at 100
    return Math.min(score, 100);
  };
  
  const completionPercentage = getCompletionPercentage();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="space-y-8">
      <FinalReviewHeader />
      
      <SaveAndExportPanel 
        completionPercentage={completionPercentage}
        onSave={handleSaveToDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
        isSavedToDraft={isSavedToDraft}
      />
      
      <FinalReviewQuickActions 
        isRunningAllChecks={isRunningAllChecks}
        runAllChecks={runAllChecks}
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
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="optimize">
          <OptimizeTab />
        </TabsContent>
        
        <TabsContent value="seo">
          <SeoTabContent 
            keywordUsage={keywordUsage} 
          />
        </TabsContent>
        
        <TabsContent value="technical">
          <TechnicalTabContent
            isGeneratingTitles={isGeneratingTitles}
            titleSuggestions={titleSuggestions}
            generateTitleSuggestions={generateTitleSuggestions}
            generateMeta={generateMeta}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
