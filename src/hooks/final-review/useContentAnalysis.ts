
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

  return {
    isAnalyzing: isAnalyzing || state.isAnalyzingContent,
    analyzeContent,
    analysisStatus: getAnalysisStatus(),
    analytics: state.comprehensiveAnalytics
  };
};
