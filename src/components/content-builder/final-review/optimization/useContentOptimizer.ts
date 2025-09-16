import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OptimizationSuggestion } from './types';
import { 
  useContentAnalysis, 
  useAIDetection, 
  useContentOptimization
} from './hooks';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { toast } from 'sonner';

export const useContentOptimizer = (content: string) => {
  const { state } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [analysisAbortController, setAnalysisAbortController] = useState<AbortController | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Use focused hooks for content-specific analysis only
  const { contentSuggestions, analyzeContentQuality, isAnalyzing: isContentAnalyzing } = useContentAnalysis();
  const { aiDetectionSuggestions, analyzeAIContent } = useAIDetection();
  const { qualitySuggestions } = useContentQualityIntegration();
  const { optimizeContent: performOptimization } = useContentOptimization();

  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 50) {
      setAnalysisError('Content is too short for analysis. Please provide at least 50 characters.');
      toast.error('Content is too short for analysis');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    
    const abortController = new AbortController();
    setAnalysisAbortController(abortController);
    
    try {
      // Run focused content analyses in parallel
      const [contentResults, aiResults] = await Promise.allSettled([
        analyzeContentQuality(content),
        analyzeAIContent(content)
      ]);

      // Handle any failures gracefully
      if (contentResults.status === 'rejected') {
        console.error('Content analysis failed:', contentResults.reason);
      }
      if (aiResults.status === 'rejected') {
        console.error('AI detection failed:', aiResults.reason);
      }

      toast.success('Content analysis complete!');
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setAnalysisError(error?.message || 'Analysis failed');
      toast.error('Analysis failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
      setAnalysisAbortController(null);
    }
  }, [content, analyzeContentQuality, analyzeAIContent, isOptimizing]);

  const optimizeContent = useCallback(async (): Promise<string | null> => {
    if (isOptimizing || selectedSuggestions.length === 0) return null;
    
    setIsOptimizing(true);
    try {
      // Filter suggestions for content quality and AI humanization only
      const contentSuggestionsFiltered = contentSuggestions
        .filter(s => selectedSuggestions.includes(s.id))
        .filter(s => ['content', 'seo', 'structure', 'keywords'].includes(s.category || ''));
      
      const aiSuggestionsFiltered = aiDetectionSuggestions
        .filter(s => selectedSuggestions.includes(s.id));

      if (contentSuggestionsFiltered.length === 0 && aiSuggestionsFiltered.length === 0) {
        toast.error('No valid suggestions selected for optimization');
        return null;
      }

      return await performOptimization(
        content,
        selectedSuggestions.map(id => 
          [...contentSuggestionsFiltered, ...aiSuggestionsFiltered].find(s => s.id === id)?.id || id
        ),
        contentSuggestionsFiltered,
        aiSuggestionsFiltered,
        [],
        []
      );
    } catch (error: any) {
      console.error('Optimization failed:', error);
      toast.error('Optimization failed: ' + (error?.message || 'Unknown error'));
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing, selectedSuggestions, contentSuggestions, aiDetectionSuggestions, performOptimization, content]);

  const clearAnalysis = useCallback(() => {
    // Cancel any ongoing analysis
    if (analysisAbortController) {
      analysisAbortController.abort();
      setAnalysisAbortController(null);
    }
    
    // Clear state
    setSelectedSuggestions([]);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setIsOptimizing(false);
  }, [analysisAbortController]);

  return {
    // State
    isAnalyzing,
    isOptimizing,
    analysisError,
    
    // Focused suggestions only
    contentSuggestions,
    aiDetectionSuggestions,
    
    // Actions
    analyzeContent,
    optimizeContent,
    
    // Selection management
    selectedSuggestions,
    toggleSuggestion: (suggestionId: string) => {
      setSelectedSuggestions(prev => 
        prev.includes(suggestionId) 
          ? prev.filter(id => id !== suggestionId)
          : [...prev, suggestionId]
      );
    },
    
    // Utilities
    getTotalSuggestionCount: () => 
      contentSuggestions.length + 
      aiDetectionSuggestions.length,
    clearAnalysis
  };
};