import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { service, endpoint, params } = await req.json();
    
    console.log(`🚀 AI Proxy called for ${service}/${endpoint}`);

    // Route to OpenRouter if service is 'openrouter'
    if (service === 'openrouter') {
      return await handleOpenRouterRequest(endpoint, params);
    }

    // Route to other AI services via external APIs
    return await handleGenericAIRequest(service, endpoint, params);

  } catch (error) {
    console.error('❌ AI Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleOpenRouterRequest(endpoint: string, params: any) {
  console.log('🔄 Routing to OpenRouter API');
  
  // This will be handled by the openrouter-content-generator function
  // For now, return an error directing users to use the specific function
  throw new Error('OpenRouter requests should use the openrouter-content-generator function directly');
}

async function handleGenericAIRequest(service: string, endpoint: string, params: any) {
  console.log(`🔄 Routing to ${service} API`);
  
  // For now, return a placeholder response
  // Real implementation would need API keys and proper routing
  throw new Error(`Generic AI routing not yet implemented for ${service}. Please configure OpenRouter instead.`);
}