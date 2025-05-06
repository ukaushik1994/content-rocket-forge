
import React, { useEffect, useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useSeoAnalysis } from '@/hooks/seo-analysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';
import { useFinalReview } from '@/hooks/useFinalReview';
import { toast } from 'sonner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Import optimization components
import { SeoAnalysisHeader } from '@/components/content-builder/optimization/SeoAnalysisHeader';
import { ProgressBar } from '@/components/content-builder/optimization/ProgressBar';
import { ContentOptimizationContainer } from '@/components/content-builder/optimization/ContentOptimizationContainer';
import { ContentRewriteDialog } from '@/components/content-builder/optimization/ContentRewriteDialog';

// Import final review components
import { OverviewTab, OptimizeTab, TechnicalTab } from '../final-review/tabs';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';
import { FinalReviewTabNavigation } from '../final-review/FinalReviewTabNavigation';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { SaveAndExportPanel } from '../final-review/SaveAndExportPanel';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';

// Import UI components
import { Button } from '@/components/ui/button';

// Error fallback component for ErrorBoundary
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-800">
    <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
    <p className="mb-4">{error.message || "An unexpected error occurred in the optimization step"}</p>
    <div className="flex gap-3">
      <button 
        onClick={resetErrorBoundary} 
        className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

export const OptimizeAndReviewStep = () => {
  // Get state and actions from context
  const { state, dispatch, skipOptimizationStep, saveContentToDraft, saveContentToPublished, setMetaTitle, setMetaDescription } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    seoScore, 
    seoImprovements,
    metaTitle, 
    metaDescription, 
    documentStructure, 
    selectedSolution,
    solutionIntegrationMetrics,
    selectedKeywords,
    serpData,
    outline
  } = state;
  
  // States for tabs and dialogs
  const [activeTab, setActiveTab] = useState("optimize");
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [initialAnalysisAttempted, setInitialAnalysisAttempted] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(metaTitle || '');
  const [saveNote, setSaveNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  
  // Get optimization functionality
  const { 
    isAnalyzing,
    recommendations,
    scores,
    runSeoAnalysis,
    getScoreColor,
    analysisError,
    forceSkipAnalysis
  } = useSeoAnalysis();
  
  // Get content rewriter functionality
  const {
    showRewriteDialog,
    selectedRecommendation,
    rewriteType,
    rewrittenContent,
    isRewriting,
    handleRewriteContent,
    applyRewrittenContent,
    setShowRewriteDialog,
    isRecommendationApplied,
    forceCompleteOptimization
  } = useContentRewriter();

  // Get final review functionality
  const { 
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage, 
    ctaInfo, 
    titleSuggestions,
    generateMeta, 
    generateTitleSuggestions,
    analyzeSolutionUsage,
    checkStepCompletion,
    runAllChecks
  } = useFinalReview();
  
  // Get checklist items for completion tracking
  const { checklistItems, completionPercentage, passedChecks, totalChecks } = useChecklistItems();
  
  // Run initial analysis if content exists and no optimization has been performed
  useEffect(() => {
    // Check if we should run analysis automatically
    const shouldRunAnalysis = 
      content && 
      content.length > 300 && 
      seoScore === 0 && 
      !isAnalyzing && 
      !showSkipWarning &&
      !initialAnalysisAttempted &&
      activeTab === "optimize";
    
    if (shouldRunAnalysis) {
      // Mark that we've attempted initial analysis to prevent loops
      setInitialAnalysisAttempted(true);
      
      console.log("Starting initial SEO analysis for content...");
      
      // Small delay to allow UI to render before starting analysis
      const timer = setTimeout(() => {
        runSeoAnalysis();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [content, seoScore, runSeoAnalysis, isAnalyzing, showSkipWarning, initialAnalysisAttempted, activeTab]);
  
  // Generate meta information when component mounts if not already set
  useEffect(() => {
    if (content && mainKeyword && (!metaTitle || !metaDescription)) {
      console.log("[OptimizeAndReviewStep] No meta information detected, generating...");
      generateMeta();
      toast.info("Generating meta information for your content...");
    }
  }, [content, mainKeyword, metaTitle, metaDescription, generateMeta]);
  
  // Check if analysis has been run
  const hasRunAnalysis = state.steps[5] && state.steps[5].analyzed;
  
  // Debug step status
  useEffect(() => {
    console.log("Optimize & Review step state:", {
      completed: state.steps[5]?.completed,
      analyzed: state.steps[5]?.analyzed,
      seoScore
    });
  }, [state.steps, seoScore]);
  
  // Ensure we can move forward if analysis errors out
  useEffect(() => {
    if (analysisError && !state.steps[5]?.completed) {
      console.log("Analysis error detected, marking step as analyzed to allow progression");
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    }
  }, [analysisError, dispatch, state.steps]);
  
  // Calculate recommendation IDs 
  const recommendationIds = React.useMemo(() => {
    return seoImprovements ? seoImprovements.map(item => item.id) : [];
  }, [seoImprovements]);
  
  // Calculate how many recommendations have been applied
  const { appliedCount, totalCount, progressPercentage } = React.useMemo(() => {
    const applied = seoImprovements ? seoImprovements.filter(item => item.applied).length : 0;
    const total = recommendationIds.length;
    const percentage = total > 0 ? Math.round((applied / total) * 100) : 0;
    
    return { appliedCount: applied, totalCount: total, progressPercentage: percentage };
  }, [seoImprovements, recommendationIds]);
  
  // Handle skip confirmation
  const handleSkipConfirm = () => {
    if (!hasRunAnalysis && !showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      skipOptimizationStep();
      setShowSkipWarning(false);
      toast.success('Optimization skipped.');
    }
  };

  // Force complete the step
  const handleCompleteOptimize = () => {
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    toast.success("Optimization step completed");
    setActiveTab("review");
  };

  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    console.log("[OptimizeAndReviewStep] Setting meta title to:", value);
    // Update both metaTitle and contentTitle for consistency
    setMetaTitle(value);
    dispatch({ type: 'SET_CONTENT_TITLE', payload: value });
    setSaveTitle(value); // Update the save dialog title too
  };
  
  const handleMetaDescriptionChange = (value: string) => {
    console.log("[OptimizeAndReviewStep] Setting meta description to:", value);
    setMetaDescription(value);
  };

  // Handler for running necessary checks based on the current tab
  const handleRunTabChecks = () => {
    switch (activeTab) {
      case "review":
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
        break;
      default:
        // Run all checks as a fallback
        runAllChecks();
    }
  };

  // Save content to draft
  const handleSaveToDraft = async () => {
    if (!saveTitle.trim()) {
      toast.error("Please enter a title before saving");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveContentToDraft({
        title: saveTitle,
        note: saveNote,
        isPublished: false,
        mainKeyword,
        content,
        metaTitle,
        metaDescription,
        outline,
        seoScore
      });
      
      setIsSavedToDraft(true);
      toast.success("Content saved to drafts");
      
      // Close the dialog after saving
      setShowSaveDialog(false);
      
      // Mark the step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish content directly
  const handlePublishContent = async () => {
    if (!metaTitle) {
      toast.error("Please set a title before publishing");
      return;
    }
    
    if (completionPercentage < 60) {
      toast.warning("Your content still needs optimization before publishing");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveContentToPublished({
        title: metaTitle,
        note: "Published from content builder",
        isPublished: true,
        mainKeyword,
        content,
        metaTitle,
        metaDescription,
        outline,
        seoScore
      });
      
      toast.success("Content published successfully!");
      
      // Mark the step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    } catch (error) {
      console.error("Error publishing content:", error);
      toast.error("Failed to publish content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset error boundary handler
  const handleResetError = () => {
    window.location.reload();
  };
  
  // Render the content based on the active tab
  const renderContent = () => {
    if (activeTab === "optimize") {
      return (
        <div className="space-y-6">
          <SeoAnalysisHeader
            seoScore={seoScore}
            isAnalyzing={isAnalyzing}
            runSeoAnalysis={runSeoAnalysis}
            hasRunAnalysis={hasRunAnalysis}
            skipOptimizationStep={skipOptimizationStep}
            content={content}
            analysisError={analysisError}
          />
          
          {totalCount > 0 && (
            <ProgressBar 
              appliedCount={appliedCount} 
              totalCount={totalCount} 
              progressPercentage={progressPercentage} 
            />
          )}
          
          <ContentOptimizationContainer
            recommendations={recommendations}
            recommendationIds={recommendationIds}
            scores={scores}
            seoScore={seoScore}
            isAnalyzing={isAnalyzing}
            handleRewriteContent={handleRewriteContent}
            isRecommendationApplied={isRecommendationApplied}
            getScoreColor={getScoreColor}
            hasRunAnalysis={hasRunAnalysis}
            handleSkipConfirm={handleSkipConfirm}
            analysisError={analysisError}
            forceSkipAnalysis={forceSkipAnalysis}
          />
          
          <ContentRewriteDialog
            open={showRewriteDialog}
            onOpenChange={setShowRewriteDialog}
            selectedRecommendation={selectedRecommendation}
            rewriteType={rewriteType}
            rewrittenContent={rewrittenContent}
            isRewriting={isRewriting}
            onApplyContent={applyRewrittenContent}
          />
          
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button 
              onClick={handleCompleteOptimize}
              className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 shadow-lg"
            >
              Continue to Review
            </Button>
          </div>
        </div>
      );
    } else if (activeTab === "review") {
      return (
        <div className="animate-fade-in">
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
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6"
          >
            <SaveAndExportPanel
              completionPercentage={completionPercentage}
              onSave={() => setShowSaveDialog(true)}
              onPublish={handlePublishContent}
              isSaving={isSaving}
              isSavedToDraft={isSavedToDraft}
            />
          </motion.div>
          
          <div className="mt-6">
            <FinalReviewQuickActions 
              isRunningAllChecks={isRunningAllChecks} 
              onRunAllChecks={runAllChecks}
              activeTab="review"
              onRunTabChecks={handleRunTabChecks}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
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
          </motion.div>
        </div>
      );
    } else if (activeTab === "technical") {
      return (
        <div className="mt-6">
          <TechnicalTab 
            documentStructure={documentStructure}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            serpData={serpData}
          />
        </div>
      );
    }
  };
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleResetError}>
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="border-b border-border">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("optimize")}
              className={`pb-2 px-1 font-medium text-sm transition-all ${
                activeTab === "optimize"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Optimize
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`pb-2 px-1 font-medium text-sm transition-all ${
                activeTab === "review"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Review
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`pb-2 px-1 font-medium text-sm transition-all ${
                activeTab === "technical"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Technical
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        {renderContent()}
      </div>
      
      {/* Save Dialog */}
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
        outlineLength={outline ? outline.length : 0}
      />
    </ErrorBoundary>
  );
};
