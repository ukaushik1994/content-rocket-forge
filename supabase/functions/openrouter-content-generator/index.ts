import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model, user_id, temperature = 0.7 } = await req.json();

    if (!prompt || !user_id) {
      return new Response(JSON.stringify({
        error: "Prompt and user_id are required"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate prompt is a string and not empty
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({
        error: "Prompt must be a non-empty string"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🚀 OpenRouter content generation request for user: ${user_id}`);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's OpenRouter API key
    const { data: userKey, error: keyError } = await supabase
      .from('user_llm_keys')
      .select('api_key, model')
      .eq('user_id', user_id)
      .eq('provider', 'openrouter')
      .eq('is_active', true)
      .single();

    if (keyError || !userKey) {
      console.error(`❌ No OpenRouter key found for user: ${user_id}`);
      return new Response(JSON.stringify({
        error: "OpenRouter API key not configured. Please add your key in Settings."
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate the API key format
    const sanitizedKey = typeof userKey.api_key === 'string' ? userKey.api_key.trim() : '';
    if (!sanitizedKey || !/^[a-zA-Z0-9_\-\.]+$/.test(sanitizedKey)) {
      console.error(`❌ Invalid API key format for user: ${user_id}`);
      return new Response(JSON.stringify({
        error: "Invalid OpenRouter API key format. Please update your key in Settings."
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use provided model or fall back to user's default model
    const selectedModel = model || userKey.model || 'openai/gpt-4';
    
    console.log(`🤖 Using model: ${selectedModel}`);
    
    const startTime = Date.now();

    // Make request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sanitizedKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer for Content Rocket Forge. Create high-quality, engaging content that follows SEO best practices and aligns with the user\'s brand voice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 4000
      })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`📡 OpenRouter API response status: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenRouter API error: ${errorText}`);
      
      // Log failed request
      await supabase.from('llm_usage_logs').insert({
        user_id,
        provider: 'openrouter',
        model: selectedModel,
        success: false,
        error_message: errorText,
        request_duration_ms: duration
      });

      let errorMessage = "Content generation failed";
      if (response.status === 401) {
        errorMessage = "OpenRouter key missing or invalid. Please check and try again.";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again in a few moments.";
      } else if (response.status === 402) {
        errorMessage = "Insufficient credits. Please check your OpenRouter account.";
      }

      return new Response(JSON.stringify({
        error: errorMessage,
        retryAfter: response.headers.get('retry-after')
      }), { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error(`❌ No content generated from OpenRouter`);
      return new Response(JSON.stringify({
        error: "No content was generated. Please try again."
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log successful request
    const usage = data.usage || {};
    const estimatedCost = calculateCost(selectedModel, usage.prompt_tokens || 0, usage.completion_tokens || 0);

    await supabase.from('llm_usage_logs').insert({
      user_id,
      provider: 'openrouter',
      model: selectedModel,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      cost_estimate: estimatedCost,
      request_duration_ms: duration,
      success: true
    });

    console.log(`✅ Content generated successfully (${usage.total_tokens || 0} tokens, ~$${estimatedCost})`);

    return new Response(JSON.stringify({
      generatedText,
      model: selectedModel,
      usage: usage,
      costEstimate: estimatedCost,
      duration: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(`💥 Error in OpenRouter content generation: ${error.message}`);
    return new Response(JSON.stringify({
      error: "Unexpected error during content generation"
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Rough cost estimation based on common model pricing
function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricingMap: { [key: string]: { input: number, output: number } } = {
    'openai/gpt-4': { input: 0.00003, output: 0.00006 },
    'openai/gpt-4-turbo': { input: 0.00001, output: 0.00003 },
    'openai/gpt-3.5-turbo': { input: 0.000001, output: 0.000002 },
    'anthropic/claude-3-opus': { input: 0.000015, output: 0.000075 },
    'anthropic/claude-3-sonnet': { input: 0.000003, output: 0.000015 },
    'anthropic/claude-3-haiku': { input: 0.00000025, output: 0.00000125 },
    'mistralai/mistral-7b-instruct': { input: 0.00000013, output: 0.00000013 },
    'meta-llama/llama-3-70b-instruct': { input: 0.00000059, output: 0.00000079 }
  };

  const pricing = pricingMap[model] || { input: 0.00001, output: 0.00002 }; // Default pricing
  
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  
  return parseFloat((inputCost + outputCost).toFixed(6));
}