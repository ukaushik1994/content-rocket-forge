
import { useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { 
  ComprehensiveOptimization,
  OptimizationRecommendation,
  analyzeComprehensiveOptimization,
  applyComprehensiveOptimization
} from '@/services/enhancedAutoOptimizerService';
import { toast } from 'sonner';

export const useEnhancedContentOptimizer = (content: string) => {
  const { state } = useContentBuilder();
  const { serpSelections } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<ComprehensiveOptimization | null>(null);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);

  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 100) {
      toast.error('Content too short for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeComprehensiveOptimization(content, serpSelections);
      setOptimization(result);
      
      // Auto-select high-impact recommendations
      const autoSelected = result.recommendations
        .filter(r => r.selected)
        .map(r => r.id);
      setSelectedRecommendations(autoSelected);
      
      toast.success('Content analysis completed');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, serpSelections]);

  const optimizeContent = useCallback(async (): Promise<string | null> => {
    if (!optimization || selectedRecommendations.length === 0) {
      toast.error('No optimizations selected');
      return null;
    }

    setIsOptimizing(true);
    try {
      const selectedRecs = optimization.recommendations.filter(r => 
        selectedRecommendations.includes(r.id)
      );

      const optimizedContent = await applyComprehensiveOptimization(
        content,
        selectedRecs,
        optimization.humanizationAnalysis,
        optimization.serpAnalysis
      );

      if (optimizedContent) {
        toast.success('Content optimized successfully');
        return optimizedContent;
      } else {
        toast.error('Optimization failed');
        return null;
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed. Please try again.');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [content, optimization, selectedRecommendations]);

  const toggleRecommendation = useCallback((id: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(id) 
        ? prev.filter(recId => recId !== id)
        : [...prev, id]
    );
  }, []);

  return {
    isAnalyzing,
    isOptimizing,
    optimization,
    selectedRecommendations,
    analyzeContent,
    optimizeContent,
    toggleRecommendation
  };
};
