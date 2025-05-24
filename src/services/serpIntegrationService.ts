
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { sendChatRequest } from './aiService';
import { AiProvider } from './aiService/types';

export interface SerpUsageAnalysis {
  totalSerpItems: number;
  integratedItems: number;
  integrationScore: number; // 0-100
  missingItems: SerpSelection[];
  wellIntegratedItems: Array<{
    item: SerpSelection;
    locations: string[];
    integrationQuality: 'excellent' | 'good' | 'poor';
  }>;
  suggestions: Array<{
    item: SerpSelection;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const analyzeSerpIntegration = async (
  content: string,
  serpSelections: SerpSelection[]
): Promise<SerpUsageAnalysis> => {
  if (!serpSelections.length) {
    return {
      totalSerpItems: 0,
      integratedItems: 0,
      integrationScore: 100,
      missingItems: [],
      wellIntegratedItems: [],
      suggestions: []
    };
  }

  const analysis: SerpUsageAnalysis = {
    totalSerpItems: serpSelections.length,
    integratedItems: 0,
    integrationScore: 0,
    missingItems: [],
    wellIntegratedItems: [],
    suggestions: []
  };

  // Check each SERP item for integration
  for (const item of serpSelections) {
    const itemContent = item.content.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes(itemContent)) {
      analysis.integratedItems++;
      
      // Find locations where it appears
      const locations = [];
      const contentSections = content.split('\n\n');
      contentSections.forEach((section, index) => {
        if (section.toLowerCase().includes(itemContent)) {
          locations.push(`Section ${index + 1}`);
        }
      });

      analysis.wellIntegratedItems.push({
        item,
        locations,
        integrationQuality: locations.length > 1 ? 'excellent' : 'good'
      });
    } else {
      analysis.missingItems.push(item);
      analysis.suggestions.push({
        item,
        suggestion: `Consider integrating "${item.content}" in a relevant section`,
        priority: item.type === 'question' ? 'high' : 'medium'
      });
    }
  }

  analysis.integrationScore = Math.round((analysis.integratedItems / analysis.totalSerpItems) * 100);
  
  return analysis;
};

export const enhanceContentWithSerp = async (
  content: string,
  missingItems: SerpSelection[],
  aiProvider: AiProvider = 'openai'
): Promise<string | null> => {
  try {
    if (!missingItems.length) return content;

    const response = await sendChatRequest(aiProvider, {
      messages: [
        {
          role: 'system',
          content: 'You are an expert content optimizer. Integrate the provided SERP elements naturally into the content while maintaining flow and readability.'
        },
        {
          role: 'user',
          content: `Integrate these SERP elements into the content naturally:

SERP ELEMENTS TO INTEGRATE:
${missingItems.map(item => `- ${item.type}: ${item.content}`).join('\n')}

CURRENT CONTENT:
${content}

Requirements:
- Integrate elements naturally without forced placement
- Maintain content flow and readability
- Add relevant headings for questions
- Include entities and keywords contextually
- Keep the same overall structure and tone`
        }
      ]
    });

    return response?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('SERP integration error:', error);
    return null;
  }
};
