
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SerpAPIRequest {
  service: 'serp' | 'serpstack';
  endpoint: 'test' | 'search';
  params: any;
  apiKey: string;
}

interface OpenAIRequest {
  service: 'openai';
  endpoint: 'chat' | 'completion';
  params: {
    messages: Array<{role: string, content: string}>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  apiKey: string;
}

type APIRequest = SerpAPIRequest | OpenAIRequest;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 API-Proxy Edge Function called');

  try {
    const body: APIRequest = await req.json();
    const { service, endpoint, params, apiKey } = body;

    console.log(`📥 Request received: ${service} - ${endpoint}`, {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyType: typeof apiKey,
      paramsReceived: Object.keys(params || {})
    });

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let response;

    switch (service) {
      case 'openai':
        response = await handleOpenAI(endpoint as 'chat' | 'completion', params, apiKey);
        break;
      case 'serp':
        response = await handleSerpAPI(endpoint as 'test' | 'search', params, apiKey);
        break;
      case 'serpstack':
        response = await handleSerpstack(endpoint as 'test' | 'search', params, apiKey);
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('API Proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'API request failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleOpenAI(endpoint: 'chat' | 'completion', params: any, apiKey: string) {
  console.log('🤖 Processing OpenAI request');
  
  const openAIUrl = 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(openAIUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model || 'gpt-4o-mini',
      messages: params.messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  return await response.json();
}

async function handleSerpAPI(endpoint: 'test' | 'search', params: any, apiKey: string) {
  console.log('🔍 Processing SerpAPI request');
  console.log(`🧪 Testing SerpAPI connection with key length: ${apiKey.length}`);
  
  if (endpoint === 'test') {
    // Test the API key with a simple search
    const testUrl = `https://serpapi.com/search.json?engine=google&q=test&api_key=${apiKey}&num=1`;
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('🧪 SerpAPI test response:', { 
      status: response.status, 
      hasError: !!data.error,
      errorMessage: data.error
    });
    
    if (data.error) {
      throw new Error(`SerpAPI test failed: ${data.error}`);
    }
    
    console.log('✅ SerpAPI test successful');
    return { success: true, message: 'SerpAPI connection verified' };
  }
  
  // Handle actual search requests
  const { query, location = 'United States', num = 10 } = params;
  const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&num=${num}&api_key=${apiKey}`;
  
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`SerpAPI search failed: ${data.error}`);
  }
  
  return data;
}

async function handleSerpstack(endpoint: 'test' | 'search', params: any, apiKey: string) {
  console.log('🔍 Processing Serpstack request');
  
  console.log(`🔑 Using API key for serpstack (length: ${apiKey.length})`);
  
  if (endpoint === 'test') {
    console.log('🧪 Testing Serpstack API key');
    console.log('🔧 API Key Details:', {
      length: apiKey.length,
      type: typeof apiKey,
      firstChars: apiKey.substring(0, 8) + '...',
      lastChars: '...' + apiKey.substring(apiKey.length - 4)
    });
    
    const testUrl = `https://api.serpstack.com/search?access_key=${apiKey}&query=test&num=1`;
    console.log('📡 Making request to Serpstack API:', testUrl.replace(apiKey, '[REDACTED]'));
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('📊 Serpstack response status:', response.status);
    console.log('📊 Serpstack response data:', data);
    
    if (data.error) {
      throw new Error(`Serpstack test failed: ${data.error.info || 'Unknown error'}`);
    }
    
    console.log('✅ Serpstack API test successful');
    return { success: true, message: 'Serpstack connection verified' };
  }
  
  // Handle actual search requests
  const { query, location = 'United States', num = 10 } = params;
  const searchUrl = `https://api.serpstack.com/search?access_key=${apiKey}&query=${encodeURIComponent(query)}&country=${encodeURIComponent(location)}&num=${num}`;
  
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Serpstack search failed: ${data.error.info || 'Unknown error'}`);
  }
  
  return data;
}
