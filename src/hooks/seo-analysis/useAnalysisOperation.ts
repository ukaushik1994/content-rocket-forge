
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SeoImprovement } from '@/contexts/content-builder/types';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

export const useAnalysisOperation = () => {
  const { state, dispatch } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Extract content from state 
  const { content, mainKeyword, selectedKeywords = [] } = state;
  
  // Check if content has been analyzed
  const isAnalyzed = Boolean(state.seoScore);
  
  // Function to analyze content for SEO optimization
  const analyzeSeo = async (contentToAnalyze: string = content) => {
    if (!contentToAnalyze) {
      toast.warning('No content to analyze');
      return;
    }
    
    if (!mainKeyword) {
      toast.warning('Please set a main keyword before analyzing');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate keyword density
      const keywordDensity = calculateKeywordDensity(contentToAnalyze, [mainKeyword, ...selectedKeywords]);
      
      // Check content length
      const contentLength = contentToAnalyze.split(/\s+/).filter(Boolean).length;
      
      // Generate SEO improvement suggestions
      const improvements: SeoImprovement[] = [];
      
      // Add potential improvements based on analysis
      if (contentLength < 300) {
        improvements.push({
          id: uuid(),
          type: 'content-length',
          description: 'Content is too short',
          recommendation: 'Aim for at least 300 words for better SEO performance',
          score: -10,
          applied: false
        });
      }
      
      // Check keyword density for main keyword
      if (keywordDensity[mainKeyword] < 0.01) {
        improvements.push({
          id: uuid(),
          type: 'keyword-density',
          description: 'Main keyword density is too low',
          recommendation: `Increase the usage of "${mainKeyword}" in your content`,
          score: -5,
          applied: false
        });
      } else if (keywordDensity[mainKeyword] > 0.05) {
        improvements.push({
          id: uuid(),
          type: 'keyword-stuffing',
          description: 'Possible keyword stuffing detected',
          recommendation: `Reduce the frequency of "${mainKeyword}" to avoid keyword stuffing`,
          score: -8,
          applied: false
        });
      }
      
      // Generate an overall SEO score (simple algorithm)
      const baseScore = 70;
      let seoScore = baseScore;
      
      // Adjust score based on improvements
      improvements.forEach(improvement => {
        seoScore += improvement.score;
      });
      
      // Ensure score is within bounds
      seoScore = Math.max(0, Math.min(100, seoScore));
      
      // Update state with analysis results
      dispatch({ type: 'SET_SEO_SCORE', payload: seoScore });
      
      // Add all improvements
      improvements.forEach(improvement => {
        dispatch({ type: 'ADD_SEO_IMPROVEMENT', payload: improvement });
      });
      
      // Mark the step as analyzed
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
      
      toast.success('Content analysis complete');
      return seoScore;
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to calculate keyword density
  const calculateKeywordDensity = (text: string, keywords: string[]): Record<string, number> => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    
    const result: Record<string, number> = {};
    
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const matches = words.filter(word => word === keywordLower).length;
      result[keyword] = totalWords > 0 ? matches / totalWords : 0;
    });
    
    return result;
  };
  
  return {
    isAnalyzing,
    analyzeSeo,
    isAnalyzed
  };
};
