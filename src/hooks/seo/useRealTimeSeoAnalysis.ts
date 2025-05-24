
import { useState, useEffect, useCallback } from 'react';
import { realTimeSeoEngine, SeoAnalysisResult } from '@/services/seo/realTimeSeoEngine';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const useRealTimeSeoAnalysis = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;
  
  const [analysisResult, setAnalysisResult] = useState<SeoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Set up the callback for analysis results
  useEffect(() => {
    realTimeSeoEngine.setCallback((result: SeoAnalysisResult) => {
      setAnalysisResult(result);
      setIsAnalyzing(false);
    });
  }, []);

  // Trigger analysis when content or keywords change
  useEffect(() => {
    if (content && mainKeyword && content.length > 50) {
      setIsAnalyzing(true);
      realTimeSeoEngine.analyze(content, mainKeyword, selectedKeywords);
    }
  }, [content, mainKeyword, selectedKeywords]);

  const manualAnalyze = useCallback(() => {
    if (content && mainKeyword) {
      setIsAnalyzing(true);
      realTimeSeoEngine.analyze(content, mainKeyword, selectedKeywords);
    }
  }, [content, mainKeyword, selectedKeywords]);

  return {
    analysisResult,
    isAnalyzing,
    manualAnalyze,
    hasValidData: !!(content && mainKeyword && analysisResult)
  };
};
