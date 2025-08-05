
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { sendChatRequest } from '@/services/aiService';
import { toast } from 'sonner';
import { humanizeContent } from '@/services/aiContentDetectionService';
import { analyzeSerpUsage, integrateSerpItems } from '@/services/serpIntegrationAnalyzer';
import { OptimizationSuggestion } from '../types';

export function useContentOptimization() {
  const { state } = useContentBuilder();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeContent = useCallback(async (
    content: string,
    selectedSuggestions: string[],
    contentSuggestions: OptimizationSuggestion[],
    aiDetectionSuggestions: OptimizationSuggestion[],
    serpIntegrationSuggestions: OptimizationSuggestion[],
    solutionSuggestions: OptimizationSuggestion[]
  ) => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion');
      return null;
    }

    setIsOptimizing(true);
    try {
      let optimizedContent = content;

      // Get selected suggestions by type
      const selectedContentSuggestions = contentSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedAISuggestions = aiDetectionSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedSerpSuggestions = serpIntegrationSuggestions.filter(s => selectedSuggestions.includes(s.id));
      const selectedSolutionSuggestions = solutionSuggestions.filter(s => selectedSuggestions.includes(s.id));

      // Apply AI humanization if selected
      if (selectedAISuggestions.length > 0) {
        const humanizationSuggestions = selectedAISuggestions.map(s => s.description);
        const humanizedContent = await humanizeContent(optimizedContent, humanizationSuggestions);
        if (humanizedContent) {
          optimizedContent = humanizedContent;
        }
      }

      // Apply SERP integration if selected
      if (selectedSerpSuggestions.length > 0) {
        const selectedSerpItems = state.serpSelections?.filter(item => item.selected) || [];
        const serpAnalysis = await analyzeSerpUsage(optimizedContent, selectedSerpItems);
        if (serpAnalysis && serpAnalysis.unusedItems.length > 0) {
          const integratedContent = await integrateSerpItems(
            optimizedContent, 
            serpAnalysis.unusedItems, 
            serpAnalysis.integrationSuggestions
          );
          if (integratedContent) {
            optimizedContent = integratedContent;
          }
        }
      }

      // Apply content and solution suggestions using comprehensive prompt
      if (selectedContentSuggestions.length > 0 || selectedSolutionSuggestions.length > 0) {
        const allSelectedSuggestions = [...selectedContentSuggestions, ...selectedSolutionSuggestions];
        const suggestionPrompts = allSelectedSuggestions.map(s => `- ${s.title}: ${s.description}`).join('\n');

        const response = await sendChatRequest('openrouter', {
          messages: [
            {
              role: 'system',
              content: 'You are an expert content optimizer. Apply the specified suggestions to improve the content while maintaining its structure and core message.'
            },
            {
              role: 'user',
              content: `Apply these optimization suggestions to the content:

SUGGESTIONS TO APPLY:
${suggestionPrompts}

CURRENT CONTENT:
${optimizedContent}

CONTEXT:
- Main Keyword: ${state.mainKeyword || 'Not specified'}
- Selected Keywords: ${state.selectedKeywords?.join(', ') || 'None'}
- Solution: ${state.selectedSolution?.name || 'None'}

Rewrite the content implementing all the suggestions while maintaining the same structure and key information.`
            }
          ]
        });

        if (response?.choices?.[0]?.message?.content) {
          optimizedContent = response.choices[0].message.content;
        }
      }

      return optimizedContent;
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Failed to optimize content');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [state]);

  return {
    isOptimizing,
    optimizeContent
  };
}
