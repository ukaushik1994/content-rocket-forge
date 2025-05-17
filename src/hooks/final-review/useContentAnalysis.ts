
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { detectCTAs } from '@/utils/seo/content/detectCTAs';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { KeywordUsage } from '@/hooks/seo-analysis/types';

/**
 * Custom hook for analyzing content
 */
export const useContentAnalysis = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  const [keywordUsage, setKeywordUsage] = useState<KeywordUsage[]>([]);
  const [ctaInfo, setCTAInfo] = useState<{ hasCTA: boolean; ctaText: string[] }>({ hasCTA: false, ctaText: [] });
  
  // Analyze content when it changes
  useEffect(() => {
    if (content) {
      // Analyze keyword usage
      const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
      setKeywordUsage(usage);
      
      // Detect CTAs
      const cta = detectCTAs(content);
      setCTAInfo(cta);
    }
  }, [content, mainKeyword, selectedKeywords]);

  return {
    keywordUsage,
    ctaInfo
  };
};
