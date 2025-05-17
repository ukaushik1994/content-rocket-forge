
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { ContentOptimizationContainer } from '../optimization/ContentOptimizationContainer';
import { ContentRewriteDialog } from '../optimization/ContentRewriteDialog';
import { KeywordAnalysisCard } from '../optimization/KeywordAnalysisCard';
import { ProgressBar } from '../optimization/ProgressBar';
import { RecommendationsCard } from '../optimization/RecommendationsCard';
import { SeoAnalysisHeader } from '../optimization/SeoAnalysisHeader';
import { SeoScoreCard } from '../optimization/SeoScoreCard';
import { SkipWarning } from '../optimization/SkipWarning';
import { useSeoAnalysis } from '@/hooks/useSeoAnalysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';

export const OptimizeAndReviewStep = () => {
  const { state, skipOptimizationStep } = useContentBuilder();
  const { content, mainKeyword, seoScore, optimizationSkipped } = state;
  
  // Use SEO analysis hook
  const { 
    isAnalyzing, 
    recommendations,
    recommendationIds,
    keywordUsage,
    runSeoAnalysis,
    analyzeContent,
    getScoreColor,
    forceSkipAnalysis,
    handleApplyRecommendation,
    isRecommendationApplied
  } = useSeoAnalysis();
  
  // Use content rewriter hook
  const { 
    showRewriteDialog, 
    setShowRewriteDialog,
    rewriteSection, 
    sectionToRewrite, 
    setSectionToRewrite,
    isRewriting,
    selectedRecommendation,
    rewriteType,
    rewrittenContent,
    handleRewriteContent,
    applyRewrittenContent,
    isRecommendationApplied: isRecommendationAppliedFromRewriter
  } = useContentRewriter();
  
  return (
    <div className="space-y-6">
      {/* SEO Analysis Header */}
      <SeoAnalysisHeader 
        seoScore={seoScore}
        isAnalyzing={isAnalyzing}
        runSeoAnalysis={runSeoAnalysis}
        hasRunAnalysis={recommendations.length > 0}
        skipOptimizationStep={skipOptimizationStep}
        content={content}
        analysisError={null}
        onAnalyze={analyzeContent}
      />
      
      {/* Display selected SERP items */}
      <SelectedSerpItemsCard />
      
      {/* If optimization is skipped, show warning */}
      {optimizationSkipped ? (
        <SkipWarning 
          onSkip={skipOptimizationStep} 
          onCancel={() => runSeoAnalysis()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* SEO Score Card */}
            <SeoScoreCard 
              seoScore={seoScore}
              scores={{
                keywordUsage: seoScore,
                contentLength: seoScore,
                readability: seoScore
              }}
              getScoreColor={getScoreColor}
            />
            
            {/* Progress Bar */}
            <div className="md:col-span-2">
              <ProgressBar value={seoScore} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Keyword Analysis */}
              <KeywordAnalysisCard 
                mainKeyword={mainKeyword} 
                keywordUsage={keywordUsage}
              />
              
              {/* Recommendations */}
              <RecommendationsCard 
                recommendations={recommendations}
                recommendationIds={recommendationIds || []}
                isAnalyzing={isAnalyzing}
                handleRewriteContent={handleRewriteContent}
                isRecommendationApplied={isRecommendationApplied}
                showRecoveryOption={isAnalyzing && isAnalyzing}
                onForceSkip={forceSkipAnalysis}
              />
            </div>
            
            <div className="lg:col-span-2">
              {/* Content Optimization Container */}
              <ContentOptimizationContainer 
                contentValue={content}
                onRewriteSection={(section) => {
                  setSectionToRewrite(section);
                  setShowRewriteDialog(true);
                }}
              />
            </div>
          </div>
        </>
      )}
      
      {/* Content Rewrite Dialog */}
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
  );
};
