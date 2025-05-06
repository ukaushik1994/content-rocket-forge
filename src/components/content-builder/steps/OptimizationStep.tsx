
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Wand2, CheckCircle, BarChart2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom hooks
import { useSeoAnalysis } from '@/hooks/useSeoAnalysis';
import { useContentRewriter } from '@/hooks/useContentRewriter';

// Components
import { SeoScoreCard } from '@/components/content-builder/optimization/SeoScoreCard';
import { RecommendationsCard } from '@/components/content-builder/optimization/RecommendationsCard';
import { ContentRewriteDialog } from '@/components/content-builder/optimization/ContentRewriteDialog';

export const OptimizationStep = () => {
  const { state, navigateToStep } = useContentBuilder();
  const { content, mainKeyword, seoScore, seoImprovements, activeStep } = state;
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Use custom hooks for functionality
  const { 
    isAnalyzing,
    recommendations,
    scores,
    runSeoAnalysis,
    skipOptimization,
    hasRunAnalysis,
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
  
  // Get recommendation IDs from the state
  const recommendationIds = seoImprovements ? seoImprovements.map(item => item.id) : [];
  
  // Calculate how many recommendations have been applied
  const appliedCount = seoImprovements ? seoImprovements.filter(item => item.applied).length : 0;
  const totalCount = recommendationIds.length;
  const progressPercentage = totalCount > 0 ? Math.round((appliedCount / totalCount) * 100) : 0;
  
  // Function to proceed to the next step
  const handleContinue = () => {
    navigateToStep(activeStep + 1);
  };
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-blue-900/5 border border-purple-500/20 rounded-xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                SEO Content Optimization
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze your content and apply AI-powered optimizations to increase your SEO score.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {seoScore > 0 && (
              <Badge variant="outline" className="bg-card px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5 text-purple-500" />
                <span>Score: </span>
                <span className={`font-bold ${seoScore >= 70 ? 'text-green-500' : seoScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {seoScore}
                </span>
              </Badge>
            )}
            
            <Button
              onClick={runSeoAnalysis}
              disabled={isAnalyzing || !content || content.length < 300}
              className={seoScore > 0 ? 'gap-2' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2 shadow-md shadow-purple-500/20'}
              size="sm"
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
            
            <Button
              onClick={skipOptimization}
              variant="outline"
              size="sm"
              className="gap-2 border-purple-500/30 hover:bg-purple-500/10"
            >
              <ArrowRight className="h-4 w-4" />
              Skip Optimization
            </Button>
          </div>
        </div>
        
        {/* Progress indicator for applied recommendations */}
        {totalCount > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Optimizations Applied</span>
              <span className="text-xs font-medium">{appliedCount}/{totalCount}</span>
            </div>
            <div className="h-1.5 w-full bg-purple-900/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                style={{ width: `${progressPercentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
        
        {/* Continue button if analysis has been run */}
        {hasRunAnalysis && (
          <div className="mt-4 pt-4 border-t border-purple-500/10 flex justify-end">
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
            >
              Continue to Next Step <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RecommendationsCard 
              recommendations={recommendations} 
              recommendationIds={recommendationIds}
              isAnalyzing={isAnalyzing}
              handleRewriteContent={handleRewriteContent}
              isRecommendationApplied={isRecommendationApplied}
            />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SeoScoreCard 
            seoScore={seoScore} 
            scores={scores} 
            getScoreColor={getScoreColor}
          />
        </motion.div>
      </div>
      
      <ContentRewriteDialog
        open={showRewriteDialog}
        onOpenChange={setShowRewriteDialog}
        selectedRecommendation={selectedRecommendation}
        rewriteType={rewriteType}
        rewrittenContent={rewrittenContent}
        isRewriting={isRewriting}
        onApplyContent={applyRewrittenContent}
      />
      
      {/* Confetti effect for high scores */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none flex justify-center">
          <div className="w-full h-full max-w-5xl">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                  top: `${Math.random() * -20}%`,
                  left: `${Math.random() * 100}%`
                }}
                animate={{
                  y: ['0vh', '100vh'],
                  x: [`${Math.random() * 10 - 5}px`, `${Math.random() * 100 - 50}px`]
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
