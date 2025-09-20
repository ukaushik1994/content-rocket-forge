
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SuggestionGenerator } from '@/services/ai/suggestionGenerator';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { toast } from 'sonner';

export function useContentAnalysis() {
  const { state } = useContentBuilder();
  const { isEnabled, hasProviders, activeProviders, refreshStatus } = useAIServiceStatus();
  const [contentSuggestions, setContentSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContentQuality = useCallback(async (content: string) => {
    try {
      if (!content || content.trim().length < 50) {
        console.warn('⚠️ Content too short for analysis:', content.length);
        toast.error('Content must be at least 50 characters long for analysis');
        return [];
      }

      console.log('🔄 Starting enhanced content quality analysis...');
      setIsAnalyzing(true);

      // Create context for suggestion generation
      const context = {
        mainKeyword: state.mainKeyword,
        selectedKeywords: state.selectedKeywords || [],
        contentLength: content.length,
        wordCount: content.split(' ').length,
        contentType: state.contentType || 'article',
        targetGoal: 'optimization'
      };

      // Use the enhanced suggestion generator
      const suggestionGenerator = SuggestionGenerator.getInstance();
      const structuredSuggestions = await suggestionGenerator.generateSuggestions(content, context, {
        maxSuggestions: 8,
        includeReplacements: true,
        confidenceThreshold: 'medium'
      });

      // Convert structured suggestions to OptimizationSuggestion format
      const optimizationSuggestions: OptimizationSuggestion[] = structuredSuggestions.map(suggestion => ({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        type: suggestion.type === 'seo' || suggestion.type === 'keywords' ? 'content' : 
              suggestion.type === 'structure' ? 'content' :
              suggestion.type === 'readability' ? 'content' : 'content',
        priority: suggestion.priority,
        category: suggestion.category,
        autoFixable: suggestion.autoFixable,
        impact: suggestion.impact,
        effort: suggestion.effort,
        reasoning: suggestion.reasoning,
        example: suggestion.example
      }));

      console.log(`✅ Enhanced content analysis complete: ${optimizationSuggestions.length} suggestions generated`);
      setContentSuggestions(optimizationSuggestions);
      return optimizationSuggestions;

    } catch (error: any) {
      console.error('❌ Enhanced content analysis failed:', error);
      setContentSuggestions([]);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.mainKeyword, state.selectedKeywords, state.contentType, isEnabled, hasProviders, activeProviders, refreshStatus]);

  return {
    contentSuggestions,
    isAnalyzing,
    analyzeContentQuality,
    setContentSuggestions
  };
}
