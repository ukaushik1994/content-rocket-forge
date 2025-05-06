
import React, { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { useAnalysisOperation } from './useAnalysisOperation';
import { getScoreColor } from './utils';
import { KeywordUsage, SeoAnalysisScores, UseSeoAnalysisReturn } from './types';

/**
 * Enhanced SEO analysis hook with improved error handling and recovery options
 */
export const useSeoAnalysis = (): UseSeoAnalysisReturn => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, seoScore } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<KeywordUsage[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scores, setScores] = useState<SeoAnalysisScores>({
    keywordUsage: 0,
    contentLength: 0,
    readability: 0
  });
  const [improvements, setImprovements] = useState<any[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  
  const { runAnalysis, abortAnalysis, cleanup } = useAnalysisOperation();
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Calculate keyword usage on content change - with proper debounce
  useEffect(() => {
    if (!content || !mainKeyword) return;
    
    const timer = setTimeout(() => {
      try {
        const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
        setKeywordUsage(usage);
      } catch (error) {
        console.error('Error calculating keyword usage:', error);
        // Don't show toast here to avoid spamming user during typing
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, mainKeyword, selectedKeywords]);
  
  // Mark step as complete based on score - memoized effect with proper dependencies
  useEffect(() => {
    if (seoScore >= 70 || (state.steps[5] && state.steps[5].analyzed)) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  }, [seoScore, dispatch, state.steps]);
  
  // Run SEO analysis with proper timeout and error handling
  const runSeoAnalysis = useCallback(() => {
    // Reset error state
    setAnalysisError(null);
    setAnalysisStartTime(Date.now());
    
    // Run analysis with enhanced error handling
    runAnalysis(
      setIsAnalyzing,
      setKeywordUsage,
      setRecommendations,
      setScores,
      setImprovements,
      setAnalysisError
    ).catch((error) => {
      // This catch handles any uncaught exceptions from the analysis process
      console.error("Uncaught analysis error:", error);
      setAnalysisError(`Unexpected error: ${error.message}`);
      setIsAnalyzing(false);
    });
  }, [runAnalysis]);
  
  // Monitor analysis duration for potentially stuck processes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (isAnalyzing && analysisStartTime) {
      timer = setTimeout(() => {
        // If analysis is still running after 30 seconds, show a warning
        if (isAnalyzing) {
          toast.warning("Analysis is taking longer than expected. You can continue waiting or skip this step.");
        }
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnalyzing, analysisStartTime]);
  
  // Force skip analysis if it's taking too long
  const forceSkipAnalysis = useCallback(() => {
    // Abort any running analysis
    abortAnalysis();
    
    setIsAnalyzing(false);
    setAnalysisError(null);
    
    // Mark step as analyzed so user can continue
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    toast.info('Optimization step skipped. You can continue to the next step.');
  }, [dispatch, abortAnalysis]);

  return {
    isAnalyzing,
    keywordUsage,
    recommendations,
    scores,
    improvements,
    analysisError,
    runSeoAnalysis,
    getScoreColor,
    forceSkipAnalysis
  };
};
