import React, { useEffect } from 'react';
import { useContentOptimization } from '@/hooks/useContentOptimization';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SeoAnalysisHeader } from '../optimization/SeoAnalysisHeader';
import { ContentOptimizationContainer } from '../optimization/ContentOptimizationContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContentOptimizationStep = () => {
  const { state, navigateToStep } = useContentBuilder();
  const { content } = state;
  
  const { 
    seoScore,
    improvements,
    scores,
    isAnalyzing,
    hasRunAnalysis,
    analysisError,
    optimizationMetrics,
    runSeoAnalysis,
    handleApplyImprovement,
    isImprovementApplied,
    getScoreColor,
    handleSkipConfirm,
    forceSkipAnalysis
  } = useContentOptimization();
  
  // Check if all improvements are applied
  const allImprovementsApplied = improvements.length > 0 && 
    improvements.every(imp => isImprovementApplied(imp.id));
  
  // Go back to content step
  const handleGoBack = () => {
    navigateToStep(4); // Go back to content writing step
  };
  
  // Go to next step
  const handleContinue = () => {
    navigateToStep(6); // Final review step
  };
  
  // Auto-continue if all improvements applied or score is high
  useEffect(() => {
    if ((allImprovementsApplied && hasRunAnalysis) || (hasRunAnalysis && seoScore >= 90)) {
      // Set a small delay to auto-continue after all improvements are applied
      const timer = setTimeout(() => {
        handleContinue();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [allImprovementsApplied, hasRunAnalysis, seoScore]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <SeoAnalysisHeader
        seoScore={seoScore}
        isAnalyzing={isAnalyzing}
        runSeoAnalysis={runSeoAnalysis}
        hasRunAnalysis={hasRunAnalysis}
        skipOptimizationStep={handleSkipConfirm}
        content={content}
        analysisError={analysisError}
      />
      
      <ContentOptimizationContainer
        improvements={improvements}
        scores={scores}
        seoScore={seoScore}
        isAnalyzing={isAnalyzing}
        handleApplyImprovement={(id) => handleApplyImprovement(id)}
        isImprovementApplied={isImprovementApplied}
        getScoreColor={getScoreColor}
        hasRunAnalysis={hasRunAnalysis}
        handleSkipConfirm={handleSkipConfirm}
        analysisError={analysisError}
        forceSkipAnalysis={forceSkipAnalysis}
        optimizationMetrics={optimizationMetrics}
      />
      
      <div className="flex justify-between pt-4 mt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Content
        </Button>
        
        <Button
          onClick={handleContinue}
          className={hasRunAnalysis ? 'bg-green-600 hover:bg-green-700' : ''}
          disabled={isAnalyzing}
        >
          {hasRunAnalysis ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Continue to Review
            </>
          ) : (
            'Skip Optimization'
          )}
        </Button>
      </div>
    </motion.div>
  );
};
