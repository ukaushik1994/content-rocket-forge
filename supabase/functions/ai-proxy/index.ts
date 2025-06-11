
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsPreflightRequest } from "../shared/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../shared/errors.ts";

// Environment variables for fallback API keys
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { service, endpoint, params, apiKey } = await req.json();
    
    console.log(`AI Proxy: ${service} - ${endpoint}`);

    // Route to appropriate AI service
    if (service === 'openai') {
      return await handleOpenAIRequest(endpoint, params, apiKey);
    } else if (service === 'anthropic') {
      return await handleAnthropicRequest(endpoint, params, apiKey);
    } else if (service === 'gemini') {
      return await handleGeminiRequest(endpoint, params, apiKey);
    } else if (service === 'mistral') {
      return await handleMistralRequest(endpoint, params, apiKey);
    } else {
      return createErrorResponse(`Unsupported AI service: ${service}`, 400, service, endpoint);
    }
  } catch (error: any) {
    return createErrorResponse(error.message || 'Unknown error', 500, 'ai-proxy', 'unknown');
  }
});

// Handler for OpenAI API requests
async function handleOpenAIRequest(endpoint: string, params: any, clientApiKey: string | null) {
  const apiKey = clientApiKey || OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('No OpenAI API key available');
    return createSuccessResponse(null);
  }

  if (endpoint === 'test') {
    return await testOpenAIKey(apiKey);
  }

  if (endpoint === 'chat') {
    const { model = 'gpt-4o-mini', messages, temperature = 0.7, maxTokens } = params;
    
    if (!messages || !Array.isArray(messages)) {
      return createErrorResponse('Valid messages array is required', 400, 'openai', 'chat');
    }

    const requestBody: any = {
      model,
      messages,
      temperature,
    };
    
    if (maxTokens) {
      requestBody.max_tokens = maxTokens;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return createErrorResponse(data.error?.message || 'OpenAI API error', response.status, 'openai', 'chat');
    }

    return createSuccessResponse(data);
  }

  return createErrorResponse(`Unsupported OpenAI endpoint: ${endpoint}`, 400, 'openai', endpoint);
}

// Handler for Anthropic API requests
async function handleAnthropicRequest(endpoint: string, params: any, clientApiKey: string | null) {
  const apiKey = clientApiKey || ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('No Anthropic API key available');
    return createSuccessResponse(null);
  }

  if (endpoint === 'test') {
    return await testAnthropicKey(apiKey);
  }

  if (endpoint === 'chat') {
    const { model = 'claude-3-sonnet-20240229', messages, temperature = 0.7, maxTokens = 1000 } = params;
    
    if (!messages || !Array.isArray(messages)) {
      return createErrorResponse('Valid messages array is required', 400, 'anthropic', 'chat');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return createErrorResponse(data.error?.message || 'Anthropic API error', response.status, 'anthropic', 'chat');
    }

    // Transform Anthropic response to match expected format
    const transformedResponse = {
      id: data.id,
      choices: [{
        message: {
          role: 'assistant',
          content: data.content[0].text
        },
        index: 0,
        finishReason: data.stop_reason
      }],
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    };

    return createSuccessResponse(transformedResponse);
  }

  return createErrorResponse(`Unsupported Anthropic endpoint: ${endpoint}`, 400, 'anthropic', endpoint);
}

