
import React, { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { calculateKeywordUsage, calculateKeywordUsageScore } from '@/utils/seo/keywordAnalysis';
import { calculateContentLengthScore, calculateReadabilityScore, generateRecommendations } from '@/utils/seo/contentAnalysis';
import { getImprovementType } from '@/utils/seo/contentRewriter';
import { ANALYSIS_TIMEOUT } from './constants';
import { determineImpact } from './utils';
import { KeywordUsage, SeoAnalysisScores } from './types';

/**
 * Hook to handle the actual SEO analysis operation
 */
export const useAnalysisOperation = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  // Abort controller reference for cancellable operations
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Run SEO analysis with proper timeout and error handling
  const runAnalysis = useCallback(async (
    setIsAnalyzing: (value: boolean) => void,
    setKeywordUsage: (usage: KeywordUsage[]) => void,
    setRecommendations: (recs: string[]) => void,
    setScores: (scores: SeoAnalysisScores) => void,
    setImprovements: (improvements: any[]) => void,
    setAnalysisError: (error: string | null) => void
  ) => {
    if (!content || !mainKeyword) {
      toast.error('Content or keywords are missing');
      return;
    }
    
    // Prevent multiple analysis runs
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
  }, [content, mainKeyword, selectedKeywords, dispatch]);

  const abortAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    runAnalysis,
    abortAnalysis,
    cleanup
  };
};
