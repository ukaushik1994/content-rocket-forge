
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { detectCTAs } from '@/utils/seo/content/detectCTAs';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';

/**
 * Custom hook for analyzing content
 */
export const useContentAnalysis = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [ctaInfo, setCTAInfo] = useState<{ hasCTA: boolean; ctaText: string[] }>({ hasCTA: false, ctaText: [] });
  
  // Analyze content function that can be called explicitly
  const analyzeContent = useCallback(
    async (
      contentToAnalyze?: string,
      keywordToAnalyze?: string,
      keywordsToAnalyze?: string[]
    ) => {
      // Use provided values or fall back to state values
      const finalContent = contentToAnalyze || content;
      const finalMainKeyword = keywordToAnalyze || mainKeyword;
      const finalSelectedKeywords = keywordsToAnalyze || selectedKeywords;
      
      if (finalContent) {
        // Analyze keyword usage
        const usage = calculateKeywordUsage(finalContent, finalMainKeyword, finalSelectedKeywords || []);
        setKeywordUsage(usage);
        
        // Detect CTAs
        const cta = detectCTAs(finalContent);
        setCTAInfo(cta);
        
        return {
          keywordUsage: usage,
          ctaInfo: cta
        };
      }
      
      return {
        keywordUsage,
        ctaInfo
      };
    },
    [content, mainKeyword, selectedKeywords]
  );
  
  // Analyze content when it changes
  useCallback(() => {
    if (content) {
      analyzeContent();
    }
  }, [content, mainKeyword, selectedKeywords, analyzeContent]);

  return {
    keywordUsage,
    ctaInfo,
    analyzeContent
  };
};
