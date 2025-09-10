
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { toast } from 'sonner';

export function useContentAnalysis() {
  const { state } = useContentBuilder();
  const { isEnabled, hasProviders, activeProviders, refreshStatus } = useAIServiceStatus();
  const [contentSuggestions, setContentSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContentQuality = useCallback(async (content: string) => {
    if (!content || content.length < 100) {
      toast.error('Content too short for analysis');
      return [];
    }

    // Check AI service status before proceeding
    if (!isEnabled) {
      toast.error('AI service is disabled. Please enable it in Settings to use content analysis.');
      return [];
    }

    if (!hasProviders) {
      toast.error('No AI providers configured. Please add at least one API key in Settings.');
      return [];
    }

    // Refresh provider status to ensure we have current information
    await refreshStatus();
    
    if (activeProviders === 0) {
      toast.error(`No AI providers are currently working. Please check your API keys in Settings.`);
      return [];
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this content and provide specific optimization suggestions with detailed reasoning:

CONTENT TO ANALYZE:
${content}

CONTEXT:
- Main Keyword: ${state.mainKeyword || 'Not specified'}
- Selected Keywords: ${state.selectedKeywords?.join(', ') || 'None'}
- Content Length: ${content.length} characters
- Word Count: ${content.split(' ').length} words

ANALYSIS INSTRUCTIONS:
- Focus on readability, engagement, and SEO optimization
- Provide specific, actionable suggestions with clear reasoning
- Include difficulty estimation (easy/medium/hard to implement)
- Prioritize suggestions by potential impact
- Consider keyword usage, content structure, and user engagement

Respond in JSON format:
{
  "suggestions": [
    {
      "id": "unique_id_here",
      "title": "Clear, action-oriented title",
      "description": "Detailed explanation of what needs to be changed and why",
      "reasoning": "Why this change will improve the content (SEO, readability, engagement)",
      "type": "content",
      "priority": "high|medium|low",
      "category": "structure|seo|keywords|solution|content",
      "autoFixable": true|false,
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "example": "Brief example of the improvement if applicable"
    }
  ]
}

Provide 3-8 specific, actionable suggestions.`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.3,
        max_tokens: 2000
      });

      if (response?.content) {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const suggestions = parsed.suggestions?.map((s: any, index: number) => ({
            id: s.id || `content_${index}`,
            title: s.title || 'Content Improvement',
            description: s.description || 'Improve content quality',
            type: 'content' as const,
            priority: s.priority || 'medium',
            category: s.category || 'content',
            autoFixable: s.autoFixable !== false,
            impact: s.impact || 'medium',
            effort: s.effort || 'medium',
            reasoning: s.reasoning || '',
            example: s.example || ''
          })) || [];
          setContentSuggestions(suggestions);
          return suggestions;
        }
      }
      return [];
    } catch (error: any) {
      console.error('Error analyzing content quality:', error);
      
      // Provide more specific error messages based on error type
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        toast.error('AI provider quota exceeded. Please check your usage limits or try again later.');
      } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        toast.error('AI provider authentication failed. Please check your API keys in Settings.');
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        toast.error('Connection error. Please check your internet connection and try again.');
      } else {
        toast.error(`Failed to analyze content: ${error.message || 'Unknown error'}`);
      }
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.mainKeyword, state.selectedKeywords, isEnabled, hasProviders, activeProviders, refreshStatus]);

  return {
    contentSuggestions,
    isAnalyzing,
    analyzeContentQuality,
    setContentSuggestions
  };
}
