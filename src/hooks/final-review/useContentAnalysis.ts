
import { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { detectCTAs } from '@/utils/seo/content/detectCTAs';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { validateKeywordUsage } from '@/utils/validation/dataValidation';

/**
 * Custom hook for analyzing content with proper error handling
 */
export const useContentAnalysis = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [ctaInfo, setCTAInfo] = useState<{ hasCTA: boolean; ctaText: string[] }>({ hasCTA: false, ctaText: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const analyzeContent = useCallback(async () => {
    if (!content || content.trim().length === 0) {
      setKeywordUsage([]);
      setCTAInfo({ hasCTA: false, ctaText: [] });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Analyze keyword usage
      let usage: any[] = [];
      if (mainKeyword || (selectedKeywords && selectedKeywords.length > 0)) {
        usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
        
        // Validate the usage data
        const validation = validateKeywordUsage(usage);
        if (!validation.isValid) {
          console.warn('Keyword usage validation failed:', validation.errors);
          // Filter out invalid entries
          usage = usage.filter(u => u && u.keyword && typeof u.keyword === 'string');
        }
      }
      setKeywordUsage(usage);
      
      // Detect CTAs
      const cta = detectCTAs(content);
      setCTAInfo(cta || { hasCTA: false, ctaText: [] });
      
    } catch (error) {
      console.error('Content analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      setKeywordUsage([]);
      setCTAInfo({ hasCTA: false, ctaText: [] });
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, mainKeyword, selectedKeywords]);
  
  // Analyze content when it changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      analyzeContent();
    }, 500); // Debounce analysis to avoid excessive calls
    
    return () => clearTimeout(debounceTimer);
  }, [analyzeContent]);

  const retryAnalysis = useCallback(() => {
    analyzeContent();
  }, [analyzeContent]);

  return {
    keywordUsage,
    ctaInfo,
    isAnalyzing,
    analysisError,
    retryAnalysis
  };
};
