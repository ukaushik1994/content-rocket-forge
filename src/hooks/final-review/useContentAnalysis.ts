
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { KeywordUsage } from '@/hooks/seo-analysis/types';
import { detectCTAs } from '@/utils/seo/content/detectCTAs';

export const useContentAnalysis = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  const [keywordUsage, setKeywordUsage] = useState<KeywordUsage[]>([]);
  const [formattedKeywordUsage, setFormattedKeywordUsage] = useState({
    mainKeyword: {
      count: 0,
      density: 0
    },
    relatedKeywords: [] as { keyword: string; count: number }[]
  });
  
  const [ctaInfo, setCTAInfo] = useState({
    hasCTA: false,
    ctaCount: 0,
    ctaPositioning: 'none' as 'none' | 'beginning' | 'middle' | 'end' | 'multiple'
  });
  
  useEffect(() => {
    if (!content) return;
    
    // Simple content analysis for keyword usage
    const wordCount = content.split(/\s+/).length;
    const mainKeywordRegex = new RegExp(mainKeyword, 'gi');
    const mainKeywordMatches = content.match(mainKeywordRegex) || [];
    const mainKeywordCount = mainKeywordMatches.length;
    const mainKeywordDensity = (mainKeywordCount / wordCount) * 100;
    
    // Create main keyword data
    const mainKeywordData: KeywordUsage = {
      keyword: mainKeyword,
      count: mainKeywordCount,
      density: mainKeywordDensity.toFixed(2),
      isPrimary: true,
      isOptimalDensity: mainKeywordDensity >= 0.5 && mainKeywordDensity <= 2.5
    };
    
    // Create related keywords data
    const relatedKeywordsData: KeywordUsage[] = selectedKeywords.map(keyword => {
      const keywordRegex = new RegExp(keyword, 'gi');
      const keywordMatches = content.match(keywordRegex) || [];
      const keywordCount = keywordMatches.length;
      const keywordDensity = (keywordCount / wordCount) * 100;
      
      return {
        keyword,
        count: keywordCount,
        density: keywordDensity.toFixed(2),
        isPrimary: false,
        isOptimalDensity: keywordDensity > 0 && keywordDensity <= 1.5
      };
    });
    
    // Set raw keyword data array
    const allKeywords = [mainKeywordData, ...relatedKeywordsData];
    setKeywordUsage(allKeywords);
    
    // Format for the component that expects a specific structure
    setFormattedKeywordUsage({
      mainKeyword: {
        count: mainKeywordCount,
        density: mainKeywordDensity
      },
      relatedKeywords: selectedKeywords.map(keyword => {
        const kw = allKeywords.find(k => k.keyword === keyword);
        return {
          keyword,
          count: kw?.count || 0
        };
      })
    });
    
    // Detect CTAs
    const ctaResult = detectCTAs(content);
    setCTAInfo({
      hasCTA: ctaResult.hasCTA,
      ctaCount: ctaResult.ctaCount,
      ctaPositioning: ctaResult.ctaPositioning
    });
  }, [content, mainKeyword, selectedKeywords]);
  
  return {
    keywordUsage: formattedKeywordUsage,
    rawKeywordData: keywordUsage,
    ctaInfo
  };
};
