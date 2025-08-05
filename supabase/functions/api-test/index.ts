
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsPreflightRequest } from "../shared/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../shared/errors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { service, apiKey } = await req.json();
    
    console.log(`API Test: Testing ${service} API key`);
    
    if (!apiKey) {
      return createErrorResponse('API key is required for testing', 400, service, 'test');
    }
    
    // Route to appropriate proxy service for testing
    let proxyUrl: string;
    let requestBody: any;
    
    if (['openai', 'anthropic', 'gemini', 'mistral', 'openrouter'].includes(service)) {
      proxyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-proxy`;
      requestBody = { service, endpoint: 'test', apiKey };
    } else if (service === 'serp') {
      proxyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/serp-proxy`;
      requestBody = { endpoint: 'test', apiKey };
    } else if (['google-analytics', 'google-search-console'].includes(service)) {
      proxyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-proxy`;
      requestBody = { service, endpoint: 'test', apiKey };
    } else {
      return createErrorResponse(`Unsupported service for testing: ${service}`, 400, service, 'test');
    }
    
    // Call the appropriate proxy function
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return createSuccessResponse(data);
    } else {
      return createErrorResponse(data.error || `${service} API test failed`, response.status, service, 'test');
    }
  } catch (error: any) {
    return createErrorResponse(error.message || 'Unknown error', 500, 'api-test', 'unknown');
  }
});
