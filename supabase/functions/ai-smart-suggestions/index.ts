import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, config } = await req.json();
    
    console.log('🧠 Generating AI-powered smart suggestions...');

    // Get the LOVABLE_API_KEY from environment
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not found");
    }

    // Analyze conversation context with AI
    const contextPrompt = `Based on this conversation, suggest 3 contextual follow-up actions or questions that would be most helpful to the user. Consider:

1. The user's apparent goals and interests
2. Natural conversation flow and follow-up questions
3. Workflow optimization opportunities
4. Content strategy and SEO improvements

Recent conversation:
${messages.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Return ONLY a JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "text": "suggestion text",
    "type": "followup|workflow|optimization|analysis",
    "priority": 1-10,
    "context": {"key": "value"},
    "actionData": {"action": "specific action"}
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a smart suggestion engine that returns only valid JSON arrays of suggestions." },
          { role: "user", content: contextPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let suggestions;
    
    try {
      const suggestionsText = aiResponse.choices?.[0]?.message?.content;
      suggestions = JSON.parse(suggestionsText);
    } catch (parseError) {
      console.error('Error parsing AI suggestions:', parseError);
      // Fallback to static suggestions
      suggestions = generateFallbackSuggestions(messages);
    }

    // Store suggestions in database for analytics
    if (conversationId && suggestions.length > 0) {
      await supabase
        .from('ai_context_state')
        .upsert({
          user_id: req.headers.get('user-id'),
          context: {
            type: 'smart_suggestions',
            suggestions,
            generated_at: new Date().toISOString(),
            conversation_id: conversationId
          }
        });
    }

    return new Response(JSON.stringify({ 
      suggestions,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating smart suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestions: generateFallbackSuggestions([])
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackSuggestions(messages: any[]) {
  const latestContent = messages[messages.length - 1]?.content || '';
  const suggestions = [];

  if (latestContent.toLowerCase().includes('seo')) {
    suggestions.push({
      id: `fallback-seo-${Date.now()}`,
      text: "How can I improve my SEO strategy further?",
      type: 'followup',
      priority: 8,
      context: { topic: 'seo' }
    });
  }

  if (latestContent.toLowerCase().includes('content')) {
    suggestions.push({
      id: `fallback-content-${Date.now()}`,
      text: "Start a content optimization workflow",
      type: 'workflow',
      priority: 7,
      actionData: { workflow: 'content-optimization' }
    });
  }

  suggestions.push({
    id: `fallback-analysis-${Date.now()}`,
    text: "Analyze conversation patterns and insights",
    type: 'analysis',
    priority: 6,
    context: { analysisType: 'conversation-summary' }
  });

  return suggestions.slice(0, 3);
}