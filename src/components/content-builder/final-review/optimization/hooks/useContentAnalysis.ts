
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';
import { toast } from 'sonner';

export function useContentAnalysis() {
  const { state } = useContentBuilder();
  const [contentSuggestions, setContentSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContentQuality = useCallback(async (content: string) => {
    if (!content || content.length < 100) {
      toast.error('Content too short for analysis');
      return [];
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this content and provide optimization suggestions:

CONTENT:
${content}

MAIN KEYWORD: ${state.mainKeyword || 'Not specified'}
SELECTED KEYWORDS: ${state.selectedKeywords?.join(', ') || 'None'}

Provide 3-5 specific, actionable suggestions to improve content quality, SEO, and engagement.

Respond in JSON format:
{
  "suggestions": [
    {
      "id": "unique_id",
      "title": "Suggestion Title",
      "description": "Detailed description of what to improve",
      "type": "content",
      "priority": "high|medium|low"
    }
  ]
}`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.7,
        max_tokens: 1000
      });

      if (response?.content) {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          const suggestions = result.suggestions?.map((s: any) => ({
            ...s,
            type: 'content'
          })) || [];
          setContentSuggestions(suggestions);
          return suggestions;
        }
      }
      return [];
    } catch (error) {
      console.error('Error analyzing content quality:', error);
      toast.error('Failed to analyze content quality');
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.mainKeyword, state.selectedKeywords]);

  return {
    contentSuggestions,
    isAnalyzing,
    analyzeContentQuality,
    setContentSuggestions
  };
}
