
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
  const { state, analyzeKeyword } = useContentBuilder();
  const { content, mainKeyword, seoScore, optimizationSkipped } = state;
  
  // Use SEO analysis hook
  const { 
    isAnalyzing, 
    recommendations,
    analyzeContent, 
    handleApplyRecommendation
  } = useSeoAnalysis();
  
  // Use content rewriter hook
  const { 
    showRewriteDialog, 
    setShowRewriteDialog,
    rewriteSection, 
    sectionToRewrite, 
    setSectionToRewrite,
    isRewriting
  } = useContentRewriter();
  
  return (
    <div className="space-y-6">
      {/* SEO Analysis Header */}
      <SeoAnalysisHeader 
        isAnalyzing={isAnalyzing}
        onAnalyze={() => analyzeContent(content, mainKeyword)}
      />
      
      {/* Display selected SERP items */}
      <SelectedSerpItemsCard />
      
      {/* If optimization is skipped, show warning */}
      {optimizationSkipped ? (
        <SkipWarning />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* SEO Score Card */}
            <SeoScoreCard score={seoScore} />
            
            {/* Progress Bar */}
            <div className="md:col-span-2">
              <ProgressBar score={seoScore} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Keyword Analysis */}
              <KeywordAnalysisCard mainKeyword={mainKeyword} />
              
              {/* Recommendations */}
              <RecommendationsCard 
                recommendations={recommendations}
                onApply={handleApplyRecommendation}
                isLoading={isAnalyzing}
              />
            </div>
            
            <div className="lg:col-span-2">
              {/* Content Optimization Container */}
              <ContentOptimizationContainer 
                content={content}
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
        isOpen={showRewriteDialog}
        onClose={() => setShowRewriteDialog(false)}
        sectionContent={sectionToRewrite}
        isRewriting={isRewriting}
        onRewrite={rewriteSection}
      />
    </div>
  );
};
