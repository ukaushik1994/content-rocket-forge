
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
    try {
      if (!content || content.trim().length < 50) {
        console.warn('⚠️ Content too short for analysis:', content.length);
        toast.error('Content must be at least 50 characters long for analysis');
        return [];
      }

      console.log('🔄 Starting content quality analysis...');
      setIsAnalyzing(true);

      // Pre-flight check: Use AIServiceController's built-in validation
      console.log(`🔄 Using AIServiceController for content analysis...`);

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

      console.log('🤖 Making AI request for content analysis via AIServiceController...');
      
      // Use AIServiceController which has built-in error handling and fallback
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.3,
        max_tokens: 2000
      });

      if (!response || !response.content) {
        console.warn('❌ No content in AI response, returning empty suggestions');
        setContentSuggestions([]);
        return [];
      }

      // Parse the JSON response
      let parsedResponse;
      try {
        // Clean the response content to extract JSON
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed AI response with', parsedResponse.suggestions?.length || 0, 'suggestions');
        } else {
          console.warn('⚠️ No JSON found in response, attempting direct parse...');
          parsedResponse = JSON.parse(response.content.trim());
        }
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError);
        console.error('Raw content:', response.content);
        setContentSuggestions([]);
        return [];
      }

      if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
        console.error('❌ Invalid response structure:', parsedResponse);
        setContentSuggestions([]);
        return [];
      }

      const suggestions = parsedResponse.suggestions.map((s: any, index: number) => ({
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
      }));

      console.log(`✅ Content analysis complete: ${suggestions.length} suggestions generated`);
      setContentSuggestions(suggestions);
      return suggestions;

    } catch (error: any) {
      console.error('❌ Content analysis failed:', error);
      
      // AIServiceController handles error messages, so we just return empty array
      setContentSuggestions([]);
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
