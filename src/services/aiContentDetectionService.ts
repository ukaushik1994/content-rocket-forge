
import { supabase } from "@/integrations/supabase/client";

export interface AIDetectionResult {
  isAIWritten: boolean;
  confidence: number;
  aiIndicators: string[];
  humanizationSuggestions: string[];
}

/**
 * Get the user's active AI provider for direct ai-proxy calls
 */
async function getActiveProvider() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: provider } = await supabase
    .from('ai_service_providers')
    .select('provider, api_key, preferred_model')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('priority', { ascending: true })
    .limit(1)
    .single();

  return provider;
}

/**
 * Detect if content is AI-written and provide humanization suggestions.
 * Calls ai-proxy directly for reliable JSON extraction.
 */
export async function detectAIContent(
  content: string
): Promise<AIDetectionResult | null> {
  try {
    const provider = await getActiveProvider();
    if (!provider) {
      console.warn('No AI provider configured for AI detection');
      return null;
    }

    const { data: aiData, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'chat',
        params: {
          model: provider.preferred_model || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI content detection analyst. Return ONLY valid JSON, no other text, no markdown fences.'
            },
            {
              role: 'user',
              content: `Analyze this content for AI writing patterns and provide humanization suggestions.

${content.slice(0, 3000)}

Respond with ONLY this JSON structure:
{"isAIWritten": true/false, "confidence": 0-100, "aiIndicators": ["indicator1"], "humanizationSuggestions": ["suggestion1"]}`
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }
      }
    });

    if (error) {
      console.error('AI detection proxy error:', error);
      return null;
    }

    const responseContent = aiData?.data?.choices?.[0]?.message?.content
      || aiData?.choices?.[0]?.message?.content
      || aiData?.content
      || '';

    if (!responseContent) {
      console.warn('Empty response from AI detection');
      return null;
    }

    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in AI detection response:', responseContent.slice(0, 200));
      return null;
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
  suggestions: string[]
): Promise<string | null> {
  try {
    const provider = await getActiveProvider();
    if (!provider) return null;

    const { data: aiData, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'chat',
        params: {
          model: provider.preferred_model || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a content editor. Humanize AI-written content to sound more natural. Return ONLY the rewritten content, no commentary.'
            },
            {
              role: 'user',
              content: `Humanize this content based on these suggestions:

SUGGESTIONS:
${suggestions.map(s => `- ${s}`).join('\n')}

CONTENT TO HUMANIZE:
${content}

Rewrite it to sound more natural and human-written while keeping all important information and structure intact.`
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }
      }
    });

    if (error) return null;

    return aiData?.data?.choices?.[0]?.message?.content
      || aiData?.choices?.[0]?.message?.content
      || aiData?.content
      || null;
  } catch (error) {
    console.error('Error humanizing content:', error);
    return null;
  }
}
