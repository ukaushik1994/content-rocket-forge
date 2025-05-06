
import React, { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useSeoAnalysis } from '@/hooks/seo-analysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';
import { SeoAnalysisHeader } from './SeoAnalysisHeader';
import { ProgressBar } from './ProgressBar';
import { SkipWarning } from './SkipWarning';
import { ContentOptimizationContainer } from './ContentOptimizationContainer';
import { ContentRewriteDialog } from './ContentRewriteDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const OptimizationLayout = () => {
  const { state, skipOptimizationStep } = useContentBuilder();
  const { content, mainKeyword, seoScore, seoImprovements } = state;
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [analysisAttempted, setAnalysisAttempted] = useState(false);
  const [autoAnalysisTriggered, setAutoAnalysisTriggered] = useState(false);
  
  // Use custom hooks with proper error handling
  const { 
    isAnalyzing,
    recommendations,
    scores,
    runSeoAnalysis,
    getScoreColor,
    analysisError,
    forceSkipAnalysis,
    keywordUsage
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
    rewriteError
  } = useContentRewriter();
  
  // Check if analysis has been run
  const hasRunAnalysis = state.steps[5] && state.steps[5].analyzed;
  
  // Run initial analysis if we have content but no SEO score - with proper dependency array and safeguards
  useEffect(() => {
    const shouldRunAnalysis = 
      content && 
      content.length > 300 && 
      seoScore === 0 && 
      !isAnalyzing && 
      !showSkipWarning &&
      !analysisAttempted &&
      !autoAnalysisTriggered;
    
    if (shouldRunAnalysis) {
      setAutoAnalysisTriggered(true);
      
      // Small delay to allow UI to render before starting analysis
      const timer = setTimeout(() => {
        try {
          runSeoAnalysis();
          setAnalysisAttempted(true);
        } catch (error) {
          console.error("Failed to run initial analysis:", error);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [content, seoScore, runSeoAnalysis, isAnalyzing, showSkipWarning, analysisAttempted, autoAnalysisTriggered]);
  
  // Handle skip with confirmation - with proper safeguards
  const handleSkipConfirm = useCallback(() => {
    if (!hasRunAnalysis && !showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      skipOptimizationStep();
      setShowSkipWarning(false);
    }
  }, [hasRunAnalysis, showSkipWarning, skipOptimizationStep]);
  
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
  
  // Manual analysis handler with error handling
  const handleManualAnalysis = useCallback(() => {
    setAnalysisAttempted(true);
    runSeoAnalysis();
  }, [runSeoAnalysis]);
  
  return (
    <div className="space-y-6">
      {/* Critical error alert - shown when there are serious issues */}
      {analysisError && analysisError.includes("critical") && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Error</AlertTitle>
          <AlertDescription>
            {analysisError}. You can skip this step or try again.
          </AlertDescription>
        </Alert>
      )}
      
      <SeoAnalysisHeader
        seoScore={seoScore}
        isAnalyzing={isAnalyzing}
        runSeoAnalysis={handleManualAnalysis}
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
        keywordUsage={keywordUsage}
        contentLength={content?.length ?? 0}
      />
      
      <ContentRewriteDialog
        open={showRewriteDialog}
        onOpenChange={setShowRewriteDialog}
        selectedRecommendation={selectedRecommendation}
        rewriteType={rewriteType}
        rewrittenContent={rewrittenContent}
        isRewriting={isRewriting}
        onApplyContent={applyRewrittenContent}
        error={rewriteError}
      />
    </div>
  );
};
