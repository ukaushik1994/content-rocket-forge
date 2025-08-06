import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, service, endpoint, params, apiKey, userId } = await req.json();
    
    // Support both 'provider' and 'service' keys for backward compatibility
    const selectedProvider = provider || service;
    
    console.log(`🚀 AI Proxy called for ${selectedProvider}/${endpoint} by user ${userId}`);

    // If specific provider/service is requested, use it directly
    if (selectedProvider && selectedProvider !== 'auto') {
      return await handleSpecificService(selectedProvider, endpoint, params, apiKey);
    }

    // Auto-selection: Query database for user's providers with priority
    if (userId) {
      return await handleAutoService(userId, endpoint, params);
    }

    // Fallback to OpenRouter if no user context
    return await handleOpenRouterRequest(endpoint, params, apiKey);

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

async function handleAutoService(userId: string, endpoint: string, params: any) {
  console.log(`🔍 Auto-selecting AI provider for user ${userId}`);
  
  try {
    // Query user's AI providers ordered by priority
    const { data: providers, error } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error('Failed to fetch user providers');
    }

    if (!providers || providers.length === 0) {
      console.log('⚠️ No providers configured, falling back to default');
      throw new Error('No AI providers configured. Please add an API key in settings.');
    }

    console.log(`📋 Found ${providers.length} providers for user`);

    // Try each provider in priority order
    for (const provider of providers) {
      try {
        console.log(`🔄 Trying provider: ${provider.provider} (priority: ${provider.priority})`);
        
        const result = await handleSpecificService(
          provider.provider, 
          endpoint, 
          params, 
          provider.api_key
        );
        
        // Update last successful use
        await updateProviderStatus(provider.id, 'active', null);
        
        console.log(`✅ Success with ${provider.provider}`);
        return result;
        
      } catch (providerError) {
        console.error(`❌ ${provider.provider} failed:`, providerError.message);
        
        // Update provider status with error
        await updateProviderStatus(provider.id, 'error', providerError.message);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error('All configured AI providers failed. Please check your API keys.');

  } catch (error) {
    console.error('💥 Auto-service failed:', error);
    throw error;
  }
}

async function updateProviderStatus(providerId: string, status: string, errorMessage: string | null) {
  try {
    await supabase
      .from('ai_service_providers')
      .update({
        status,
        error_message: errorMessage,
        last_verified: new Date().toISOString()
      })
      .eq('id', providerId);
  } catch (error) {
    console.error('Failed to update provider status:', error);
  }
}

async function handleSpecificService(service: string, endpoint: string, params: any, apiKey: string) {
  if (!apiKey) {
    throw new Error(`${service.toUpperCase()} API key is required`);
  }

  switch (service) {
    case 'openrouter':
      return await handleOpenRouterRequest(endpoint, params, apiKey);
    case 'openai':
      if (endpoint === 'chat') return await callOpenAI(apiKey, params);
      if (endpoint === 'test') return await testOpenAI(apiKey);
      break;
    case 'anthropic':
      if (endpoint === 'chat') return await callAnthropic(apiKey, params);
      if (endpoint === 'test') return await testAnthropic(apiKey);
      break;
    case 'gemini':
      if (endpoint === 'chat') return await callGemini(apiKey, params);
      if (endpoint === 'test') return await testGemini(apiKey);
      break;
    case 'mistral':
      if (endpoint === 'chat') return await callMistral(apiKey, params);
      if (endpoint === 'test') return await testMistral(apiKey);
      break;
    case 'lmstudio':
      if (endpoint === 'chat') return await callLMStudio(apiKey, params);
      if (endpoint === 'test') return await testLMStudio(apiKey);
      break;
    default:
      throw new Error(`AI provider '${service}' not supported`);
  }
  
  throw new Error(`Endpoint '${endpoint}' not supported for ${service}`);
}

async function handleOpenRouterRequest(endpoint: string, params: any, apiKey: string) {
  console.log('🔄 Routing to OpenRouter API');
  
  if (endpoint === 'chat') {
    return await callOpenRouter(apiKey, params);
  }
  
  if (endpoint === 'test') {
    return await testOpenRouter(apiKey);
  }
  
  throw new Error(`OpenRouter endpoint '${endpoint}' not supported`);
}

// OpenRouter implementation
async function testOpenRouter(apiKey: string) {
  console.log('🧪 Testing OpenRouter API key');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app.com',
      'X-Title': 'AI Content Assistant'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'Test' }],
      temperature: 0.1,
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter API connection failed: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ OpenRouter test successful`);
  
  return new Response(JSON.stringify({
    valid: true,
    message: 'OpenRouter API connection successful',
    model: data.model || 'openai/gpt-4o-mini'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callOpenRouter(apiKey: string, params: any) {
  const { model = 'openai/gpt-4o-mini', messages, temperature = 0.7, maxTokens = 2000 } = params;

  console.log(`📤 OpenRouter request: model=${model}, messages=${messages.length}`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app.com',
      'X-Title': 'AI Content Assistant'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 OpenRouter response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// OpenAI implementation
async function testOpenAI(apiKey: string) {
  console.log('🧪 Testing OpenAI API key');
  
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API connection failed: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ OpenAI test successful`);
  
  return new Response(JSON.stringify({
    valid: true,
    message: 'OpenAI API connection successful',
    models: data.data?.slice(0, 3) || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callOpenAI(apiKey: string, params: any) {
  const { model = 'gpt-4o-mini', messages, temperature = 0.7, maxTokens = 2000 } = params;

  console.log(`📤 OpenAI request: model=${model}, messages=${messages.length}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 OpenAI response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Anthropic implementation
async function testAnthropic(apiKey: string) {
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
      messages: [{ role: 'user', content: 'Test' }]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API connection failed: ${errorData.error?.message || response.statusText}`);
  }

  console.log(`✅ Anthropic test successful`);
  
  return new Response(JSON.stringify({
    valid: true,
    message: 'Anthropic API connection successful'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callAnthropic(apiKey: string, params: any) {
  const { model = 'claude-3-haiku-20240307', messages, temperature = 0.7, maxTokens = 2000 } = params;
  
  console.log(`📤 Anthropic request: model=${model}, messages=${messages.length}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: messages.find(m => m.role === 'system')?.content || '',
      messages: messages.filter(m => m.role !== 'system')
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 Anthropic response: ${data.content[0]?.text?.substring(0, 100)}...`);
  
  // Transform to OpenAI-compatible format
  const openAIFormat = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: data.model || model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: data.content[0]?.text || ''
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    }
  };

  return new Response(JSON.stringify(openAIFormat), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Gemini implementation
async function testGemini(apiKey: string) {
  console.log('🧪 Testing Gemini API key');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Test' }]
      }],
      generationConfig: {
        maxOutputTokens: 10,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API connection failed: ${response.status} ${response.statusText}`);
  }

  console.log(`✅ Gemini test successful`);
  
  return new Response(JSON.stringify({
    valid: true,
    message: 'Gemini API connection successful'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callGemini(apiKey: string, params: any) {
  const { model = 'gemini-1.5-pro', messages, temperature = 0.7, maxTokens = 2000 } = params;
  
  console.log(`📤 Gemini request: model=${model}, messages=${messages.length}`);
  
  // Convert messages to Gemini format
  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const geminiMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const requestBody = {
    contents: geminiMessages,
    systemInstruction: systemPrompt ? {
      parts: [{ text: systemPrompt }]
    } : undefined,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content generated by Gemini');
  }

  console.log(`📥 Gemini response: ${content.substring(0, 100)}...`);
  
  // Transform to OpenAI-compatible format
  const openAIFormat = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: content
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0
    }
  };

  return new Response(JSON.stringify(openAIFormat), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Mistral implementation
async function testMistral(apiKey: string) {
  console.log('🧪 Testing Mistral API key');
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 10
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Mistral API connection failed: ${errorData.error?.message || response.statusText}`);
  }

  console.log(`✅ Mistral test successful`);
  
  return new Response(JSON.stringify({
    valid: true,
    message: 'Mistral API connection successful'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callMistral(apiKey: string, params: any) {
  const { model = 'mistral-small', messages, temperature = 0.7, maxTokens = 2000 } = params;

  console.log(`📤 Mistral request: model=${model}, messages=${messages.length}`);

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 Mistral response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// LM Studio implementation  
async function testLMStudio(apiKey: string) {
  console.log('🧪 Testing LM Studio connection');
  
  // LM Studio typically runs on localhost:1234
  const baseUrl = apiKey || 'http://localhost:1234';
  
  const response = await fetch(`${baseUrl}/v1/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LM Studio connection failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ LM Studio test successful`);
  
  return new Response(JSON.stringify({
    valid: true,
    message: 'LM Studio connection successful',
    models: data.data?.slice(0, 3) || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callLMStudio(apiKey: string, params: any) {
  const { model = 'local-model', messages, temperature = 0.7, maxTokens = 2000 } = params;
  
  // LM Studio typically runs on localhost:1234
  const baseUrl = apiKey || 'http://localhost:1234';

  console.log(`📤 LM Studio request: model=${model}, messages=${messages.length}`);

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`LM Studio API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 LM Studio response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}