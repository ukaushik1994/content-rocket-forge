
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { detectAIContent } from '@/services/aiContentDetectionService';

export function useAIDetection() {
  const [aiDetectionSuggestions, setAiDetectionSuggestions] = useState<OptimizationSuggestion[]>([]);

  const analyzeAIContent = useCallback(async (content: string) => {
    const aiDetection = await detectAIContent(content);
    if (aiDetection?.isAIWritten && aiDetection.humanizationSuggestions.length > 0) {
      const suggestions: OptimizationSuggestion[] = aiDetection.humanizationSuggestions.map((suggestion, index) => ({
        id: `ai_${index}`,
        title: 'Humanize AI Content',
        description: suggestion,
        type: 'humanization',
        priority: 'high',
        category: 'content',
        autoFixable: true
      }));
      setAiDetectionSuggestions(suggestions);
      return suggestions;
    }
    setAiDetectionSuggestions([]);
    return [];
  }, []);

  return {
    aiDetectionSuggestions,
    analyzeAIContent,
    setAiDetectionSuggestions
  };
}
