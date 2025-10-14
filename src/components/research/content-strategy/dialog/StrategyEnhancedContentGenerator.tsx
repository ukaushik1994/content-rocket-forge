import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentGenerator } from '@/components/content-builder/content/ai/ContentGenerator';

interface StrategyEnhancedContentGeneratorProps {
  proposal: any;
}

export function StrategyEnhancedContentGenerator({ proposal }: StrategyEnhancedContentGeneratorProps) {
  const { state, setContent } = useContentBuilder();

  // Build additional instructions for strategy-specific content
  const strategyInstructions = `
Content Strategy Context:
- Primary Keyword: ${proposal?.primary_keyword || state.mainKeyword}
- Featured Solution: ${state.selectedSolution?.name || 'N/A'}
${state.selectedSolution?.features ? `- Solution Features: ${state.selectedSolution.features.join(', ')}` : ''}
- Content Type: ${proposal?.content_type || state.contentType}
- Priority: ${proposal?.priority_tag || 'evergreen'}
${state.serpSelections?.length > 0 ? `- SERP Research Insights: ${state.serpSelections.length} items analyzed` : ''}

Please create comprehensive, SEO-optimized content that:
1. Naturally features the solution
2. Targets the primary keyword throughout
3. Follows the provided outline structure
4. Incorporates SERP research insights where relevant
5. Maintains a helpful, authoritative tone
  `.trim();

  // Convert outline to OutlineSection format - handle mixed types
  const formattedOutline = (state.outline || []).map((item, index) => {
    if (!item) {
      return {
        id: `section-${index}`,
        title: `Section ${index + 1}`,
        level: 1
      };
    }
    
    if (typeof item === 'string') {
      return {
        id: `section-${index}`,
        title: item,
        level: 1
      };
    }
    
    return {
      id: `section-${index}`,
      title: (item as any).title || `Section ${index + 1}`,
      level: 1,
      content: (item as any).content
    };
  });

  return (
    <ContentGenerator
      outline={formattedOutline}
      solution={state.selectedSolution}
      serpSelections={state.serpSelections}
      mainKeyword={proposal?.primary_keyword || state.mainKeyword}
      additionalInstructions={strategyInstructions}
      onContentGenerated={(content) => setContent(content)}
    />
  );
}