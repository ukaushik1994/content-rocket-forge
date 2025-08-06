import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  provider: string;
  api_key: string;
  model?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, api_key, model }: ValidateRequest = await req.json();

    console.log(`Validating API key for provider: ${provider}`);

    let isValid = false;
    let errorMessage = '';

    // Test the API key with a simple request
    switch (provider.toLowerCase()) {
      case 'openai':
        isValid = await validateOpenAI(api_key, model);
        break;
      case 'openrouter':
        isValid = await validateOpenRouter(api_key, model);
        break;
      case 'anthropic':
        isValid = await validateAnthropic(api_key, model);
        break;
      case 'gemini':
        isValid = await validateGemini(api_key, model);
        break;
      case 'mistral':
        isValid = await validateMistral(api_key, model);
        break;
      default:
        errorMessage = `Unsupported provider: ${provider}`;
    }

    return new Response(JSON.stringify({ 
      valid: isValid, 
      error: isValid ? null : errorMessage || 'Invalid API key'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error validating API key:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: error.message || 'Validation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateOpenAI(apiKey: string, model?: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }),
    });

    return response.status === 200;
  } catch (error) {
    console.error('OpenAI validation error:', error);
    return false;
  }
}

async function validateOpenRouter(apiKey: string, model?: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable AI Platform'
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }),
    });

    return response.status === 200;
  } catch (error) {
    console.error('OpenRouter validation error:', error);
    return false;
  }
}

async function validateAnthropic(apiKey: string, model?: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-opus-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      }),
    });

    return response.status === 200;
  } catch (error) {
    console.error('Anthropic validation error:', error);
    return false;
  }
}

async function validateGemini(apiKey: string, model?: string): Promise<boolean> {
  try {
    const modelName = model || 'gemini-1.5-pro';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'test' }]
        }]
      }),
    });

    return response.status === 200;
  } catch (error) {
    console.error('Gemini validation error:', error);
    return false;
  }
}

async function validateMistral(apiKey: string, model?: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'mistral-large',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }),
    });

    return response.status === 200;
  } catch (error) {
    console.error('Mistral validation error:', error);
    return false;
  }
}