// AI Proxy Edge Function
// Handles requests to various AI providers (OpenAI, Anthropic, Gemini, etc.)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AiRequest {
  service: string;
  endpoint: string;
  apiKey: string;
  params?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI-Proxy Edge Function called');
    
    const { service, endpoint, apiKey, params } = await req.json() as AiRequest;
    
    console.log(`📥 Request received: ${service} - ${endpoint}`, {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyType: typeof apiKey,
      paramsReceived: Object.keys(params || {})
    });

    if (!service || !endpoint) {
      throw new Error('Missing required parameters: service and endpoint');
    }

    if (!apiKey) {
      throw new Error(`No API key provided for ${service}`);
    }

    let result;
    
    switch (service) {
      case 'openai':
        result = await handleOpenAI(endpoint, apiKey, params);
        break;
      case 'anthropic':
        result = await handleAnthropic(endpoint, apiKey, params);
        break;
      case 'gemini':
        result = await handleGemini(endpoint, apiKey, params);
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 AI-Proxy error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleOpenAI(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing OpenAI request: ${endpoint}`);
  
  if (endpoint === 'test') {
    return await testOpenAI(apiKey);
  }
  
  if (endpoint === 'chat') {
    return await chatOpenAI(apiKey, params);
  }
  
  if (endpoint === 'completion') {
    return await completionOpenAI(apiKey, params);
  }
  
  throw new Error(`Unsupported OpenAI endpoint: ${endpoint}`);
}

async function testOpenAI(apiKey: string) {
  console.log('🧪 Testing OpenAI API key');
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI test failed:', response.status, errorData);
      throw new Error(`OpenAI API test failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI test successful');
    
    return {
      success: true,
      provider: 'OpenAI',
      message: 'OpenAI connection successful',
      models: data.data?.slice(0, 5).map((model: any) => model.id) || []
    };
  } catch (error: any) {
    console.error('💥 OpenAI test exception:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

async function chatOpenAI(apiKey: string, params: any) {
  console.log('💬 Processing OpenAI chat request');
  
  const model = params.model || 'gpt-4';
  const isNewerModel = model.includes('gpt-5') || model.includes('o3') || model.includes('o4') || model.includes('gpt-4.1');
  
  const requestBody: any = {
    model,
    messages: params.messages || [],
    ...params
  };

  // Handle token limits based on model type
  if (isNewerModel) {
    // Newer models use max_completion_tokens and don't support temperature
    if (params.maxTokens || params.max_tokens) {
      requestBody.max_completion_tokens = params.maxTokens || params.max_tokens || 1000;
    }
    // Remove temperature for newer models
    delete requestBody.temperature;
  } else {
    // Legacy models use max_tokens and support temperature
    if (params.maxTokens || params.max_tokens) {
      requestBody.max_tokens = params.maxTokens || params.max_tokens || 1000;
    }
    requestBody.temperature = params.temperature || 0.7;
  }

  // Clean up unused parameters
  delete requestBody.maxTokens;
  delete requestBody.max_tokens;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI chat failed:', response.status, errorData);
      throw new Error(`OpenAI chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI chat successful');
    
    return {
      success: true,
      data,
      provider: 'OpenAI'
    };
  } catch (error: any) {
    console.error('💥 OpenAI chat exception:', error);
    throw new Error(`OpenAI chat error: ${error.message}`);
  }
}

async function completionOpenAI(apiKey: string, params: any) {
  console.log('📝 Processing OpenAI completion request');
  
  // For completion requests, convert to chat format if needed
  const messages = params.messages || [
    { role: 'user', content: params.prompt || params.input || 'Hello' }
  ];

  return await chatOpenAI(apiKey, { ...params, messages });
}

async function handleAnthropic(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing Anthropic request: ${endpoint}`);
  
  if (endpoint === 'test') {
    return await testAnthropic(apiKey);
  }
  
  if (endpoint === 'chat' || endpoint === 'completion') {
    return await chatAnthropic(apiKey, params);
  }
  
  throw new Error(`Unsupported Anthropic endpoint: ${endpoint}`);
}

async function testAnthropic(apiKey: string) {
  console.log('🧪 Testing Anthropic API key');
  
  try {
    // Test with a simple message
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Anthropic test failed:', response.status, errorData);
      throw new Error(`Anthropic API test failed: ${response.statusText}`);
    }

    console.log('✅ Anthropic test successful');
    
    return {
      success: true,
      provider: 'Anthropic',
      message: 'Anthropic connection successful'
    };
  } catch (error: any) {
    console.error('💥 Anthropic test exception:', error);
    throw new Error(`Anthropic API error: ${error.message}`);
  }
}

async function chatAnthropic(apiKey: string, params: any) {
  console.log('💬 Processing Anthropic chat request');
  
  const requestBody = {
    model: params.model || 'claude-3-sonnet-20240229',
    max_tokens: params.maxTokens || params.max_tokens || 1000,
    messages: params.messages || [],
    temperature: params.temperature || 0.7,
    ...params
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Anthropic chat failed:', response.status, errorData);
      throw new Error(`Anthropic chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Anthropic chat successful');
    
    return {
      success: true,
      data,
      provider: 'Anthropic'
    };
  } catch (error: any) {
    console.error('💥 Anthropic chat exception:', error);
    throw new Error(`Anthropic chat error: ${error.message}`);
  }
}

async function handleGemini(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing Gemini request: ${endpoint}`);
  
  if (endpoint === 'test') {
    return await testGemini(apiKey);
  }
  
  if (endpoint === 'chat' || endpoint === 'completion') {
    return await chatGemini(apiKey, params);
  }
  
  throw new Error(`Unsupported Gemini endpoint: ${endpoint}`);
}

async function testGemini(apiKey: string) {
  console.log('🧪 Testing Gemini API key');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Gemini test failed:', response.status, errorData);
      throw new Error(`Gemini API test failed: ${response.statusText}`);
    }

    console.log('✅ Gemini test successful');
    
    return {
      success: true,
      provider: 'Gemini',
      message: 'Gemini connection successful'
    };
  } catch (error: any) {
    console.error('💥 Gemini test exception:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

async function chatGemini(apiKey: string, params: any) {
  console.log('💬 Processing Gemini chat request');
  
  // Convert messages to Gemini format
  const contents = params.messages?.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  })) || [{ role: 'user', parts: [{ text: params.prompt || 'Hello' }] }];

  const requestBody = {
    contents,
    generationConfig: {
      temperature: params.temperature || 0.7,
      maxOutputTokens: params.maxTokens || params.max_tokens || 1000,
    }
  };

  try {
    const model = params.model || 'gemini-pro';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Gemini chat failed:', response.status, errorData);
      throw new Error(`Gemini chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Gemini chat successful');
    
    return {
      success: true,
      data,
      provider: 'Gemini'
    };
  } catch (error: any) {
    console.error('💥 Gemini chat exception:', error);
    throw new Error(`Gemini chat error: ${error.message}`);
  }
}