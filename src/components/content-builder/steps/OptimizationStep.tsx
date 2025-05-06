
import React, { useEffect, useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentRewriteDialog } from '@/components/content-builder/optimization/ContentRewriteDialog';
import { useSeoAnalysis } from '@/hooks/seo-analysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';
import { SeoAnalysisHeader } from '@/components/content-builder/optimization/SeoAnalysisHeader';
import { ProgressBar } from '@/components/content-builder/optimization/ProgressBar';
import { SkipWarning } from '@/components/content-builder/optimization/SkipWarning';
import { ContentOptimizationContainer } from '@/components/content-builder/optimization/ContentOptimizationContainer';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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

export const OptimizationStep = () => {
  const { state, skipOptimizationStep, navigateToStep, dispatch } = useContentBuilder();
  const { content, mainKeyword, seoScore, seoImprovements } = state;
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [initialAnalysisAttempted, setInitialAnalysisAttempted] = useState(false);
  
  // Use custom hooks for functionality with memoization to prevent unnecessary re-renders
  const { 
    isAnalyzing,
    recommendations,
    scores,
    runSeoAnalysis,
    getScoreColor,
    analysisError,
    forceSkipAnalysis
  } = useSeoAnalysis();
  
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
  
  // Debugging function to check the state of the step
  const debugStepState = useCallback(() => {
    const stepIndex = state.steps.findIndex(step => step.id === 5); // Optimization step has ID 5
    if (stepIndex >= 0) {
      const step = state.steps[stepIndex];
      console.log("Optimization step state:", {
        completed: step.completed,
        analyzed: step.analyzed,
        id: step.id,
        name: step.name,
      });
      console.log("Current active step index:", state.activeStep);
      console.log("SEO Score:", seoScore);
      console.log("Optimization skipped:", state.optimizationSkipped);
      console.log("Can navigate to next step:", state.activeStep < state.steps.length - 1);
    } else {
      console.error("Could not find optimization step");
    }
  }, [state.steps, state.activeStep, seoScore, state.optimizationSkipped]);
  
  // Run initial analysis if we have content but no SEO score - with improved condition checks
  useEffect(() => {
    // Check if we should run analysis automatically
    const shouldRunAnalysis = 
      content && 
      content.length > 300 && 
      seoScore === 0 && 
      !isAnalyzing && 
      !showSkipWarning &&
      !initialAnalysisAttempted;
    
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
  }, [content, seoScore, runSeoAnalysis, isAnalyzing, showSkipWarning, initialAnalysisAttempted]);
  
  // Check if analysis has been run
  const hasRunAnalysis = state.steps[5] && state.steps[5].analyzed;
  
  // Check if optimization step is completed
  const isOptimizationCompleted = state.steps[5] && state.steps[5].completed;
  
  // Debug on component mount and when optimization status changes
  useEffect(() => {
    debugStepState();
  }, [debugStepState, hasRunAnalysis, isOptimizationCompleted, state.optimizationSkipped]);
  
  // Ensure we can move forward if analysis errors out
  useEffect(() => {
    if (analysisError && !state.steps[5]?.completed && !state.optimizationSkipped) {
      console.log("Analysis error detected, marking step as analyzed to allow progression");
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    }
  }, [analysisError, dispatch, state.steps, state.optimizationSkipped]);
  
  // Handle skip with confirmation - with proper safeguards
  const handleSkipConfirm = () => {
    if (!hasRunAnalysis && !showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      skipOptimizationStep();
      setShowSkipWarning(false);
      toast.success('Optimization step skipped. Proceeding to next step.');
      
      // Add a small delay before attempting navigation
      setTimeout(() => {
        navigateToStep(state.activeStep + 1);
      }, 100);
    }
  };
  
  // Force complete the step and navigate to next
  const handleCompleteAndContinue = () => {
    console.log("Force completing optimization step and continuing...");
    
    // First, ensure the step is marked as analyzed and completed
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    // Adding a small delay to ensure state updates before navigation
    setTimeout(() => {
      navigateToStep(state.activeStep + 1);
    }, 100);
  };
  
  // Get recommendation IDs from the state - memoized to prevent recalculation
  const recommendationIds = React.useMemo(() => {
    return seoImprovements ? seoImprovements.map(item => item.id) : [];
  }, [seoImprovements]);
  
  // Calculate how many recommendations have been applied - memoized
  const { appliedCount, totalCount, progressPercentage } = React.useMemo(() => {
    const applied = seoImprovements ? seoImprovements.filter(item => item.applied).length : 0;
    const total = recommendationIds.length;
    const percentage = total > 0 ? Math.round((applied / total) * 100) : 0;
    
    return { appliedCount: applied, totalCount: total, progressPercentage: percentage };
  }, [seoImprovements, recommendationIds]);
  
  // Reset error boundary handler
  const handleResetError = () => {
    window.location.reload();
  };
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleResetError}>
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
        
        {/* Skip Warning Card */}
        {showSkipWarning && (
          <SkipWarning 
            onSkip={skipOptimizationStep} 
            onCancel={() => setShowSkipWarning(false)} 
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
        
        {/* Continue to Final Review button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button 
            onClick={handleCompleteAndContinue}
            className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 shadow-lg"
          >
            Continue to Final Review <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};
