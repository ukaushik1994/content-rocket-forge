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

    // Validate and sanitize the API key
    const sanitizedKey = typeof api_key === 'string' ? api_key.trim() : '';
    
    if (!sanitizedKey) {
      console.error(`❌ Invalid API key format: empty or not a string`);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid API key format"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for valid characters (basic validation for OpenRouter keys)
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(sanitizedKey)) {
      console.error(`❌ API key contains invalid characters`);
      return new Response(JSON.stringify({
        success: false,
        error: "API key contains invalid characters"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Verifying OpenRouter API key (length: ${sanitizedKey.length})`);

    // Construct headers safely
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Add authorization header with validation
    try {
      requestHeaders["Authorization"] = `Bearer ${sanitizedKey}`;
    } catch (error) {
      console.error(`❌ Failed to construct Authorization header: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid API key format for authorization"
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📡 Making request to OpenRouter API with headers:`, Object.keys(requestHeaders));

    // Test the key by getting available models
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: requestHeaders
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
    
    // Prioritize free models first, then popular models
    const freeModels = models.filter((model: any) => 
      model.pricing?.prompt === "0" || 
      model.pricing?.completion === "0" ||
      model.id.includes('free') ||
      model.id.includes('hermes') ||
      model.id.includes('mixtral')
    );
    
    const preferredModels = [
      // Free models first
      'meta-llama/llama-3.2-3b-instruct:free',
      'meta-llama/llama-3.2-1b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'huggingfaceh4/zephyr-7b-beta:free',
      'openchat/openchat-7b:free',
      // Then popular paid models
      'openai/gpt-4o',
      'openai/gpt-4-turbo',
      'anthropic/claude-3-5-sonnet',
      'anthropic/claude-3-opus',
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

    // If no preferred model found, use the first free model or any model
    if (!defaultModel) {
      if (freeModels.length > 0) {
        defaultModel = freeModels[0].id;
      } else if (models.length > 0) {
        defaultModel = models[0].id;
      }
    }

    // Sort models: free first, then by provider and popularity
    const sortedModels = models.sort((a: any, b: any) => {
      const aIsFree = a.pricing?.prompt === "0" || a.pricing?.completion === "0" || a.id.includes('free');
      const bIsFree = b.pricing?.prompt === "0" || b.pricing?.completion === "0" || b.id.includes('free');
      
      if (aIsFree && !bIsFree) return -1;
      if (!aIsFree && bIsFree) return 1;
      
      return a.id.localeCompare(b.id);
    });

    console.log(`✅ OpenRouter key verified. Default model: ${defaultModel}, Total models: ${models.length}, Free models: ${freeModels.length}`);

    return new Response(JSON.stringify({
      success: true,
      model: defaultModel,
      modelCount: models.length,
      freeModelCount: freeModels.length,
      availableModels: sortedModels.map((m: any) => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing,
        context_length: m.context_length,
        architecture: m.architecture,
        top_provider: m.top_provider,
        per_request_limits: m.per_request_limits
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