
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useContentAnalysis } from './hooks/useContentAnalysis';
import { useAIDetection } from './hooks/useAIDetection';
import { useSerpIntegration } from './hooks/useSerpIntegration';
import { useSolutionAnalysis } from './hooks/useSolutionAnalysis';
import { useContentOptimization } from './hooks/useContentOptimization';

export function useContentOptimizer(content: string) {
  const [analyzedContent, setAnalyzedContent] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const { 
    contentSuggestions, 
    isAnalyzing: isAnalyzingContent, 
    analyzeContentQuality,
    setContentSuggestions
  } = useContentAnalysis();

  const { 
    aiDetectionSuggestions, 
    analyzeAIContent,
    setAiDetectionSuggestions
  } = useAIDetection();

  const { 
    serpIntegrationSuggestions, 
    analyzeSerpUsage: analyzeSerpUsageHook,
    setSerpIntegrationSuggestions,
    incorporateAllSerpItems: incorporateAllSerpItemsHook
  } = useSerpIntegration();

  const { 
    solutionSuggestions, 
    analyzedSolutionIntegration, 
    analyzeSolution,
    setSolutionSuggestions
  } = useSolutionAnalysis();

  const { isOptimizing, optimizeContent: optimizeContentHook } = useContentOptimization();

  const isAnalyzing = isAnalyzingContent;

  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 100) {
      toast.error('Content too short for analysis');
      return;
    }

    setContentSuggestions([]);
    setSolutionSuggestions([]);
    setAiDetectionSuggestions([]);
    setSerpIntegrationSuggestions([]);
    
    try {
      // Run all analyses in parallel
      const [contentSugs, aiSugs, serpSugs, solutionSugs] = await Promise.all([
        analyzeContentQuality(content),
        analyzeAIContent(content),
        analyzeSerpUsageHook(content),
        analyzeSolution(content)
      ]);

      // Pre-select high priority solution suggestions
      const highPrioritySolutionSuggestions = solutionSugs
        .filter(s => s.priority === 'high')
        .map(s => s.id);
      
      setSelectedSuggestions(prevSelected => [
        ...prevSelected,
        ...highPrioritySolutionSuggestions
      ]);
      
      setAnalyzedContent(content);
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    }
  }, [content, analyzeContentQuality, analyzeAIContent, analyzeSerpUsageHook, analyzeSolution]);

  const optimizeContent = useCallback(async () => {
    return await optimizeContentHook(
      content,
      selectedSuggestions,
      contentSuggestions,
      aiDetectionSuggestions,
      serpIntegrationSuggestions,
      solutionSuggestions
    );
  }, [
    content,
    selectedSuggestions,
    contentSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    solutionSuggestions,
    optimizeContentHook
  ]);

  const toggleSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  const incorporateAllSerpItems = useCallback(() => {
    const serpSuggestionIds = incorporateAllSerpItemsHook();
    setSelectedSuggestions(prev => {
      const newSelections = [...prev];
      serpSuggestionIds.forEach(id => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      return newSelections;
    });
    
    toast.success('All SERP integration suggestions selected');
  }, [incorporateAllSerpItemsHook]);

  return {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    analyzedContent,
    analyzedSolutionIntegration,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    incorporateAllSerpItems
  };
}
