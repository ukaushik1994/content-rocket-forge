
import { useState, useEffect } from 'react';
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
  const { content, mainKeyword, selectedKeywords, seoScore } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scores, setScores] = useState({
    keywordUsage: 0,
    contentLength: 0,
    readability: 0
  });
  const [improvements, setImprovements] = useState<SeoImprovement[]>([]);
  
  // Calculate keyword usage on content change
  useEffect(() => {
    if (content && mainKeyword) {
      const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
      setKeywordUsage(usage);
    }
    
    // Mark step as complete if we have any SEO score (making it optional)
    if (seoScore > 0) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  }, [content, mainKeyword, selectedKeywords, seoScore, dispatch]);
  
  // Run SEO analysis
  const runSeoAnalysis = async () => {
    if (!content || !mainKeyword) {
      toast.error('Content or keywords are missing');
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
      
      // Mark this step as completed regardless of score
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
      
      toast.success('SEO analysis completed');
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to skip optimization step
  const skipOptimization = () => {
    // Mark step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    // If no analysis was run, set a default score
    if (seoScore === 0) {
      dispatch({ type: 'SET_SEO_SCORE', payload: 50 });
    }
  };
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'stroke-green-500';
    if (score >= 70) return 'stroke-yellow-500';
    if (score >= 50) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  return {
    isAnalyzing,
    keywordUsage,
    recommendations,
    scores,
    improvements,
    runSeoAnalysis,
    skipOptimization,
    getScoreColor
  };
};
