
import { useState, useEffect, useCallback } from 'react';
import { keywordIntelligenceEngine, KeywordIntelligenceResult } from '@/services/seo/keywordIntelligenceEngine';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const useKeywordIntelligence = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, metaTitle, metaDescription } = state;
  
  const [intelligenceResult, setIntelligenceResult] = useState<KeywordIntelligenceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Set up the callback for analysis results
  useEffect(() => {
    keywordIntelligenceEngine.setCallback((result: KeywordIntelligenceResult) => {
      setIntelligenceResult(result);
      setIsAnalyzing(false);
    });
  }, []);

  // Trigger analysis when content or keywords change
  useEffect(() => {
    if (content && mainKeyword && content.length > 100) {
      setIsAnalyzing(true);
      
      const metaData = {
        title: metaTitle,
        metaDescription: metaDescription
      };
      
      keywordIntelligenceEngine.analyze(content, mainKeyword, selectedKeywords, metaData);
    }
  }, [content, mainKeyword, selectedKeywords, metaTitle, metaDescription]);

  const manualAnalyze = useCallback(() => {
    if (content && mainKeyword) {
      setIsAnalyzing(true);
      
      const metaData = {
        title: metaTitle,
        metaDescription: metaDescription
      };
      
      keywordIntelligenceEngine.analyze(content, mainKeyword, selectedKeywords, metaData);
    }
  }, [content, mainKeyword, selectedKeywords, metaTitle, metaDescription]);

  return {
    intelligenceResult,
    isAnalyzing,
    manualAnalyze,
    hasValidData: !!(content && mainKeyword && intelligenceResult)
  };
};
