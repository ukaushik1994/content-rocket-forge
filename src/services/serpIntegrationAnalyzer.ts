
import AIServiceController from '@/services/aiService/AIServiceController';
import { AiProvider } from '@/services/aiService/types';
import { SerpSelection } from '@/contexts/content-builder/types/index';

export interface SerpUsageAnalysis {
  totalSelected: number;
  totalUsed: number;
  usagePercentage: number;
  unusedItems: SerpSelection[];
  usageByType: Record<string, { used: number; total: number; percentage: number }>;
  integrationSuggestions: string[];
}

/**
 * Analyze how well selected SERP items are integrated into content
 */
export async function analyzeSerpUsage(
  content: string,
  selectedSerpItems: SerpSelection[],
  provider: AiProvider = 'openai'
): Promise<SerpUsageAnalysis | null> {
  try {
    if (!selectedSerpItems.length) {
      return {
        totalSelected: 0,
        totalUsed: 0,
        usagePercentage: 100,
        unusedItems: [],
        usageByType: {},
        integrationSuggestions: []
      };
    }

    const serpItemsText = selectedSerpItems.map(item => 
      `${item.type}: ${item.content}`
    ).join('\n');

    const response = await AIServiceController.generate({
      input: `Analyze this content to see how well these selected SERP items are integrated:

SELECTED SERP ITEMS:
${serpItemsText}

CONTENT:
${content}

Respond in JSON format:
{
  "usedItems": ["item1", "item2"],
  "unusedItems": ["item3", "item4"],
  "integrationSuggestions": ["suggestion1", "suggestion2"]
}`,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 1500
    });

    if (!response?.content) {
      throw new Error('No response from SERP analysis service');
    }

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in SERP analysis response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    const usedItems = Array.isArray(result.usedItems) ? result.usedItems : [];
    const unusedItemContents = Array.isArray(result.unusedItems) ? result.unusedItems : [];
    
    const unusedItems = selectedSerpItems.filter(item => 
      unusedItemContents.some(unused => item.content.includes(unused) || unused.includes(item.content))
    );

    const totalUsed = selectedSerpItems.length - unusedItems.length;
    const usagePercentage = selectedSerpItems.length > 0 ? Math.round((totalUsed / selectedSerpItems.length) * 100) : 100;

    // Group by type
    const usageByType: Record<string, { used: number; total: number; percentage: number }> = {};
    
    for (const item of selectedSerpItems) {
      if (!usageByType[item.type]) {
        usageByType[item.type] = { used: 0, total: 0, percentage: 0 };
      }
      usageByType[item.type].total++;
      
      if (!unusedItems.some(unused => unused.content === item.content)) {
        usageByType[item.type].used++;
      }
    }

    // Calculate percentages
    Object.keys(usageByType).forEach(type => {
      const data = usageByType[type];
      data.percentage = data.total > 0 ? Math.round((data.used / data.total) * 100) : 100;
    });

    return {
      totalSelected: selectedSerpItems.length,
      totalUsed,
      usagePercentage,
      unusedItems,
      usageByType,
      integrationSuggestions: Array.isArray(result.integrationSuggestions) ? result.integrationSuggestions : []
    };
  } catch (error) {
    console.error('Error analyzing SERP usage:', error);
    return null;
  }
}

/**
 * Generate content with better SERP integration
 */
export async function integrateSerpItems(
  content: string,
  unusedSerpItems: SerpSelection[],
  integrationSuggestions: string[],
  provider: AiProvider = 'openai'
): Promise<string | null> {
  try {
    if (!unusedSerpItems.length) {
      return content;
    }

    const unusedItemsText = unusedSerpItems.map(item => 
      `${item.type}: ${item.content}`
    ).join('\n');

    const response = await AIServiceController.generate({
      input: `Integrate these unused SERP items into the content naturally:

UNUSED SERP ITEMS TO INTEGRATE:
${unusedItemsText}

INTEGRATION SUGGESTIONS:
${integrationSuggestions.map(s => `- ${s}`).join('\n')}

CURRENT CONTENT:
${content}

Rewrite the content to naturally include all unused SERP items while maintaining the same structure and quality.`,
      use_case: 'content_generation',
      temperature: 0.6,
      max_tokens: 3000
    });

    return response?.content || null;
  } catch (error) {
    console.error('Error integrating SERP items:', error);
    return null;
  }
}
