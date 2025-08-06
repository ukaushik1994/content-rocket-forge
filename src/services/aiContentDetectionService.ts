
import AIServiceController from '@/services/aiService/AIServiceController';
import { AiProvider } from '@/services/aiService/types';

export interface AIDetectionResult {
  isAIWritten: boolean;
  confidence: number;
  aiIndicators: string[];
  humanizationSuggestions: string[];
}

/**
 * Detect if content is AI-written and provide humanization suggestions
 */
export async function detectAIContent(
  content: string,
  provider: AiProvider = 'openai'
): Promise<AIDetectionResult | null> {
  try {
    const response = await AIServiceController.generate({
      input: `Analyze this content for AI writing patterns and provide humanization suggestions:

${content}

Respond in JSON format:
{
  "isAIWritten": boolean,
  "confidence": number (0-100),
  "aiIndicators": ["indicator1", "indicator2"],
  "humanizationSuggestions": ["suggestion1", "suggestion2"]
}`,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 1000
    });

    if (!response?.content) {
      throw new Error('No response from AI detection service');
    }

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI detection response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      isAIWritten: result.isAIWritten || false,
      confidence: result.confidence || 0,
      aiIndicators: Array.isArray(result.aiIndicators) ? result.aiIndicators : [],
      humanizationSuggestions: Array.isArray(result.humanizationSuggestions) ? result.humanizationSuggestions : []
    };
  } catch (error) {
    console.error('Error detecting AI content:', error);
    return null;
  }
}

/**
 * Generate humanized version of AI content
 */
export async function humanizeContent(
  content: string,
  suggestions: string[],
  provider: AiProvider = 'openai'
): Promise<string | null> {
  try {
    const response = await AIServiceController.generate({
      input: `Humanize this content based on these specific suggestions:

SUGGESTIONS:
${suggestions.map(s => `- ${s}`).join('\n')}

CONTENT TO HUMANIZE:
${content}

Make it sound more natural and human-written while keeping all the important information and structure intact.`,
      use_case: 'content_generation',
      temperature: 0.7,
      max_tokens: 3000
    });

    return response?.content || null;
  } catch (error) {
    console.error('Error humanizing content:', error);
    return null;
  }
}
