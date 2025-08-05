
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OptimizationSuggestion } from './types';
import { 
  useContentAnalysis, 
  useAIDetection, 
  useSerpIntegration, 
  useSolutionAnalysis,
  useContentOptimization
} from './hooks';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { toast } from 'sonner';

export const useContentOptimizer = (content: string) => {
  const { state } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Use the real hooks for analysis
  const { contentSuggestions, analyzeContentQuality, isAnalyzing: isContentAnalyzing } = useContentAnalysis();
  const { aiDetectionSuggestions, analyzeAIContent } = useAIDetection();
  const { serpIntegrationSuggestions, analyzeSerpUsage, incorporateAllSerpItems } = useSerpIntegration();
  const { solutionSuggestions, analyzeSolution } = useSolutionAnalysis();
  const { qualitySuggestions } = useContentQualityIntegration();
  const { optimizeContent: performOptimization } = useContentOptimization();

  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 50) {
      setAnalysisError('Content is too short for analysis. Please provide at least 50 characters.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Run all analysis in parallel for better performance
      const analysisPromises = [
        analyzeContentQuality(content).catch(err => {
          console.error('Content quality analysis failed:', err);
          return [];
        }),
        analyzeAIContent(content).catch(err => {
          console.error('AI detection analysis failed:', err);
          return [];
        }),
        analyzeSerpUsage(content).catch(err => {
          console.error('SERP integration analysis failed:', err);
          return [];
        }),
        analyzeSolution(content).catch(err => {
          console.error('Solution analysis failed:', err);
          return [];
        })
      ];

      await Promise.all(analysisPromises);
      
      // Check if we have any suggestions
      const totalSuggestions = 
        contentSuggestions.length + 
        aiDetectionSuggestions.length + 
        serpIntegrationSuggestions.length + 
        solutionSuggestions.length +
        qualitySuggestions.length;

      if (totalSuggestions === 0) {
        toast.info('Content analysis complete. No optimization suggestions found - your content looks great!');
      } else {
        toast.success(`Analysis complete! Found ${totalSuggestions} optimization opportunities.`);
      }

    } catch (error) {
      console.error('Error analyzing content:', error);
      setAnalysisError('Failed to analyze content. Please try again.');
      toast.error('Analysis failed. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, analyzeContentQuality, analyzeAIContent, analyzeSerpUsage, analyzeSolution, contentSuggestions.length, aiDetectionSuggestions.length, serpIntegrationSuggestions.length, solutionSuggestions.length, qualitySuggestions.length]);

  const optimizeContent = useCallback(async (): Promise<string | null> => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion to optimize.');
      return null;
    }
    
    setIsOptimizing(true);
    
    try {
      // Get selected suggestions from all categories
      const allSuggestions = [
        ...contentSuggestions,
        ...aiDetectionSuggestions,
        ...serpIntegrationSuggestions,
        ...solutionSuggestions,
        ...qualitySuggestions
      ];

      const selected = allSuggestions.filter(s => selectedSuggestions.includes(s.id));
      
      if (selected.length === 0) {
        toast.error('Selected suggestions not found.');
        return null;
      }

      // Use the real optimization service with correct parameters
      const optimizedContent = await performOptimization(
        content,
        selectedSuggestions,
        contentSuggestions,
        aiDetectionSuggestions,
        serpIntegrationSuggestions,
        solutionSuggestions
      );
      
      if (optimizedContent) {
        toast.success(`Content optimized using ${selected.length} suggestions!`);
        return optimizedContent;
      } else {
        toast.error('Optimization failed. Please try again.');
        return null;
      }
      
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Optimization failed. Please check your connection and try again.');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [content, selectedSuggestions, contentSuggestions, aiDetectionSuggestions, serpIntegrationSuggestions, solutionSuggestions, qualitySuggestions, performOptimization]);

  const toggleSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  const incorporateAllSerpItemsLocal = useCallback(() => {
    const serpSuggestionIds = serpIntegrationSuggestions.map(s => s.id);
    setSelectedSuggestions(prev => [...new Set([...prev, ...serpSuggestionIds])]);
    // Also trigger the hook's incorporate function
    incorporateAllSerpItems();
    toast.info(`Selected ${serpSuggestionIds.length} SERP integration suggestions.`);
  }, [serpIntegrationSuggestions, incorporateAllSerpItems]);

  // Get total suggestion count for UI
  const getTotalSuggestionCount = useCallback(() => {
    return contentSuggestions.length + 
           aiDetectionSuggestions.length + 
           serpIntegrationSuggestions.length + 
           solutionSuggestions.length +
           qualitySuggestions.length;
  }, [contentSuggestions.length, aiDetectionSuggestions.length, serpIntegrationSuggestions.length, solutionSuggestions.length, qualitySuggestions.length]);

  return {
    isAnalyzing: isAnalyzing || isContentAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    qualitySuggestions,
    selectedSuggestions,
    analysisError,
    analyzeContent,
    optimizeContent,
    toggleSuggestion,
    incorporateAllSerpItems: incorporateAllSerpItemsLocal,
    getTotalSuggestionCount
  };
};
