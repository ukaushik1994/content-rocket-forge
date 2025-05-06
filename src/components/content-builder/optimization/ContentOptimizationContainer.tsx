
import React, { memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SeoScoreCard } from './SeoScoreCard';
import { RecommendationsCard } from './RecommendationsCard'; 
import { Button } from '@/components/ui/button';
import { KeywordUsageSummary } from './KeywordUsageSummary';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KeywordUsage } from '@/hooks/seo-analysis/types';

interface ContentOptimizationContainerProps {
  recommendations: string[];
  recommendationIds: string[];
  scores: { keywordUsage: number; contentLength: number; readability: number };
  seoScore: number;
  isAnalyzing: boolean;
  handleRewriteContent: (recommendation: string, id: string) => void;
  isRecommendationApplied: (id: string) => boolean;
  getScoreColor: (score: number) => string;
  hasRunAnalysis: boolean;
  handleSkipConfirm: () => void;
  analysisError?: string | null;
  forceSkipAnalysis?: () => void;
  keywordUsage: KeywordUsage[];
  contentLength: number;
}

// Use memo to prevent unnecessary re-renders
export const ContentOptimizationContainer = memo(({
  recommendations,
  recommendationIds,
  scores,
  seoScore,
  isAnalyzing,
  handleRewriteContent,
  isRecommendationApplied,
  getScoreColor,
  hasRunAnalysis,
  handleSkipConfirm,
  analysisError,
  forceSkipAnalysis,
  keywordUsage,
  contentLength
}: ContentOptimizationContainerProps) => {
  // When analysis has been running for too long, show a recovery button
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [timeoutMessage, setTimeoutMessage] = useState('');
  
  // Progressive timeout warnings
  useEffect(() => {
    let timerShort: ReturnType<typeof setTimeout>;
    let timerLong: ReturnType<typeof setTimeout>;
    
    if (isAnalyzing) {
      // First timeout after 15 seconds
      timerShort = setTimeout(() => {
        setShowRecoveryOption(true);
        setTimeoutMessage("Analysis is taking longer than expected");
      }, 15000);
      
      // Second message after 30 seconds
      timerLong = setTimeout(() => {
        setTimeoutMessage("Analysis may be stuck. Consider skipping this step");
      }, 30000);
    } else {
      setShowRecoveryOption(false);
      setTimeoutMessage('');
    }
    
    return () => {
      clearTimeout(timerShort);
      clearTimeout(timerLong);
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
  
  // Content is too short to analyze
  const isContentTooShort = contentLength < 300;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {isContentTooShort && !isAnalyzing && (
        <div className="lg:col-span-3">
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Content is too short</AlertTitle>
            <AlertDescription>
              Your content needs to be at least 300 characters long for effective SEO analysis. Currently you have {contentLength} characters.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
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
          ) : (
            <RecommendationsCard 
              recommendations={recommendations} 
              recommendationIds={recommendationIds}
              isAnalyzing={isAnalyzing}
              handleRewriteContent={handleRewriteContent}
              isRecommendationApplied={isRecommendationApplied}
              showRecoveryOption={showRecoveryOption}
              onForceSkip={handleForceSkip}
              timeoutMessage={timeoutMessage}
            />
          )}
        </motion.div>
        
        {/* Keyword usage summary */}
        {keywordUsage.length > 0 && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <KeywordUsageSummary keywordUsage={keywordUsage} />
          </motion.div>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <SeoScoreCard 
          seoScore={seoScore} 
          scores={scores} 
          getScoreColor={getScoreColor}
        />
        
        {/* Skip button card - shown when no analysis has run or as a recovery option */}
        {(!hasRunAnalysis || showRecoveryOption) && (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {showRecoveryOption 
                  ? timeoutMessage
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
