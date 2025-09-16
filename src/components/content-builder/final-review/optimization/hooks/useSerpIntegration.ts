
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';

export function useSerpIntegration() {
  const { state } = useContentBuilder();
  const [serpIntegrationSuggestions, setSerpIntegrationSuggestions] = useState<OptimizationSuggestion[]>([]);

  const analyzeSerpUsageHook = useCallback(async (content: string) => {
    try {
      const selectedSerpItems = state.serpSelections?.filter(item => item.selected) || [];
      
      if (selectedSerpItems.length === 0) {
        console.log('ℹ️ No SERP items selected for integration analysis');
        setSerpIntegrationSuggestions([]);
        return [];
      }
      
      console.log('🔍 Starting SERP integration analysis via AIServiceController...');
      
      const serpItemsText = selectedSerpItems.map(item => 
        `• ${item.type}: ${item.content}${item.metadata?.title ? ` (${item.metadata.title})` : ''}`
      ).join('\n');

      const prompt = `Analyze how well this content incorporates the selected SERP research items and provide integration suggestions:

CURRENT CONTENT:
${content}

SELECTED SERP RESEARCH ITEMS:
${serpItemsText}

ANALYSIS INSTRUCTIONS:
- Identify which SERP items are already well-integrated
- Find SERP items that are missing or poorly integrated
- Provide specific suggestions for better integration
- Focus on natural incorporation that adds value

Respond in JSON format:
{
  "unusedItems": [
    {
      "type": "item type",
      "content": "item content",
      "reason": "why it's not well integrated"
    }
  ],
  "integrationSuggestions": [
    {
      "title": "Integration suggestion title",
      "description": "Specific way to incorporate SERP items naturally",
      "priority": "high|medium|low",
      "serpItems": ["which SERP items this addresses"]
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
        console.warn('❌ No response from SERP integration analysis');
        setSerpIntegrationSuggestions([]);
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
        console.error('❌ Failed to parse SERP integration response:', parseError);
        setSerpIntegrationSuggestions([]);
        return [];
      }

      if (parsedResponse?.integrationSuggestions?.length > 0) {
        const suggestions: OptimizationSuggestion[] = parsedResponse.integrationSuggestions.map((suggestion: any, index: number) => ({
          id: `serp_${index}`,
          title: suggestion.title || 'Integrate SERP Items',
          description: suggestion.description || 'Better integrate SERP research data',
          type: 'serp_integration' as const,
          priority: suggestion.priority || 'medium',
          category: 'seo',
          autoFixable: true,
          impact: 'medium' as const,
          effort: 'medium' as const
        }));
        
        console.log(`✅ SERP integration analysis complete: Found ${suggestions.length} integration suggestions`);
        setSerpIntegrationSuggestions(suggestions);
        return suggestions;
      }
      
      console.log('✅ SERP integration analysis complete: No improvements needed');
      setSerpIntegrationSuggestions([]);
      return [];
      
    } catch (error: any) {
      console.error('❌ SERP integration analysis failed:', error);
      setSerpIntegrationSuggestions([]);
      return [];
    }
  }, [state.serpSelections]);

  const incorporateAllSerpItems = useCallback(() => {
    const serpSuggestionIds = serpIntegrationSuggestions.map(s => s.id);
    return serpSuggestionIds;
  }, [serpIntegrationSuggestions]);

  return {
    serpIntegrationSuggestions,
    analyzeSerpUsage: analyzeSerpUsageHook,
    setSerpIntegrationSuggestions,
    incorporateAllSerpItems
  };
}
