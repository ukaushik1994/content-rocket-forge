
import React, { memo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SeoScoreCard } from './SeoScoreCard';
import { RecommendationsCard } from './RecommendationsCard'; 
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, BarChart2, Info } from 'lucide-react';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';
import { SaveStepOptimizationsAlert } from '../steps/save/SaveStepOptimizationsAlert';

interface ContentOptimizationContainerProps {
  improvements: SeoImprovement[];
  scores: { 
    keywordScore: number; 
    contentLengthScore: number; 
    readabilityScore: number;
    structureScore: number;
  };
  seoScore: number;
  isAnalyzing: boolean;
  handleApplyImprovement: (id: string) => void;
  isImprovementApplied: (id: string) => boolean;
  getScoreColor: (score: number) => string;
  hasRunAnalysis: boolean;
  handleSkipConfirm: () => void;
  analysisError?: string | null;
  forceSkipAnalysis?: () => void;
  optimizationMetrics?: {
    originalScore: number;
    currentScore: number;
    appliedImprovements: number;
    totalImprovements: number;
  } | null;
}

export const ContentOptimizationContainer = memo(({
  improvements,
  scores,
  seoScore,
  isAnalyzing,
  handleApplyImprovement,
  isImprovementApplied,
  getScoreColor,
  hasRunAnalysis,
  handleSkipConfirm,
  analysisError,
  forceSkipAnalysis,
  optimizationMetrics
}: ContentOptimizationContainerProps) => {
  // When analysis has been running for too long, show a recovery option
  const [showRecoveryOption, setShowRecoveryOption] = React.useState(false);
  
  // Extract recommendations from improvements
  const recommendations = improvements.map(imp => imp.recommendation);
  const recommendationIds = improvements.map(imp => imp.id);
  
  // If analysis is running for over 15 seconds, show recovery option
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isAnalyzing) {
      timer = setTimeout(() => {
        setShowRecoveryOption(true);
      }, 15000); // 15 seconds
    } else {
      setShowRecoveryOption(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnalyzing]);
  
  // Skip optimization and continue
  const handleForceSkip = useCallback(() => {
    if (forceSkipAnalysis) {
      forceSkipAnalysis();
    } else {
      handleSkipConfirm();
    }
  }, [forceSkipAnalysis, handleSkipConfirm]);
  
  // Adapt handler to match the RecommendationsCard expectation
  const handleRecommendationApply = useCallback((recommendation: string, id: string) => {
    handleApplyImprovement(id);
  }, [handleApplyImprovement]);
  
  // Check if all improvements are applied
  const allImprovementsApplied = improvements.length > 0 && 
    improvements.every(imp => isImprovementApplied(imp.id));
    
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {analysisError ? (
            <div className="border border-red-200 rounded-lg p-6 bg-red-50 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-medium">Analysis Error</h3>
              </div>
              <p className="text-sm text-red-700">{analysisError}</p>
              <Button 
                onClick={handleForceSkip}
                variant="secondary"
                className="mt-2"
              >
                Skip Analysis & Continue
              </Button>
            </div>
          ) : allImprovementsApplied && improvements.length > 0 ? (
            <div className="border border-green-200 rounded-lg p-6 bg-green-50 space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <Info className="h-5 w-5" />
                <h3 className="font-medium">All Optimizations Applied</h3>
              </div>
              <SaveStepOptimizationsAlert />
              <Button 
                onClick={handleForceSkip}
                className="mt-2 bg-green-600 hover:bg-green-700"
              >
                Continue to Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <RecommendationsCard 
              recommendations={recommendations} 
              recommendationIds={recommendationIds}
              isAnalyzing={isAnalyzing}
              handleRewriteContent={handleRecommendationApply}
              isRecommendationApplied={isImprovementApplied}
              showRecoveryOption={showRecoveryOption}
              onForceSkip={handleForceSkip}
              improvements={improvements}
            />
          )}
        </motion.div>
        
        {/* Show optimization metrics if available */}
        {optimizationMetrics && hasRunAnalysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-sm">Optimization Progress</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="p-2 bg-white rounded border border-blue-100">
                <p className="text-xs text-muted-foreground">Initial Score</p>
                <p className="font-medium">{optimizationMetrics.originalScore}%</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-100">
                <p className="text-xs text-muted-foreground">Current Score</p>
                <p className="font-medium">{optimizationMetrics.currentScore}%</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-100">
                <p className="text-xs text-muted-foreground">Improvements</p>
                <p className="font-medium">{optimizationMetrics.appliedImprovements} of {optimizationMetrics.totalImprovements}</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-100">
                <p className="text-xs text-muted-foreground">Improvement</p>
                <p className="font-medium">+{optimizationMetrics.currentScore - optimizationMetrics.originalScore}%</p>
              </div>
            </div>
          </motion.div>
        )}
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
        
        {/* Skip button card - shown when no analysis has run or as a recovery option */}
        {(!hasRunAnalysis || showRecoveryOption) && (
          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {showRecoveryOption 
                  ? "Analysis is taking longer than expected."
                  : "Don't want to optimize your content now?"}
              </p>
              <Button 
                onClick={handleForceSkip}
                variant="outline" 
                className={`w-full ${showRecoveryOption ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300'}`}
              >
                {showRecoveryOption ? "Skip & Continue" : "Skip Optimization"} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
});

// Add display name for React devtools
ContentOptimizationContainer.displayName = 'ContentOptimizationContainer';
