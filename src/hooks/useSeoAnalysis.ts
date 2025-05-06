
import { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SeoImprovement } from '@/contexts/content-builder/types';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { calculateKeywordUsageScore } from '@/utils/seo/keywordAnalysis';
import { calculateContentLengthScore, calculateReadabilityScore, generateRecommendations } from '@/utils/seo/contentAnalysis';
import { getImprovementType } from '@/utils/seo/contentRewriter';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for SEO analysis functionality
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
  
  // Calculate keyword usage on content change - with debounce
  useEffect(() => {
    if (!content || !mainKeyword) return;
    
    // Use a small timeout to prevent excessive calculations
    const timer = setTimeout(() => {
      const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
      setKeywordUsage(usage);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [content, mainKeyword, selectedKeywords]);
  
  // Mark step as complete based on score - memoized effect
  useEffect(() => {
    if (seoScore >= 70 || (state.steps[5] && state.steps[5].analyzed)) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  }, [seoScore, dispatch, state.steps]);
  
  // Run SEO analysis - memoized callback
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
    
    setIsAnalyzing(true);
    try {
      // Calculate various scores
      const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
      setKeywordUsage(usage);
      
      const keywordUsageScore = calculateKeywordUsageScore(usage, mainKeyword);
      const contentLengthScore = calculateContentLengthScore(content);
      const readabilityScore = calculateReadabilityScore(content);
      
      // Generate recommendations based on analysis
      const contentRecommendations = generateRecommendations(
        content,
        keywordUsageScore, 
        contentLengthScore, 
        readabilityScore,
        usage,
        mainKeyword
      );
      
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
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
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

  return {
    isAnalyzing,
    keywordUsage,
    recommendations,
    scores,
    improvements,
    runSeoAnalysis,
    getScoreColor
  };
};
