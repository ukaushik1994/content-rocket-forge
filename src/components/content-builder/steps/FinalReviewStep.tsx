
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Import components
import { ContentTabContent, SeoTabContent, TechnicalTabContent } from '../final-review/tabs';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';
import { FinalReviewTabNavigation } from '../final-review/FinalReviewTabNavigation';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';

export const FinalReviewStep = () => {
  const { state } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    metaTitle, 
    metaDescription, 
    documentStructure, 
    selectedSolution,
    solutionIntegrationMetrics,
    selectedKeywords,
    seoScore,
    serpData
  } = state;
  
  const { 
    isAnalyzing, 
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage, 
    ctaInfo, 
    titleSuggestions,
    generateMeta, 
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks
  } = useFinalReview();

  const { checklistItems, completionPercentage, passedChecks, totalChecks } = useChecklistItems();
  const [activeTab, setActiveTab] = useState("content");
  
  // Debug current state
  useEffect(() => {
    console.log("[FinalReviewStep] Current state:", { 
      metaTitle, 
      contentTitle: state.contentTitle, 
      metaDescription
    });
  }, [metaTitle, state.contentTitle, metaDescription, state]);
  
  // Set meta information when component mounts if not already set
  useEffect(() => {
    if (content && mainKeyword && !metaTitle && !metaDescription) {
      console.log("[FinalReviewStep] No meta information detected, generating...");
      generateMeta();
    }
  }, [content, mainKeyword, metaTitle, metaDescription, generateMeta]);
  
  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta title to:", value);
    // Update both metaTitle and contentTitle for consistency
    state.dispatch({ type: 'SET_META_TITLE', payload: value });
    state.dispatch({ type: 'SET_CONTENT_TITLE', payload: value });
  };
  
  const handleMetaDescriptionChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta description to:", value);
    state.dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FinalReviewHeader 
          completionPercentage={completionPercentage}
          passedChecks={passedChecks}
          totalChecks={totalChecks}
          seoScore={seoScore}
        />
      </motion.div>
      
      {/* Quick Actions */}
      <FinalReviewQuickActions 
        isRunningAllChecks={isRunningAllChecks} 
        onRunAllChecks={runAllChecks} 
      />
      
      {/* Main Content Area with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <FinalReviewTabNavigation />
          
          {/* Content Tab */}
          <TabsContent value="content" className="mt-0">
            <ContentTabContent 
              content={content} 
              checklistItems={checklistItems}
              onRunAllChecks={runAllChecks}
            />
          </TabsContent>
          
          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-0">
            <SeoTabContent 
              keywordUsage={keywordUsage}
              mainKeyword={mainKeyword}
              selectedKeywords={selectedKeywords}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              onMetaTitleChange={handleMetaTitleChange}
              onMetaDescriptionChange={handleMetaDescriptionChange}
              onGenerateMeta={generateMeta}
              solutionIntegrationMetrics={solutionIntegrationMetrics}
              selectedSolution={selectedSolution}
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeSolutionUsage}
              titleSuggestions={titleSuggestions}
              isGeneratingTitles={isGeneratingTitles}
              onGenerateTitleSuggestions={generateTitleSuggestions}
            />
          </TabsContent>
          
          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-0">
            <TechnicalTabContent 
              documentStructure={documentStructure}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              serpData={serpData}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
