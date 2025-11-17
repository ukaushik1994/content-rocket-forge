import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Campaign Strategy Tool Definition
const CAMPAIGN_STRATEGY_TOOL = {
  type: "function",
  function: {
    name: "generate_campaign_strategies",
    description: "Generate 3-4 specific B2B SaaS marketing campaign strategies based on user's campaign context",
    parameters: {
      type: "object",
      properties: {
        strategies: {
          type: "array",
          description: "Array of 3-4 distinct campaign strategies",
          minItems: 3,
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique UUID for this strategy"
              },
              title: {
                type: "string",
                description: "Specific campaign name format: [Audience] [Channel/Type]: [Solution Benefit]. Example: 'CFO LinkedIn: Finance Automation' or 'Startup Founders Email Series: Project Management Tips'"
              },
              description: {
                type: "string",
                description: "1-2 sentences explaining the tactical approach (not generic benefits)"
              },
              contentMix: {
                type: "array",
                description: "Array of content formats with counts",
                items: {
                  type: "object",
                  properties: {
                    formatId: {
                      type: "string",
                      enum: ["blog", "email", "social-linkedin", "social-twitter", "social-facebook", "social-instagram", "script", "landing-page", "carousel", "meme", "google-ads"],
                      description: "Content format ID"
                    },
                    count: {
                      type: "integer",
                      minimum: 1,
                      maximum: 20,
                      description: "Number of pieces for this format"
                    }
                  },
                  required: ["formatId", "count"]
                }
              },
              expectedOutcome: {
                type: "string",
                description: "1 specific sentence on what THIS campaign achieves for THIS solution"
              },
              focus: {
                type: "string",
                enum: ["awareness", "conversion", "engagement", "education"],
                description: "Primary campaign focus"
              },
              effortLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Overall effort required"
              },
              totalHours: {
                type: "integer",
                minimum: 5,
                maximum: 200,
                description: "Total hours needed. Calculate based on: blog=4hrs, email=2hrs, social=1hr, video/script=8hrs, landing-page=6hrs, carousel=3hrs, meme=0.5hrs, google-ads=2hrs"
              },
              complexity: {
                type: "string",
                enum: ["beginner", "skilled", "expert"],
                description: "Skill level required. Expert = video/paid ads, Skilled = blog/email/landing pages, Beginner = social media"
              }
            },
            required: ["id", "title", "description", "contentMix", "expectedOutcome", "focus", "effortLevel", "totalHours", "complexity"]
          }
        }
      },
      required: ["strategies"]
    }
  }
};

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

    // Fetch user's configured AI provider
    const { data: providerData, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (providerError || !providerData) {
      return new Response(
        JSON.stringify({ error: 'No active AI provider configured. Please configure an AI provider in Settings.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Rate limiting handled by external AI/SERP services only

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
    console.log('🎯 Starting campaign strategy generation');
    console.log(`   Provider: ${providerData.provider}`);
    console.log(`   Model: ${providerData.preferred_model || 'gpt-4'}`);
    console.log(`   Context length: ${contextPrompt.length} chars`);
    
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt + 1}/3 - Calling ai-proxy`);
        
        const requestBody = {
          service: providerData.provider,
          endpoint: 'chat',
          apiKey: providerData.api_key,
          params: {
            model: providerData.preferred_model || 'gpt-4',
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
            tools: [CAMPAIGN_STRATEGY_TOOL],
            tool_choice: { type: 'function', function: { name: 'generate_campaign_strategies' } },
            temperature: 0.7,
            max_tokens: 4096
          }
        };
        
        console.log('📤 Request body keys:', Object.keys(requestBody));
        console.log('📤 Request params keys:', Object.keys(requestBody.params || {}));
        
        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-proxy', {
          body: requestBody
        });

        console.log('📥 AI-proxy response:', {
          hasData: !!aiData,
          hasError: !!aiError,
          dataKeys: aiData ? Object.keys(aiData) : [],
          errorDetails: aiError,
          fullResponse: aiData
        });

        if (aiError) {
          console.error('❌ AI-proxy returned error:', JSON.stringify(aiError, null, 2));
          throw aiError;
        }

        if (!aiData?.success) {
          console.error('❌ AI proxy unsuccessful:', JSON.stringify(aiData, null, 2));
          throw new Error(aiData?.error || 'AI proxy returned unsuccessful response');
        }

        // Extract tool calls from the response
        const toolCalls = aiData?.data?.choices?.[0]?.message?.tool_calls;
        if (!toolCalls || toolCalls.length === 0) {
          throw new Error('No tool calls in AI response');
        }

        // Parse the function arguments
        const functionArgs = JSON.parse(toolCalls[0].function.arguments);
        const strategies = functionArgs.strategies;

        if (!strategies || strategies.length === 0) {
          throw new Error('No strategies generated');
        }

        const strategy = strategies[0];

        // Verify strategy structure
        console.log('🔍 Strategy structure:', {
          hasId: !!strategy.id,
          hasTitle: !!strategy.title,
          hasDescription: !!strategy.description,
          hasContentMix: !!strategy.contentMix,
          contentMixLength: strategy.contentMix?.length || 0,
          contentMixSample: strategy.contentMix?.[0],
          hasExpectedOutcome: !!strategy.expectedOutcome,
          hasFocus: !!strategy.focus,
          hasEffortLevel: !!strategy.effortLevel,
          hasTotalHours: !!strategy.totalHours,
          hasComplexity: !!strategy.complexity
        });


        return new Response(JSON.stringify({ strategy }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt + 1} failed:`, {
          errorName: error?.name,
          errorMessage: error?.message,
          aiError: aiError,
          attempt: attempt + 1
        });
        
        // Don't retry on auth/config errors
        if (error?.message?.includes('No active AI provider') || 
            error?.message?.includes('Unauthorized')) {
          throw error; // Fast fail on config issues
        }
        
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
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
