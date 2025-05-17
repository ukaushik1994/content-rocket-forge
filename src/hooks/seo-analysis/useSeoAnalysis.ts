
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
  const [recommendationIds, setRecommendationIds] = useState<string[]>([]);
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
  
  // Ensure step is marked as analyzed when we have recommendations
  useEffect(() => {
    if (recommendations.length > 0) {
      console.log('Marking step as analyzed due to recommendations presence');
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    }
  }, [recommendations, dispatch]);
  
  // Mark step as complete based on score or analysis - ensure we only run this once
  useEffect(() => {
    // Only mark as analyzed and completed if we have a good score
    // This prevents loops from repeatedly dispatching actions
    if (seoScore >= 70 && !state.steps[5]?.completed) {
      console.log('Marking step as analyzed and completed due to good score:', seoScore);
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    } 
    // If step was analyzed but not completed, and we have a minimum score, mark as completed
    else if (state.steps[5]?.analyzed && !state.steps[5]?.completed && seoScore >= 50) {
      console.log('Marking step as completed due to minimum score:', seoScore);
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  }, [seoScore, dispatch, state.steps]);
  
  // Run SEO analysis with proper timeout and error handling
  const runSeoAnalysis = useCallback(() => {
    // Prevent duplicate analysis runs
    if (isAnalyzing) return;
    
    // Show loading toast
    toast.loading('Analyzing your content...', { id: 'seo-analysis' });
    
    console.log('Starting SEO analysis run...');
    
    runAnalysis(
      setIsAnalyzing,
      setKeywordUsage,
      setRecommendations,
      setScores,
      setImprovements,
      setAnalysisError
    );
    
    // Generate random recommendation IDs
    setRecommendationIds(Array(recommendations.length || 5).fill(0).map(() => Math.random().toString(36).substring(2, 9)));
    
    // Always mark step as analyzed after running analysis
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
  }, [runAnalysis, isAnalyzing, dispatch, recommendations]);
  
  // Alias for runSeoAnalysis to match expected interface
  const analyzeContent = runSeoAnalysis;
  
  // Force skip analysis if it's taking too long
  const forceSkipAnalysis = useCallback(() => {
    // Abort any running analysis
    abortAnalysis();
    
    setIsAnalyzing(false);
    setAnalysisError(null);
    
    console.log('Force skipping analysis...');
    
    // Mark step as analyzed and completed so user can continue
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    toast.success('Optimization step skipped. You can continue to the next step.');
  }, [dispatch, abortAnalysis]);
  
  // Handle recommendation application
  const handleApplyRecommendation = useCallback((id: string) => {
    console.log(`Applied recommendation with ID: ${id}`);
    // In a real app, this would apply the recommendation to the content
  }, []);
  
  // Check if a recommendation is applied
  const isRecommendationApplied = useCallback((id: string) => {
    // In a real app, this would check if the recommendation is applied
    return false;
  }, []);

  return {
    isAnalyzing,
    keywordUsage,
    recommendations,
    recommendationIds,
    scores,
    improvements,
    analysisError,
    runSeoAnalysis,
    analyzeContent,
    getScoreColor,
    forceSkipAnalysis,
    handleApplyRecommendation,
    isRecommendationApplied
  };
};