// Handler for Gemini API requests
async function handleGeminiRequest(endpoint: string, params: any, clientApiKey: string | null) {
  const apiKey = clientApiKey || GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('No Gemini API key available');
    return createSuccessResponse(null);
  }

  if (endpoint === 'test') {
    return await testGeminiKey(apiKey);
  }

  if (endpoint === 'chat') {
    const { model = 'gemini-1.5-flash', messages, temperature = 0.7, maxTokens } = params;
    
    if (!messages || !Array.isArray(messages)) {
      return createErrorResponse('Valid messages array is required', 400, 'gemini', 'chat');
    }

    // Transform messages to Gemini format
    const contents = messages.map(message => ({
      role: message.role === 'assistant' ? 'model' : message.role,
      parts: [{ text: message.content }]
    }));

    const apiBase = 'https://generativelanguage.googleapis.com/v1beta';
    const modelPath = `models/${model}`;
    const url = `${apiBase}/${modelPath}:generateContent?key=${apiKey}`;
    
    const requestBody: any = {
      contents,
      generation_config: {
        temperature
      }
    };
    
    if (maxTokens) {
      requestBody.generation_config.max_output_tokens = maxTokens;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (data.error && 
          (data.error.message.includes('quota') || 
           data.error.message.includes('rate limit') || 
           data.error.message.includes('Resource exhausted') ||
           data.error.status === 'RESOURCE_EXHAUSTED')) {
        return createErrorResponse(`Gemini API quota exceeded: ${data.error.message}`, response.status, 'gemini', 'chat');
      }
      return createErrorResponse(data.error?.message || 'Gemini API error', response.status, 'gemini', 'chat');
    }

    // Transform Gemini response to match expected format
    const content = data.candidates[0].content.parts[0].text;
    const transformedResponse = {
      id: 'gemini-response',
      choices: [{
        message: {
          role: 'assistant',
          content: content
        },
        index: 0,
        finishReason: data.candidates[0].finishReason
      }],
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };

    return createSuccessResponse(transformedResponse);
  }

  return createErrorResponse(`Unsupported Gemini endpoint: ${endpoint}`, 400, 'gemini', endpoint);
}

// Handler for Mistral API requests
async function handleMistralRequest(endpoint: string, params: any, clientApiKey: string | null) {
  const apiKey = clientApiKey || MISTRAL_API_KEY;
  
  if (!apiKey) {
    console.log('No Mistral API key available');
    return createSuccessResponse(null);
  }

  if (endpoint === 'test') {
    return await testMistralKey(apiKey);
  }

  if (endpoint === 'chat') {
    const { model = 'mistral-small-latest', messages, temperature = 0.7, maxTokens } = params;
    
    if (!messages || !Array.isArray(messages)) {
      return createErrorResponse('Valid messages array is required', 400, 'mistral', 'chat');
    }

    const requestBody: any = {
      model,
      messages,
      temperature,
    };
    
    if (maxTokens) {
      requestBody.max_tokens = maxTokens;
    }
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return createErrorResponse(data.error?.message || 'Mistral API error', response.status, 'mistral', 'chat');
    }

    return createSuccessResponse(data);
  }

  return createErrorResponse(`Unsupported Mistral endpoint: ${endpoint}`, 400, 'mistral', endpoint);
}

// API key testing functions
async function testOpenAIKey(apiKey: string) {
  if (!apiKey.startsWith('sk-')) {
    return createErrorResponse('Invalid OpenAI API key format - must start with "sk-"', 400, 'openai', 'test');
  }
  
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    return createSuccessResponse({ success: true, message: 'OpenAI API connection successful' });
  } else {
    const data = await response.json();
    return createErrorResponse(data.error?.message || 'Invalid OpenAI API key', response.status, 'openai', 'test');
  }
}

async function testAnthropicKey(apiKey: string) {
  if (!apiKey.startsWith('sk-ant-')) {
    return createErrorResponse('Invalid Anthropic API key format - must start with "sk-ant-"', 400, 'anthropic', 'test');
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [
        { role: 'user', content: 'Say hi in one word' }
      ]
    })
  });
  
  if (response.ok) {
    return createSuccessResponse({ success: true, message: 'Anthropic API connection successful' });
  } else {
    const data = await response.json();
    return createErrorResponse(data.error?.message || 'Invalid Anthropic API key', response.status, 'anthropic', 'test');
  }
}

async function testGeminiKey(apiKey: string) {
  const apiBase = 'https://generativelanguage.googleapis.com/v1beta';
  const model = 'models/gemini-1.5-flash';
  const url = `${apiBase}/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: 'Say hi in one word'
        }]
      }]
    })
  });
  
  if (response.ok) {
    return createSuccessResponse({ success: true, message: 'Gemini API connection successful' });
  } else {
    const data = await response.json();
    return createErrorResponse(data.error?.message || 'Invalid Gemini API key', response.status, 'gemini', 'test');
  }
}

async function testMistralKey(apiKey: string) {
  if (!apiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
    return createErrorResponse('Invalid Mistral API key format', 400, 'mistral', 'test');
  }
  
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    return createSuccessResponse({ success: true, message: 'Mistral API connection successful' });
  } else {
    const data = await response.json();
    return createErrorResponse(data.error?.message || 'Invalid Mistral API key', response.status, 'mistral', 'test');
  }
}
