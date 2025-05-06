
import React, { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { useAnalysisOperation } from './useAnalysisOperation';
import { getScoreColor } from './utils';
import { KeywordUsage, SeoAnalysisScores, UseSeoAnalysisReturn } from './types';

/**
 * Custom hook for SEO analysis functionality with improved performance and error handling
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
  
  // Mark step as complete based on score - fixed with proper dependency check and conditions
  useEffect(() => {
    // Only mark as completed if we have a good score or the step was analyzed
    // Adding a check to prevent repeated dispatches which can cause infinite loops
    const shouldMarkComplete = seoScore >= 70;
    const stepAnalyzed = state.steps[5] && state.steps[5].analyzed;
    
    if ((shouldMarkComplete || stepAnalyzed) && !state.steps[5]?.completed) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  }, [seoScore, dispatch, state.steps]);
  
  // Run SEO analysis with proper timeout and error handling
  const runSeoAnalysis = useCallback(() => {
    // Prevent duplicate analysis runs
    if (isAnalyzing) return;
    
    // Show loading toast
    toast.loading('Analyzing your content...', { id: 'seo-analysis' });
    
    runAnalysis(
      setIsAnalyzing,
      setKeywordUsage,
      setRecommendations,
      setScores,
      setImprovements,
      setAnalysisError
    );
  }, [runAnalysis, isAnalyzing]);
  
  // Force skip analysis if it's taking too long
  const forceSkipAnalysis = useCallback(() => {
    // Abort any running analysis
    abortAnalysis();
    
    setIsAnalyzing(false);
    setAnalysisError(null);
    
    // Mark step as analyzed and completed so user can continue
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    toast.success('Optimization step skipped. You can continue to the next step.');
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
