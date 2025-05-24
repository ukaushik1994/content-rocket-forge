
import { useState, useEffect, useCallback } from 'react';
import { advancedSeoContentGenerator, SeoContentRequest, SeoContentResult } from '@/services/seo/advancedContentGenerator';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const useAdvancedSeoGeneration = () => {
  const { state } = useContentBuilder();
  const { mainKeyword, serpData, selectedKeywords } = state;
  
  const [generationResult, setGenerationResult] = useState<SeoContentResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<'comprehensive' | 'faq' | 'listicle' | 'comparison' | 'guide'>('comprehensive');
  const [selectedIntent, setSelectedIntent] = useState<'informational' | 'commercial' | 'transactional' | 'navigational'>('informational');
  const [targetWordCount, setTargetWordCount] = useState(2000);

  // Set up the callback for generation results
  useEffect(() => {
    advancedSeoContentGenerator.setCallback((result: SeoContentResult) => {
      setGenerationResult(result);
      setIsGenerating(false);
    });
  }, []);

  const generateSeoContent = useCallback(async () => {
    if (!mainKeyword || !serpData) {
      console.log('Missing required data for SEO generation');
      return;
    }

    setIsGenerating(true);

    const request: SeoContentRequest = {
      mainKeyword,
      secondaryKeywords: selectedKeywords || [],
      serpData,
      contentType: selectedContentType,
      targetWordCount,
      userIntent: selectedIntent
    };

    await advancedSeoContentGenerator.generateSeoContent(request);
  }, [mainKeyword, serpData, selectedKeywords, selectedContentType, targetWordCount, selectedIntent]);

  return {
    generationResult,
    isGenerating,
    selectedContentType,
    setSelectedContentType,
    selectedIntent,
    setSelectedIntent,
    targetWordCount,
    setTargetWordCount,
    generateSeoContent,
    hasValidData: !!(mainKeyword && serpData)
  };
};
