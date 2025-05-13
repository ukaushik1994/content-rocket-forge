
import { useCallback, useRef } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { KeywordUsage } from './types';
import { getScoreColor } from './utils';

// Constants for analysis scoring
const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 50,
  POOR: 30
};

// Mock SEO analysis function that could be replaced with a real API call
const mockAnalyze = async (content: string, mainKeyword: string, secondaryKeywords: string[]) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Generate mock analysis results
  const mainCount = (content.match(new RegExp(mainKeyword, 'gi')) || []).length;
  const contentLength = content.length;
  const score = Math.min(
    85,
    Math.round(
      40 + 
      (mainCount > 3 ? 15 : mainCount * 5) + 
      (contentLength > 3000 ? 30 : contentLength / 100)
    )
  );
  
  // Generate keyword usage
  const keywordUsage = [
    {
      keyword: mainKeyword,
      count: mainCount,
      density: `${((mainCount * mainKeyword.length) / contentLength * 100).toFixed(1)}%`
    },
    ...secondaryKeywords.map(kw => {
      const count = (content.match(new RegExp(kw, 'gi')) || []).length;
      return {
        keyword: kw,
        count,
        density: `${((count * kw.length) / contentLength * 100).toFixed(1)}%`
      };
    })
  ];
  
  // Generate mock recommendations
  const recommendations = [];
  
  if (mainCount < 3) {
    recommendations.push(`Use your main keyword "${mainKeyword}" more frequently in the content.`);
  }
  
  if (contentLength < 1500) {
    recommendations.push('Consider creating longer content to enhance depth and value.');
  }
  
  if (contentLength > 0 && !content.includes('<h2>') && !content.includes('<h3>')) {
    recommendations.push('Add more headings to structure your content better.');
  }
  
  // Add generic recommendations to flesh out the list
  recommendations.push('Ensure proper internal linking to related content.');
  recommendations.push('Add relevant external links to authoritative sources.');
  
  // Generate improvements
  const improvements = [
    {
      id: 'seo-1',
      type: 'keyword',
      title: 'Optimize keyword usage',
      description: `Aim for a keyword density of 1-2% for "${mainKeyword}"`,
      impact: 'high',
      applied: false
    },
    {
      id: 'seo-2',
      type: 'headings',
      title: 'Improve content structure',
      description: 'Use H2 and H3 headings to organize your content',
      impact: 'medium',
      applied: false
    },
    {
      id: 'seo-3',
      type: 'content',
      title: 'Enhance content depth',
      description: 'Add more detailed information to key sections',
      impact: 'high',
      applied: false
    }
  ];
  
  return {
    score,
    keywordUsage,
    recommendations,
    improvements,
    keywordScore: mainCount > 3 ? 85 : mainCount * 20,
    contentScore: contentLength > 2000 ? 90 : contentLength / 20,
    readabilityScore: 75 // Mock score
  };
};

export const useAnalysisOperation = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const abortAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  const cleanup = useCallback(() => {
    abortAnalysis();
  }, [abortAnalysis]);
  
  const runAnalysis = useCallback(
    async (
      setIsAnalyzing: (val: boolean) => void,
      setKeywordUsage: (usage: KeywordUsage[]) => void,
      setRecommendations: (recs: string[]) => void,
      setScores: (scores: any) => void,
      setImprovements: (imps: any[]) => void,
      setAnalysisError: (err: string | null) => void
    ) => {
      if (!content || !mainKeyword) {
        toast.error('Need content and main keyword to run analysis');
        return;
      }
      
      // Ensure any previous analysis is aborted
      abortAnalysis();
      
      // Create a new abort controller for this operation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      try {
        // Run analysis with abort signal
        const results = await mockAnalyze(
          content,
          mainKeyword,
          selectedKeywords.filter(kw => kw !== mainKeyword)
        );
        
        // Check if operation was aborted
        if (signal.aborted) {
          return;
        }
        
        // Update UI with results
        setKeywordUsage(results.keywordUsage);
        setRecommendations(results.recommendations);
        setScores({
          keywordUsage: results.keywordScore,
          contentLength: results.contentScore,
          readability: results.readabilityScore
        });
        setImprovements(results.improvements);
        
        // Update global state
        dispatch({ 
          type: 'ADD_SEO_IMPROVEMENT', 
          payload: results.improvements 
        });
        
        dispatch({
          type: 'UPDATE_SEO_SCORE',
          payload: results.score
        });
        
        // Show completion toast
        const scoreColor = getScoreColor(results.score);
        toast.success(
          <div className="flex items-center gap-2">
            <span>Analysis complete: </span>
            <span className={`font-semibold ${scoreColor}`}>
              Score: {results.score}/100
            </span>
          </div>,
          { id: 'seo-analysis' }
        );
        
      } catch (error) {
        if (!signal.aborted) {
          console.error('SEO analysis error:', error);
          setAnalysisError('An error occurred during analysis');
          toast.error('Analysis failed', { id: 'seo-analysis' });
        }
      } finally {
        if (!signal.aborted) {
          setIsAnalyzing(false);
        }
      }
    },
    [content, mainKeyword, selectedKeywords, dispatch, abortAnalysis]
  );
  
  return {
    runAnalysis,
    abortAnalysis,
    cleanup
  };
};
