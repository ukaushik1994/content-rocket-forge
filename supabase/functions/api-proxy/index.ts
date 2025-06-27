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
  } else if (endpoint === 'analyze') {
    return await analyzeSerpstackKeyword(apiKey, params);
  } else if (endpoint === 'search') {
    return await searchSerpstack(apiKey, params);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'Serpstack endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function analyzeSerpstackKeyword(apiKey: string, params: any) {
  try {
    console.log('🎯 Analyzing keyword with Serpstack:', params.keyword);
    
    const searchParams = new URLSearchParams({
      access_key: apiKey,
      query: params.keyword,
      num: '10',
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://api.serpstack.com/search?${searchParams}`);
    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      throw new Error(data.error?.info || 'Serpstack API request failed');
    }

    // Transform Serpstack data to match our expected format
    const transformedData = transformSerpstackData(data, params.keyword);
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 Serpstack analyze error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Serpstack analysis failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function searchSerpstack(apiKey: string, params: any) {
  try {
    console.log('🔍 Searching with Serpstack:', params.q);
    
    const searchParams = new URLSearchParams({
      access_key: apiKey,
      query: params.q || params.keyword,
      num: (params.limit || 10).toString(),
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://api.serpstack.com/search?${searchParams}`);
    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      throw new Error(data.error?.info || 'Serpstack API request failed');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 Serpstack search error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Serpstack search failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

function transformSerpstackData(data: any, keyword: string) {
  console.log('🔄 Transforming Serpstack data for keyword:', keyword);
  
  // Estimate search volume based on total results (Serpstack doesn't provide volume directly)
  const totalResults = data.search_information?.total_results || 0;
  const estimatedVolume = Math.floor(totalResults / 10000); // Rough estimation
  
  // Extract organic results
  const organicResults = data.organic_results || [];
  
  // Extract related searches
  const relatedSearches = data.related_searches || [];
  
  return {
    keyword,
    searchVolume: estimatedVolume,
    competitionScore: Math.min(organicResults.length / 10, 0.9),
    keywordDifficulty: Math.min(Math.floor((organicResults.length / 10) * 100 + Math.random() * 20), 100),
    volumeMetadata: {
      source: 'serpstack_estimate',
      confidence: 'low',
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString()
    },
    competitionMetadata: {
      source: 'serpstack_estimate',
      engine: 'google'
    },
    isMockData: false,
    isGoogleData: true,
    dataQuality: 'low',
    entities: [],
    peopleAlsoAsk: [],
    headings: [],
    contentGaps: [],
    topResults: organicResults.slice(0, 5).map((result: any, index: number) => ({
      title: result.title || '',
      link: result.url || '',
      snippet: result.snippet || '',
      position: result.position || index + 1,
      source: 'serpstack_organic'
    })),
    relatedSearches: relatedSearches.map((search: any) => ({
      query: search.query || '',
      source: 'serpstack_related_searches'
    })),
    keywords: relatedSearches.map((s: any) => s.query).filter(Boolean),
    recommendations: [
      'Data sourced from Serpstack API with estimated metrics',
      'Consider using SerpAPI for more accurate search volume data',
      'Serpstack provides good organic results and competitor analysis'
    ],
    featuredSnippets: []
  };
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
    
    // Fix the Serpstack API endpoint - use correct base URL without www
    const testUrl = `https://api.serpstack.com/search?access_key=${encodeURIComponent(apiKey)}&query=test&num=1`;
    console.log('📡 Making request to Serpstack API:', testUrl.replace(apiKey, '[REDACTED]'));
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ContentRocketForge-API-Test/1.0',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 Serpstack response status:', response.status);
    console.log('📊 Serpstack response data:', JSON.stringify(data, null, 2));
    
    // Handle successful responses
    if (response.ok) {
      // Check for API errors in successful HTTP responses
      if (data.success === false && data.error) {
        console.error('❌ Serpstack API error in response:', data.error);
        const errorMessage = data.error.info || data.error.message || JSON.stringify(data.error);
        
        // Provide specific error messages for common issues
        if (data.error.code === 101 || data.error.type === 'invalid_access_key') {
          throw new Error('Invalid Serpstack API key. Please check your API key and try again.');
        } else if (data.error.code === 102) {
          throw new Error('Serpstack API key is inactive. Please activate your API key.');
        } else if (data.error.code === 103) {
          throw new Error('Serpstack API usage limit reached. Please upgrade your plan.');
        } else {
          throw new Error(`Serpstack API error: ${errorMessage}`);
        }
      }
      
      // Check for valid response structure
      if (data.search_metadata || data.search_information || data.organic_results || data.success !== false) {
        console.log('✅ Serpstack API test successful');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Serpstack API connection successful',
            provider: 'Serpstack',
            data: {
              totalResults: data.search_information?.total_results || 0,
              organicCount: data.organic_results?.length || 0,
              hasMetadata: !!data.search_metadata
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log('⚠️ Serpstack API responded but with unexpected format:', data);
        throw new Error('Serpstack API responded with unexpected format - please verify your API key');
      }
    } else {
      // Handle HTTP error responses
      console.error('❌ Serpstack HTTP error response:', response.status, response.statusText);
      const errorMessage = data?.error?.info || data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Serpstack API error: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('💥 Serpstack API test exception:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.message.includes('fetch')) {
      userMessage = 'Network error connecting to Serpstack API. Please check your internet connection.';
    } else if (error.message.includes('JSON')) {
      userMessage = 'Invalid response from Serpstack API. Please try again.';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: userMessage
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
