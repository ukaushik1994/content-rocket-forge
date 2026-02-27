
import { supabase } from "@/integrations/supabase/client";

export interface DimensionScores {
  personalVoice: number;
  specificity: number;
  writingVariation: number;
  factualDepth: number;
}

export interface AIDetectionResult {
  isAIWritten: boolean;
  confidence: number;
  contentValueScore: number;
  adjustedHumanScore: number;
  dimensionScores: DimensionScores;
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
 * Detect if content is AI-written using 4-dimension scoring with value-adjusted formula.
 * Dimensions: Personal Voice, Specificity, Writing Variation, Factual Depth (each 0-25).
 * Final adjustedHumanScore = rawHuman + max(0, (contentValueScore - 50) * 0.4)
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
              content: 'You are a content quality and AI detection analyst. Evaluate content across multiple dimensions. Return ONLY valid JSON, no other text, no markdown fences.'
            },
            {
              role: 'user',
              content: `Analyze this content for AI writing patterns AND content value. Score each dimension 0-25:

DIMENSION 1 — Personal Voice (0-25): Does the content include first-person experiences, opinions, anecdotes, unique takes? Or is it generic "many experts say" style?
DIMENSION 2 — Specificity (0-25): Does it name real companies, cite exact numbers, reference specific benchmarks, tools, versions? Or use vague generalities?
DIMENSION 3 — Writing Variation (0-25): Does sentence length vary? Are there conversational asides, non-formulaic transitions, rhetorical questions? Or is every paragraph the same structure?
DIMENSION 4 — Factual Depth (0-25): Does it show expert nuance, contrarian insights, beyond-surface analysis? Or just restate commonly known information?

Also assess:
- isAIWritten: overall likelihood this was AI-generated (true/false)
- confidence: 0-100 how confident you are it's AI-written
- contentValueScore: 0-100 how valuable this content is to a reader regardless of who wrote it
- aiIndicators: list of specific patterns that suggest AI authorship
- humanizationSuggestions: actionable ways to make it sound more human

CONTENT TO ANALYZE:
${content.slice(0, 3000)}

Respond with ONLY this JSON:
{"isAIWritten": true/false, "confidence": 0-100, "contentValueScore": 0-100, "dimensionScores": {"personalVoice": 0-25, "specificity": 0-25, "writingVariation": 0-25, "factualDepth": 0-25}, "aiIndicators": ["..."], "humanizationSuggestions": ["..."]}`
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
          response_format: { type: "json_object" },
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

    let result: any;
    try {
      result = JSON.parse(responseContent);
    } catch {
      const stripped = responseContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      try {
        result = JSON.parse(stripped);
      } catch {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn('No JSON found in AI detection response:', responseContent.slice(0, 300));
          return null;
        }
        result = JSON.parse(jsonMatch[0]);
      }
    }

    const confidence = result.confidence || 0;
    const contentValueScore = result.contentValueScore || 0;
    const rawHuman = Math.max(0, 100 - confidence);
    const valueBoost = Math.max(0, (contentValueScore - 40) * 0.6);
    let adjustedHumanScore = Math.min(100, Math.round(rawHuman + valueBoost));

    // Quality floor: high-value + deep content should never show red
    const factualDepth = result.dimensionScores?.factualDepth || 0;
    if (contentValueScore >= 75 && factualDepth >= 18 && adjustedHumanScore < 45) {
      adjustedHumanScore = 45;
    }

    const dimensionScores: DimensionScores = {
      personalVoice: result.dimensionScores?.personalVoice || 0,
      specificity: result.dimensionScores?.specificity || 0,
      writingVariation: result.dimensionScores?.writingVariation || 0,
      factualDepth: result.dimensionScores?.factualDepth || 0,
    };

    console.log('[AI Detection] Raw:', { confidence, rawHuman, contentValueScore, valueBoost, adjustedHumanScore, dimensionScores });

    return {
      isAIWritten: result.isAIWritten || false,
      confidence,
      contentValueScore,
      adjustedHumanScore,
      dimensionScores,
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
