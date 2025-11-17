import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CampaignInput {
  idea: string;
  targetAudience?: string;
  goal?: string;
  timeline?: string;
  solutionId?: string;
  useSerpData?: boolean;
  useCompetitorData?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limiting
    const { data: limitData, error: limitError } = await supabase
      .from('campaign_generation_limits')
      .select('generation_count, window_start')
      .eq('user_id', user.id)
      .single();

    if (limitData) {
      const windowStart = new Date(limitData.window_start);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (windowStart > hourAgo && limitData.generation_count >= 10) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 generations per hour.' }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const body = await req.json();
    const { input, selectedSummary, serpContext, solutionContext, competitorContext } = body;

    // Validate input
    if (!input?.idea || input.idea.length < 10 || input.idea.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: idea must be between 10-5000 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Sanitize input
    const sanitizedInput: CampaignInput = {
      idea: input.idea.replace(/<[^>]*>/g, '').trim(),
      targetAudience: input.targetAudience?.replace(/<[^>]*>/g, '').trim(),
      goal: input.goal,
      timeline: input.timeline,
      solutionId: input.solutionId,
      useSerpData: input.useSerpData,
      useCompetitorData: input.useCompetitorData
    };

    // Build context for AI
    let contextPrompt = `Campaign Idea: ${sanitizedInput.idea}\n`;
    if (sanitizedInput.targetAudience) {
      contextPrompt += `Target Audience: ${sanitizedInput.targetAudience}\n`;
    }
    if (sanitizedInput.goal) {
      contextPrompt += `Goal: ${sanitizedInput.goal}\n`;
    }
    if (sanitizedInput.timeline) {
      contextPrompt += `Timeline: ${sanitizedInput.timeline}\n`;
    }
    if (selectedSummary) {
      contextPrompt += `\nSolution Context: ${JSON.stringify(selectedSummary)}\n`;
    }
    if (serpContext) {
      contextPrompt += `\nSERP Data: ${JSON.stringify(serpContext)}\n`;
    }
    if (competitorContext) {
      contextPrompt += `\nCompetitor Intelligence: ${JSON.stringify(competitorContext)}\n`;
    }

    // Call AI proxy with retry logic
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-proxy', {
          body: {
            messages: [
              {
                role: 'system',
                content: 'You are a campaign strategy expert. Generate a comprehensive campaign strategy with title, description, content types, timeline, target channels, and key messaging.'
              },
              {
                role: 'user',
                content: contextPrompt
              }
            ],
            tools: [
              {
                type: 'function',
                function: {
                  name: 'generate_campaign_strategies',
                  description: 'Generate campaign strategies',
                  parameters: {
                    type: 'object',
                    properties: {
                      strategies: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            contentTypes: { type: 'array', items: { type: 'string' } },
                            timeline: { type: 'string' },
                            targetChannels: { type: 'array', items: { type: 'string' } },
                            keyMessaging: { type: 'array', items: { type: 'string' } }
                          },
                          required: ['title', 'description', 'contentTypes', 'timeline']
                        }
                      }
                    },
                    required: ['strategies']
                  }
                }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'generate_campaign_strategies' } }
          }
        });

        if (aiError) throw aiError;

        const strategy = aiData?.tool_calls?.[0]?.function?.arguments?.strategies?.[0] || aiData;

        // Update rate limit counter
        await supabase.from('campaign_generation_limits').upsert({
          user_id: user.id,
          generation_count: (limitData?.generation_count || 0) + 1,
          window_start: limitData ? limitData.window_start : new Date().toISOString(),
          last_reset: new Date().toISOString()
        });

        return new Response(JSON.stringify({ strategy }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error('Error in generate-campaign-strategy:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
