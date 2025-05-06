
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentRewriteDialog } from '@/components/content-builder/optimization/ContentRewriteDialog';
import { useSeoAnalysis } from '@/hooks/useSeoAnalysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';
import { SeoAnalysisHeader } from '@/components/content-builder/optimization/SeoAnalysisHeader';
import { ProgressBar } from '@/components/content-builder/optimization/ProgressBar';
import { SkipWarning } from '@/components/content-builder/optimization/SkipWarning';
import { Confetti } from '@/components/content-builder/optimization/Confetti';
import { ContentOptimizationContainer } from '@/components/content-builder/optimization/ContentOptimizationContainer';

export const OptimizationStep = () => {
  const { state, skipOptimizationStep } = useContentBuilder();
  const { content, mainKeyword, seoScore, seoImprovements } = state;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  
  // Use custom hooks for functionality
  const { 
    isAnalyzing,
    recommendations,
    scores,
    runSeoAnalysis,
    getScoreColor
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
  
  // Run initial analysis if we have content but no SEO score
  useEffect(() => {
    if (content && content.length > 300 && seoScore === 0) {
      runSeoAnalysis();
    }
  }, [content, seoScore, runSeoAnalysis]);

  // Show confetti effect when score is high
  useEffect(() => {
    if (seoScore >= 80) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [seoScore]);
  
  // Check if analysis has been run
  const hasRunAnalysis = state.steps[5] && state.steps[5].analyzed;
  
  // Handle skip with confirmation
  const handleSkipConfirm = () => {
    if (!hasRunAnalysis && !showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      skipOptimizationStep();
      setShowSkipWarning(false);
    }
  };
  
  // Get recommendation IDs from the state
  const recommendationIds = seoImprovements ? seoImprovements.map(item => item.id) : [];
  
  // Calculate how many recommendations have been applied
  const appliedCount = seoImprovements ? seoImprovements.filter(item => item.applied).length : 0;
  const totalCount = recommendationIds.length;
  const progressPercentage = totalCount > 0 ? Math.round((appliedCount / totalCount) * 100) : 0;
  
  return (
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
      
      <Confetti show={showConfetti} />
    </div>
  );
};
