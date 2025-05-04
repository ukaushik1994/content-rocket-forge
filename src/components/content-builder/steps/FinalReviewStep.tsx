
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Import components
import { OverviewTab, OptimizeTab, TechnicalTab } from '../final-review/tabs';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';
import { FinalReviewTabNavigation } from '../final-review/FinalReviewTabNavigation';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';
import { useConfetti } from '@/hooks/final-review/useConfetti';
import { toast } from 'sonner';

export const FinalReviewStep = () => {
  const { state, dispatch } = useContentBuilder();
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
  const [activeTab, setActiveTab] = useState("overview");
  const { confettiShown, triggerConfetti } = useConfetti();
  
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
      toast.info("Generating meta information for your content...");
    }
  }, [content, mainKeyword, metaTitle, metaDescription, generateMeta]);

  // Trigger confetti when all checks pass
  useEffect(() => {
    if (completionPercentage === 100 && !confettiShown) {
      triggerConfetti();
      toast.success("All checks passed! Your content is ready to publish.");
    }
  }, [completionPercentage, confettiShown, triggerConfetti]);
  
  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta title to:", value);
    // Update both metaTitle and contentTitle for consistency
    dispatch({ type: 'SET_META_TITLE', payload: value });
    dispatch({ type: 'SET_CONTENT_TITLE', payload: value });
  };
  
  const handleMetaDescriptionChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta description to:", value);
    dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };
  
  // Handler for running necessary checks based on the current tab
  const handleRunTabChecks = () => {
    switch (activeTab) {
      case "overview":
        // Run content-specific checks
        if (!metaTitle || !metaDescription) {
          generateMeta();
        }
        break;
      case "optimize":
        // Run SEO-specific checks
        analyzeSolutionUsage();
        generateTitleSuggestions();
        break;
      case "technical":
        // Run technical checks
        // (This could include structure validation or other technical aspects)
        break;
      default:
        // Run all checks as a fallback
        runAllChecks();
    }
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
      
      {/* Quick Actions - Now contextual based on current tab */}
      <FinalReviewQuickActions 
        isRunningAllChecks={isRunningAllChecks} 
        onRunAllChecks={runAllChecks}
        activeTab={activeTab}
        onRunTabChecks={handleRunTabChecks}
      />
      
      {/* Main Content Area with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <FinalReviewTabNavigation />
          
          {/* Overview Tab (replaces Content tab) */}
          <TabsContent value="overview" className="mt-0">
            <OverviewTab 
              content={content} 
              checklistItems={checklistItems}
              onRunAllChecks={runAllChecks}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              onMetaTitleChange={handleMetaTitleChange}
              onMetaDescriptionChange={handleMetaDescriptionChange}
              onGenerateMeta={generateMeta}
            />
          </TabsContent>
          
          {/* Optimize Tab (replaces SEO tab) */}
          <TabsContent value="optimize" className="mt-0">
            <OptimizeTab 
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
              completionPercentage={completionPercentage}
            />
          </TabsContent>
          
          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-0">
            <TechnicalTab 
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
