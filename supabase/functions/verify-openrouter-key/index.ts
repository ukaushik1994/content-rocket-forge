import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_key } = await req.json();

    if (!api_key) {
      return new Response(JSON.stringify({
        success: false,
        error: "API key is required"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Verifying OpenRouter API key (length: ${api_key.length})`);

    // Test the key by getting available models
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${api_key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost:3000", // Required by OpenRouter
        "X-Title": "Content Rocket Forge" // Required by OpenRouter
      }
    });

    console.log(`📡 OpenRouter API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenRouter API error: ${errorText}`);
      
      let errorMessage = "Invalid or unauthorized key";
      if (response.status === 401) {
        errorMessage = "Invalid API key or unauthorized access";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (response.status === 403) {
        errorMessage = "API key does not have required permissions";
      }

      return new Response(JSON.stringify({
        success: false,
        error: errorMessage
      }), { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log(`📊 OpenRouter models response: Found ${data.data?.length || 0} models`);

    // Get the available models and find a suitable default
    const models = data.data || [];
    
    // Prioritize GPT-4 models, then Claude, then others
    const preferredModels = [
      'openai/gpt-4',
      'openai/gpt-4-turbo',
      'openai/gpt-4o',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'meta-llama/llama-3-70b-instruct',
      'mistralai/mistral-7b-instruct'
    ];

    let defaultModel = null;
    
    // Find the first available preferred model
    for (const preferred of preferredModels) {
      const found = models.find((model: any) => model.id === preferred);
      if (found) {
        defaultModel = preferred;
        break;
      }
    }

    // If no preferred model found, use the first available model
    if (!defaultModel && models.length > 0) {
      defaultModel = models[0].id;
    }

    console.log(`✅ OpenRouter key verified. Default model: ${defaultModel}`);

    return new Response(JSON.stringify({
      success: true,
      model: defaultModel,
      modelCount: models.length,
      availableModels: models.slice(0, 10).map((m: any) => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing
      }))
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(`💥 Error verifying OpenRouter key: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      error: "Unexpected error while verifying API key"
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});