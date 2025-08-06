import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { service, endpoint, params, apiKey } = await req.json();
    
    console.log(`🚀 AI Proxy called for ${service}/${endpoint}`);

    // Route to OpenRouter if service is 'openrouter'
    if (service === 'openrouter') {
      return await handleOpenRouterRequest(endpoint, params, apiKey);
    }

    // Route to other AI services via external APIs
    return await handleGenericAIRequest(service, endpoint, params, apiKey);

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

async function handleGenericAIRequest(service: string, endpoint: string, params: any, apiKey: string) {
  console.log(`🔄 Routing to ${service} API`);
  
  if (!apiKey) {
    throw new Error(`${service.toUpperCase()} API key is required`);
  }

  switch (service) {
    case 'openai':
      if (endpoint === 'chat') {
        return await callOpenAI(apiKey, params);
      }
      if (endpoint === 'test') {
        return await testOpenAI(apiKey);
      }
      break;
    case 'anthropic':
      if (endpoint === 'chat') {
        return await callAnthropic(apiKey, params);
      }
      break;
    case 'gemini':
      if (endpoint === 'chat') {
        return await callGemini(apiKey, params);
      }
      break;
    case 'mistral':
      if (endpoint === 'chat') {
        return await callMistral(apiKey, params);
      }
      break;
    default:
      throw new Error(`AI provider '${service}' not supported`);
  }
  
  throw new Error(`Endpoint '${endpoint}' not supported for ${service}`);
}

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
    console.error(`❌ OpenRouter test failed: ${errorData.error?.message || response.statusText}`);
    throw new Error(`OpenRouter API connection failed: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ OpenRouter test successful`);
  
  return new Response(JSON.stringify({
    success: true,
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
    console.error(`❌ OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 OpenRouter response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  // Return OpenAI-compatible format
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

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
    console.error(`❌ OpenAI test failed: ${errorData.error?.message || response.statusText}`);
    throw new Error(`OpenAI API connection failed: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ OpenAI test successful`);
  
  return new Response(JSON.stringify({
    success: true,
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
    console.error(`❌ OpenAI API error: ${errorData.error?.message || response.statusText}`);
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 OpenAI response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  // Return OpenAI-compatible format
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function callAnthropic(apiKey: string, params: any) {
  const { model = 'claude-3-haiku-20240307', messages, temperature = 0.7, maxTokens = 2000 } = params;
  
  console.log(`📤 Anthropic request: model=${model}, messages=${messages.length}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
    console.error(`❌ Anthropic API error: ${errorData.error?.message || response.statusText}`);
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
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  console.log(`📤 Gemini request body:`, JSON.stringify(requestBody, null, 2));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    } catch {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log(`📥 Gemini raw response:`, JSON.stringify(data, null, 2));
  
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    console.error('❌ No content generated by Gemini:', data);
    
    // Check for safety filters or other reasons
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
      throw new Error('Gemini blocked the response due to safety filters. Please try a different prompt.');
    } else if (finishReason === 'RECITATION') {
      throw new Error('Gemini blocked the response due to recitation concerns. Please try a different prompt.');
    } else {
      throw new Error(`No content generated by Gemini. Finish reason: ${finishReason || 'unknown'}`);
    }
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
    console.error(`❌ Mistral API error: ${errorData.error?.message || response.statusText}`);
    throw new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`📥 Mistral response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
  
  // Return OpenAI-compatible format
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}