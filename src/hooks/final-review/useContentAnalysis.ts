
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

export const useContentAnalysis = () => {
  const { state, runComprehensiveAnalysis } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = useCallback(async () => {
    if (!state.content || state.content.trim().length === 0) {
      toast.error('No content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      await runComprehensiveAnalysis();
      toast.success('Content analysis completed');
    } catch (error) {
      console.error('Content analysis failed:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.content, runComprehensiveAnalysis]);

  const getAnalysisStatus = () => {
    if (!state.content || state.content.trim().length === 0) {
      return 'no-content';
    }
    
    if (!state.comprehensiveAnalytics) {
      return 'not-analyzed';
    }

    const currentHash = state.lastAnalysisHash;
    const contentHash = state.comprehensiveAnalytics.contentHash;
    
    if (currentHash !== contentHash) {
      return 'outdated';
    }

    return 'up-to-date';
  };

  // Calculate keyword usage from content and selected keywords
  const keywordUsage = state.selectedKeywords.map(keyword => {
    const content = state.content || '';
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const wordCount = content.split(/\s+/).length;
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    
    return {
      keyword,
      count: keywordCount,
      density: Math.round(density * 100) / 100,
      status: density >= 0.5 && density <= 2.5 ? 'good' : density > 2.5 ? 'high' : 'low'
    };
  });

  // Analyze CTA information from content
  const ctaInfo = {
    hasCallToAction: /\b(learn more|sign up|get started|contact us|download|subscribe|buy now|click here)\b/i.test(state.content || ''),
    ctaCount: (state.content || '').match(/\b(learn more|sign up|get started|contact us|download|subscribe|buy now|click here)\b/gi)?.length || 0,
    position: 'end' as const // Simplified for now
  };

  return {
    isAnalyzing: isAnalyzing || state.isAnalyzingContent,
    analyzeContent,
    analysisStatus: getAnalysisStatus(),
    analytics: state.comprehensiveAnalytics,
    keywordUsage,
    ctaInfo
  };
};
