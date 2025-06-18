import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log('🚀 API-Proxy Edge Function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, endpoint, apiKey, params } = await req.json();
    
    console.log(`📥 Request received: ${service} - ${endpoint}`, {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyType: typeof apiKey
    });

    // Validate that we have an API key
    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ No API key provided by user');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key is required. Please configure your API key in Settings.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (service) {
      case 'serp':
        return await handleSerpApi(endpoint, apiKey, params);
      case 'serpstack':
        return await handleSerpstackApi(endpoint, apiKey, params);
      case 'openai':
        return await handleOpenAIApi(endpoint, apiKey, params);
      case 'anthropic':
        return await handleAnthropicApi(endpoint, apiKey, params);
      case 'gemini':
        return await handleGeminiApi(endpoint, apiKey, params);
      default:
        console.error(`❌ Unsupported service: ${service}`);
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported service: ${service}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error: any) {
    console.error('💥 API Proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleSerpApi(endpoint: string, apiKey: string, params?: any) {
  console.log('🔍 Processing SerpAPI request');
  
  if (endpoint === 'test') {
    return await testSerpApi(apiKey);
  }
  
  // Handle other SerpAPI endpoints here
  return new Response(
    JSON.stringify({ success: false, error: 'SerpAPI endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleSerpstackApi(endpoint: string, apiKey: string, params?: any) {
  console.log('🔍 Processing Serpstack request');
  
  if (endpoint === 'test') {
    return await testSerpstackApi(apiKey);
  }
  
  // Handle other Serpstack endpoints here
  return new Response(
    JSON.stringify({ success: false, error: 'Serpstack endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function testSerpApi(apiKey: string) {
  try {
    console.log('🧪 Testing SerpAPI key');
    
    const response = await fetch('https://serpapi.com/search.json?engine=google&q=test&api_key=' + apiKey);
    const data = await response.json();
    
    if (response.ok && !data.error) {
      console.log('✅ SerpAPI test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SerpAPI connection successful',
          provider: 'SerpAPI'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('❌ SerpAPI test failed:', data);
      throw new Error(data.error || 'SerpAPI test failed');
    }
  } catch (error: any) {
    console.error('💥 SerpAPI test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'SerpAPI test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function testSerpstackApi(apiKey: string) {
  try {
    console.log('🧪 Testing Serpstack API key');
    console.log('🔧 API Key Details:', {
      length: apiKey.length,
      type: typeof apiKey,
      firstChars: apiKey.substring(0, 8) + '...',
      lastChars: '...' + apiKey.substring(apiKey.length - 4)
    });
    
    // Use HTTPS instead of HTTP and add proper parameters for Serpstack
    const testUrl = `https://api.serpstack.com/search?access_key=${encodeURIComponent(apiKey)}&query=test&num=1&gl=us&hl=en`;
    console.log('📡 Making request to Serpstack API');
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Serpstack-API-Test/1.0'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 Serpstack response status:', response.status);
    console.log('📊 Serpstack response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success !== false) {
      // Check if we have organic results or valid response structure
      if (data.organic_results || data.search_metadata || data.search_information) {
        console.log('✅ Serpstack API test successful');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Serpstack API connection successful',
            provider: 'Serpstack',
            data: {
              totalResults: data.search_information?.total_results || 0,
              organicCount: data.organic_results?.length || 0
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (data.error) {
        console.error('❌ Serpstack API error:', data.error);
        const errorMessage = data.error.info || data.error.message || JSON.stringify(data.error);
        throw new Error(`Serpstack API error: ${errorMessage}`);
      } else {
        console.log('⚠️ Serpstack API responded but with unexpected format:', data);
        throw new Error('Serpstack API responded with unexpected format - please check your API key');
      }
    } else {
      console.error('❌ Serpstack API error response:', data);
      const errorMessage = data.error?.info || data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Serpstack API error: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('💥 Serpstack API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Serpstack API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleOpenAIApi(endpoint: string, apiKey: string, params?: any) {
  if (endpoint === 'test') {
    return await testOpenAIApi(apiKey);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'OpenAI endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function testOpenAIApi(apiKey: string) {
  try {
    console.log('🧪 Testing OpenAI API key');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ OpenAI API test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OpenAI API connection successful',
          provider: 'OpenAI'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const data = await response.json();
      console.error('❌ OpenAI API test failed:', data);
      throw new Error(data.error?.message || 'OpenAI API test failed');
    }
  } catch (error: any) {
    console.error('💥 OpenAI API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'OpenAI API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleAnthropicApi(endpoint: string, apiKey: string, params?: any) {
  if (endpoint === 'test') {
    return await testAnthropicApi(apiKey);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'Anthropic endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function testAnthropicApi(apiKey: string) {
  try {
    console.log('🧪 Testing Anthropic API key');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    
    if (response.ok) {
      console.log('✅ Anthropic API test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Anthropic API connection successful',
          provider: 'Anthropic'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const data = await response.json();
      console.error('❌ Anthropic API test failed:', data);
      throw new Error(data.error?.message || 'Anthropic API test failed');
    }
  } catch (error: any) {
    console.error('💥 Anthropic API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Anthropic API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleGeminiApi(endpoint: string, apiKey: string, params?: any) {
  if (endpoint === 'test') {
    return await testGeminiApi(apiKey);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'Gemini endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function testGeminiApi(apiKey: string) {
  try {
    console.log('🧪 Testing Gemini API key');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (response.ok) {
      console.log('✅ Gemini API test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Gemini API connection successful',
          provider: 'Gemini'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const data = await response.json();
      console.error('❌ Gemini API test failed:', data);
      throw new Error(data.error?.message || 'Gemini API test failed');
    }
  } catch (error: any) {
    console.error('💥 Gemini API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Gemini API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
