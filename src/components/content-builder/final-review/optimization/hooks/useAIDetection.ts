
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import AIServiceController from '@/services/aiService/AIServiceController';

export function useAIDetection() {
  const [aiDetectionSuggestions, setAiDetectionSuggestions] = useState<OptimizationSuggestion[]>([]);

  const analyzeAIContent = useCallback(async (content: string) => {
    try {
      console.log('🤖 Starting AI detection analysis via AIServiceController...');
      
      const prompt = `Analyze this content to determine if it was written by AI and provide humanization suggestions:

CONTENT TO ANALYZE:
${content}

ANALYSIS INSTRUCTIONS:
- Determine if this content shows signs of AI generation
- Look for patterns like repetitive phrasing, overly formal language, predictable structure
- If AI-generated, provide specific suggestions to make it more human-like
- Focus on adding personality, varying sentence structure, using more conversational tone

Respond in JSON format:
{
  "isAIWritten": true|false,
  "confidence": 0.0-1.0,
  "aiIndicators": ["list of specific AI patterns found"],
  "humanizationSuggestions": [
    {
      "title": "Specific improvement title",
      "description": "Detailed suggestion for making content more human-like",
      "priority": "high|medium|low"
    }
  ]
}`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.4,
        max_tokens: 1500
      });

      if (!response || !response.content) {
        console.warn('❌ No response from AI detection analysis');
        setAiDetectionSuggestions([]);
        return [];
      }

      // Parse the JSON response
      let parsedResponse;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(response.content.trim());
        }
      } catch (parseError) {
        console.error('❌ Failed to parse AI detection response:', parseError);
        setAiDetectionSuggestions([]);
        return [];
      }

      if (parsedResponse?.isAIWritten && parsedResponse.humanizationSuggestions?.length > 0) {
        const suggestions: OptimizationSuggestion[] = parsedResponse.humanizationSuggestions.map((suggestion: any, index: number) => ({
          id: `ai_${index}`,
          title: suggestion.title || 'Humanize AI Content',
          description: suggestion.description || 'Make content more human-like',
          type: 'humanization' as const,
          priority: suggestion.priority || 'high',
          category: 'content',
          autoFixable: true,
          impact: 'high' as const,
          effort: 'medium' as const
        }));
        
        console.log(`✅ AI detection complete: Found ${suggestions.length} humanization suggestions`);
        setAiDetectionSuggestions(suggestions);
        return suggestions;
      }
      
      console.log('✅ AI detection complete: Content appears human-written');
      setAiDetectionSuggestions([]);
      return [];
      
    } catch (error: any) {
      console.error('❌ AI detection analysis failed:', error);
      setAiDetectionSuggestions([]);
      return [];
    }
  }, []);

  return {
    aiDetectionSuggestions,
    analyzeAIContent,
    setAiDetectionSuggestions
  };
}
