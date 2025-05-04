
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';

// Custom hooks
import { useSeoAnalysis } from '@/hooks/useSeoAnalysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';

// Components
import { SeoScoreCard } from '@/components/content-builder/optimization/SeoScoreCard';
import { RecommendationsCard } from '@/components/content-builder/optimization/RecommendationsCard';
import { KeywordAnalysisCard } from '@/components/content-builder/optimization/KeywordAnalysisCard';
import { ContentRewriteDialog } from '@/components/content-builder/optimization/ContentRewriteDialog';

export const OptimizationStep = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, seoScore } = state;
  
  // Use custom hooks for functionality
  const { 
    isAnalyzing,
    keywordUsage, 
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
    setShowRewriteDialog
  } = useContentRewriter();
  
  // Run initial analysis if we have content but no SEO score
  useEffect(() => {
    if (content && content.length > 300 && seoScore === 0) {
      runSeoAnalysis();
    }
  }, [content, seoScore, runSeoAnalysis]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">SEO Optimization</h3>
          <p className="text-sm text-muted-foreground">
            Analyze and optimize your content for search engines.
          </p>
        </div>
        
        <Button
          onClick={runSeoAnalysis}
          disabled={isAnalyzing || !content || content.length < 300}
          className={seoScore > 0 ? 'gap-2' : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-2'}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {seoScore > 0 ? 'Re-analyze' : 'Analyze Content'}
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <RecommendationsCard 
            recommendations={recommendations} 
            isAnalyzing={isAnalyzing}
            handleRewriteContent={handleRewriteContent}
          />
        </div>
        
        <SeoScoreCard 
          seoScore={seoScore} 
          scores={scores} 
          getScoreColor={getScoreColor}
        />
      </div>
      
      <KeywordAnalysisCard 
        keywordUsage={keywordUsage} 
        mainKeyword={mainKeyword}
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
  );
};
