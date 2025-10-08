import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

export interface ChartPerspective {
  descriptive: string;
  strategic: string;
  actionable: string[];
  analytical: string;
  comparative: string;
}

/**
 * Generate multi-perspective insights for a chart using AI
 * This provides contextual analysis from different angles to help users understand the data
 */
export async function generateChartPerspectives(
  chartConfig: any,
  context: string,
  supabaseClient: any
): Promise<ChartPerspective | null> {
  try {
    console.log('🧠 Generating chart perspectives...');
    
    // Get provider configuration
    const { data: provider, error: providerError } = await supabaseClient
      .from('ai_providers')
      .select('*')
      .eq('is_default', true)
      .single();

    if (providerError || !provider) {
      console.error('No AI provider configured for perspective generation');
      return null;
    }

    // Prepare chart data summary
    const dataSummary = chartConfig.data?.slice(0, 10).map((item: any) => ({
      name: item.name || item.label,
      value: item.value || item.count || item.total
    }));

    const prompt = `Analyze this chart data from multiple perspectives to help the user understand its significance:

**Chart Type**: ${chartConfig.type}
**Context**: ${context}
**Data Sample**: ${JSON.stringify(dataSummary, null, 2)}

Provide analysis from these 5 perspectives (keep each concise, 1-2 sentences max):

1. **DESCRIPTIVE**: What does this chart show? (What is the data telling us?)
2. **STRATEGIC**: Why does this matter for the business/goals? (Business impact)
3. **ANALYTICAL**: What trends or patterns are visible? (Key observations)
4. **COMPARATIVE**: How does this compare to typical benchmarks or expectations? (Context setting)
5. **ACTIONABLE**: What are 3 specific actions to take based on this? (Next steps)

Format as JSON:
{
  "descriptive": "...",
  "strategic": "...",
  "analytical": "...",
  "comparative": "...",
  "actionable": ["action 1", "action 2", "action 3"]
}`;

    // Call AI to generate perspectives
    const { data: aiResult, error: aiError } = await supabaseClient.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'chat',
        apiKey: provider.api_key,
        params: {
          model: provider.preferred_model,
          messages: [
            {
              role: "system",
              content: "You are a data analyst providing multi-perspective insights on charts. Be concise and actionable. Always respond with valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }
      }
    });

    if (aiError || !aiResult?.success) {
      console.error('Failed to generate perspectives:', aiError);
      return null;
    }

    const aiMessage = aiResult.data?.choices?.[0]?.message?.content;
    if (!aiMessage) {
      console.error('Empty AI response for perspectives');
      return null;
    }

    // Parse JSON from response
    const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in perspective response');
      return null;
    }

    const perspectives: ChartPerspective = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!perspectives.descriptive || !perspectives.strategic || !perspectives.actionable) {
      console.error('Invalid perspective structure');
      return null;
    }

    console.log('✅ Chart perspectives generated successfully');
    return perspectives;

  } catch (error) {
    console.error('Error generating chart perspectives:', error);
    return null;
  }
}
