
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SeoImprovement } from '@/contexts/content-builder/types';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { calculateKeywordUsageScore } from '@/utils/seo/keywordAnalysis';
import { calculateContentLengthScore, calculateReadabilityScore, generateRecommendations } from '@/utils/seo/contentAnalysis';
import { getImprovementType } from '@/utils/seo/contentRewriter';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Analysis timeout constants
const ANALYSIS_TIMEOUT = 10000; // 10 second timeout for analysis

/**
 * Custom hook for SEO analysis functionality with improved performance and error handling
 */
export const useSeoAnalysis = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, seoScore, seoImprovements } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scores, setScores] = useState({
    keywordUsage: 0,
    contentLength: 0,
    readability: 0
  });
  const [improvements, setImprovements] = useState<SeoImprovement[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Abort controller reference for cancellable operations
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
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
  const runSeoAnalysis = useCallback(async () => {
    if (!content || !mainKeyword) {
      toast.error('Content or keywords are missing');
      return;
    }
    
    // Prevent multiple analysis runs
    if (isAnalyzing) {
      console.log('SEO analysis already in progress');
      return;
    }
    
    // Cancel any existing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timed out')), ANALYSIS_TIMEOUT);
    });
    
    // Create the analysis promise
    const analysisPromise = (async () => {
      try {
        // Calculate various scores
        const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
        
        // Check if operation was aborted after keyword usage
        if (signal.aborted) return;
        
        const keywordUsageScore = calculateKeywordUsageScore(usage, mainKeyword);
        const contentLengthScore = calculateContentLengthScore(content);
        const readabilityScore = calculateReadabilityScore(content);
        
        // Check if operation was aborted after scores calculation
        if (signal.aborted) return;
        
        // Generate recommendations based on analysis
        const contentRecommendations = generateRecommendations(
          content,
          keywordUsageScore, 
          contentLengthScore, 
          readabilityScore,
          usage,
          mainKeyword
        );
        
        // Check if operation was aborted after recommendations
        if (signal.aborted) return;
        
        setKeywordUsage(usage);
        setRecommendations(contentRecommendations);
        setScores({
          keywordUsage: keywordUsageScore,
          contentLength: contentLengthScore,
          readability: readabilityScore
        });
        
        // Create SEO improvements with unique IDs
        const newImprovements = contentRecommendations.map(recommendation => {
          const improvementType = getImprovementType(recommendation);
          return {
            id: uuidv4(),
            type: improvementType,
            recommendation,
            impact: determineImpact(improvementType, keywordUsageScore),
            applied: false
          };
        });
        
        setImprovements(newImprovements);
        dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: newImprovements });
        
        // Weighted average
        const calculatedScore = Math.round(
          (keywordUsageScore * 0.4) + 
          (contentLengthScore * 0.3) + 
          (readabilityScore * 0.3)
        );
        
        dispatch({ type: 'SET_SEO_SCORE', payload: calculatedScore });
        
        // Mark step as analyzed regardless of score
        dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
        
        toast.success('SEO analysis completed');
      } catch (error) {
        if (!signal.aborted) {
          console.error('Error analyzing content:', error);
          setAnalysisError('Analysis failed. Please try again.');
          throw error;
        }
      }
    })();
    
    try {
      // Race the analysis against the timeout
      await Promise.race([analysisPromise, timeoutPromise]);
    } catch (error) {
      console.error('SEO analysis error:', error);
      
      if (!signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze content';
        setAnalysisError(errorMessage);
        
        // Even if analysis fails, mark as analyzed so user can continue
        dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
        
        toast.error(errorMessage === 'Analysis timed out' 
          ? 'Analysis took too long. You can continue without optimization.' 
          : 'Failed to analyze content. You can continue without optimization.');
      }
    } finally {
      // Only update state if the operation wasn't aborted
      if (!signal.aborted) {
        setIsAnalyzing(false);
        abortControllerRef.current = null;
      }
    }
  }, [content, mainKeyword, selectedKeywords, isAnalyzing, dispatch]);
  
  // Helper function to determine impact level
  const determineImpact = (type: string, score: number): 'high' | 'medium' | 'low' => {
    if (type === 'keyword' && score < 50) return 'high';
    if (type === 'readability' && score < 60) return 'high';
    if (score < 50) return 'high';
    if (score < 70) return 'medium';
    return 'low';
  };
  
  // Get score color based on value - memoized
  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'stroke-green-500';
    if (score >= 70) return 'stroke-yellow-500';
    if (score >= 50) return 'stroke-orange-500';
    return 'stroke-red-500';
  }, []);
  
  // Force skip analysis if it's taking too long
  const forceSkipAnalysis = useCallback(() => {
    // Abort any running analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsAnalyzing(false);
    setAnalysisError(null);
    
    // Mark step as analyzed so user can continue
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    toast.info('Optimization step skipped. You can continue to the next step.');
  }, [dispatch]);

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
