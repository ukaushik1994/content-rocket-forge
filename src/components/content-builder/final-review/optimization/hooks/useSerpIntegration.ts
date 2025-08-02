
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { analyzeSerpUsage } from '@/services/serpIntegrationAnalyzer';

export function useSerpIntegration() {
  const { state } = useContentBuilder();
  const [serpIntegrationSuggestions, setSerpIntegrationSuggestions] = useState<OptimizationSuggestion[]>([]);

  const analyzeSerpUsageHook = useCallback(async (content: string) => {
    const selectedSerpItems = state.serpSelections?.filter(item => item.selected) || [];
    if (selectedSerpItems.length > 0) {
      const serpAnalysis = await analyzeSerpUsage(content, selectedSerpItems);
      if (serpAnalysis && serpAnalysis.unusedItems.length > 0) {
        const suggestions: OptimizationSuggestion[] = serpAnalysis.integrationSuggestions.map((suggestion, index) => ({
          id: `serp_${index}`,
          title: 'Integrate SERP Items',
          description: suggestion,
          type: 'serp_integration',
          priority: 'medium',
          category: 'seo',
          autoFixable: true
        }));
        setSerpIntegrationSuggestions(suggestions);
        return suggestions;
      }
    }
    setSerpIntegrationSuggestions([]);
    return [];
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
