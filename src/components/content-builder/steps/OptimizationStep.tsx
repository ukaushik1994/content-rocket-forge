
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentRewriteDialog } from '@/components/content-builder/optimization/ContentRewriteDialog';
import { useSeoAnalysis } from '@/hooks/useSeoAnalysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';
import { SeoAnalysisHeader } from '@/components/content-builder/optimization/SeoAnalysisHeader';
import { ProgressBar } from '@/components/content-builder/optimization/ProgressBar';
import { SkipWarning } from '@/components/content-builder/optimization/SkipWarning';
import { ContentOptimizationContainer } from '@/components/content-builder/optimization/ContentOptimizationContainer';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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
  const { state, skipOptimizationStep } = useContentBuilder();
  const { content, mainKeyword, seoScore, seoImprovements } = state;
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  
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
    isRecommendationApplied
  } = useContentRewriter();
  
  // Run initial analysis if we have content but no SEO score - with proper dependency array
  useEffect(() => {
    const shouldRunAnalysis = 
      content && 
      content.length > 300 && 
      seoScore === 0 && 
      !isAnalyzing && 
      !showSkipWarning;
    
    if (shouldRunAnalysis) {
      // Small delay to allow UI to render before starting analysis
      const timer = setTimeout(() => {
        runSeoAnalysis();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [content, seoScore, runSeoAnalysis, isAnalyzing, showSkipWarning]);
  
  // Check if analysis has been run
  const hasRunAnalysis = state.steps[5] && state.steps[5].analyzed;
  
  // Handle skip with confirmation - with proper safeguards
  const handleSkipConfirm = () => {
    if (!hasRunAnalysis && !showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      skipOptimizationStep();
      setShowSkipWarning(false);
    }
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
      </div>
    </ErrorBoundary>
  );
};
