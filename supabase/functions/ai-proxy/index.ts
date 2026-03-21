import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { corsHeaders } from "../shared/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../shared/errors.ts";
import { getApiKey } from "../shared/apiKeyService.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Model preference lists (best → worst) ──────────────────────────
const MODEL_PREFERENCES: Record<string, string[]> = {
  openai:     ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic:  ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  gemini:     ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  openrouter: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-flash-1.5'],
  mistral:    ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
};

// ── List available models from a provider ───────────────────────────
async function listModels(service: string, apiKey: string): Promise<string[]> {
  try {
    let url = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    switch (service) {
      case 'openai':
        url = 'https://api.openai.com/v1/models';
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        // Anthropic doesn't have a list-models endpoint; return known models
        return ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];
      case 'gemini':
        url = 'https://generativelanguage.googleapis.com/v1beta/models';
        headers['x-goog-api-key'] = apiKey;
        break;
      case 'openrouter':
        url = 'https://openrouter.ai/api/v1/models';
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'mistral':
        url = 'https://api.mistral.ai/v1/models';
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      default:
        return [];
    }

    const resp = await fetch(url, { headers });
    if (!resp.ok) return [];
    const data = await resp.json();

    if (service === 'gemini') {
      return (data.models || []).map((m: any) => m.name?.replace('models/', '') || m.name).filter(Boolean);
    }
    return (data.data || []).map((m: any) => m.id).filter(Boolean);
  } catch (e) {
    console.error(`listModels(${service}) error:`, e);
    return [];
  }
}

// ── Pick the best model from available ones ─────────────────────────
function pickBestModel(service: string, availableModels: string[]): string | null {
  const prefs = MODEL_PREFERENCES[service] || [];
  for (const preferred of prefs) {
    if (availableModels.some(m => m === preferred || m.includes(preferred))) {
      return preferred;
    }
  }
  return availableModels[0] || null;
}

// ── Check if error is model-not-found ───────────────────────────────
function isModelNotFound(status: number, errorText: string): boolean {
  if (status === 404) return true;
  const lower = errorText.toLowerCase();
  return lower.includes('model_not_found') ||
         lower.includes('does not exist') ||
         lower.includes('not found') ||
         lower.includes('invalid model') ||
         lower.includes('decommissioned');
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
    
    const { service, endpoint, apiKey: providedApiKey, params } = await req.json() as AiRequest;
    
    console.log(`📥 Request received: ${service} - ${endpoint}`, {
      hasProvidedApiKey: !!providedApiKey,
      paramsReceived: Object.keys(params || {})
    });

    if (!service || !endpoint) {
      return createErrorResponse('Missing required parameters: service and endpoint', 400, 'ai-proxy', endpoint);
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    let userId: string | undefined;
    let userApiKey: string | null = null;

    if (authHeader) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user && !error) {
          userId = user.id;
          userApiKey = await getApiKey(service, userId);
        }
      } catch (authError) {
        console.log('Auth error (non-blocking):', authError);
      }
    }

    // Determine which API key to use
    let apiKey = providedApiKey || userApiKey;
    let resolvedService = service;

    // Auto-fallback: if service is 'auto', pick the first available provider
    if (service === 'auto' && userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const providerPriority = ['openrouter', 'openai', 'anthropic', 'gemini', 'mistral'];
      
      for (const svc of providerPriority) {
        const key = await getApiKey(svc, userId);
        if (key) {
          apiKey = key;
          resolvedService = svc;
          console.log(`🔄 Auto-fallback: resolved to ${svc}`);
          break;
        }
      }
    }

    if (!apiKey) {
      return createErrorResponse(
        `No API key found for ${resolvedService}. Please configure your API key in Settings.`,
        401,
        'ai-proxy',
        endpoint
      );
    }

    let result;
    
    switch (resolvedService) {
      case 'openai':
        result = await handleOpenAI(endpoint, apiKey, params);
        break;
      case 'anthropic':
        result = await handleAnthropic(endpoint, apiKey, params);
        break;
      case 'gemini':
        result = await handleGemini(endpoint, apiKey, params);
        break;
      case 'openrouter':
        result = await handleOpenRouter(endpoint, apiKey, params);
        break;
      case 'mistral':
        result = await handleMistral(endpoint, apiKey, params);
        break;
      case 'lmstudio':
        return createErrorResponse(
          'LM Studio runs on localhost and is not reachable from cloud edge functions. Use LM Studio only in local development, or switch to a cloud-hosted provider (OpenAI, Anthropic, OpenRouter, etc.).',
          400,
          'lmstudio',
          endpoint
        );
      default:
        throw new Error(`Unsupported service: ${resolvedService}. Supported services: openai, anthropic, gemini, openrouter, mistral, lmstudio`);
    }

    // Log successful usage
    if (userId && result?.success && 'data' in result) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('llm_usage_logs').insert({
          user_id: userId,
          provider: resolvedService,
          model: params?.model || 'unknown',
          input_tokens: result.data?.usage?.prompt_tokens || 0,
          output_tokens: result.data?.usage?.completion_tokens || 0,
          total_tokens: result.data?.usage?.total_tokens || 0,
          success: true,
          metadata: { endpoint, ...params }
        });
      } catch (logError) {
        console.error('Error logging usage:', logError);
      }
    }

    return createSuccessResponse(result);

  } catch (error: any) {
    console.error('💥 AI-Proxy error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Log failed usage
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          await supabase.from('llm_usage_logs').insert({
            user_id: user.id,
            provider: 'unknown',
            model: 'unknown',
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0,
            success: false,
            error_message: errorMessage,
            metadata: { error: true }
          });
        }
      }
    } catch (logError) {
      console.error('Error logging failed usage:', logError);
    }

    return createErrorResponse(errorMessage, 500, 'ai-proxy', 'unknown');
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
  
  if (endpoint === 'transcribe') {
    return await transcribeOpenAI(apiKey, params);
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
    const allModels = (data.data || []).map((m: any) => m.id).filter(Boolean);
    const chatModels = allModels.filter((id: string) =>
      id.startsWith('gpt-') || id.startsWith('o3') || id.startsWith('o4')
    );
    const recommended = pickBestModel('openai', chatModels);
    console.log('✅ OpenAI test successful');
    
    return {
      success: true,
      provider: 'OpenAI',
      message: 'OpenAI connection successful',
      models: chatModels.slice(0, 20),
      available_models: chatModels.slice(0, 20),
      recommended_model: recommended,
    };
  } catch (error: any) {
    console.error('💥 OpenAI test exception:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

async function chatOpenAI(apiKey: string, params: any) {
  console.log('💬 Processing OpenAI chat request');
  
  const originalModel = params.model || 'gpt-4o-mini';
  let model = originalModel;
  const maxModelRetries = 2; // one normal + one fallback

  for (let modelAttempt = 1; modelAttempt <= maxModelRetries; modelAttempt++) {
    const isNewerModel = model.includes('gpt-5') || model.includes('o3') || model.includes('o4') || model.includes('gpt-4.1');
    
    const requestBody: any = { model, messages: params.messages || [] };

    if (isNewerModel) {
      requestBody.max_completion_tokens = params.maxTokens || params.max_tokens || 1000;
    } else {
      requestBody.temperature = params.temperature || 0.7;
    }

    const legacyMaxTokens = params.maxTokens || params.max_tokens;
    delete requestBody.maxTokens;
    delete requestBody.max_tokens;
    if (!isNewerModel && legacyMaxTokens) requestBody.max_tokens = legacyMaxTokens;

    // Token limit clamp
    const MODEL_TOKEN_LIMITS: Record<string, number> = {
      'gpt-4o': 16384, 'gpt-4o-mini': 16384, 'gpt-4-turbo': 4096, 'gpt-4': 8192, 'gpt-3.5-turbo': 4096,
    };
    if (requestBody.max_tokens) {
      const match = Object.entries(MODEL_TOKEN_LIMITS).find(([k]) => model.startsWith(k));
      if (match) requestBody.max_tokens = Math.min(requestBody.max_tokens, match[1]);
    }
    if (requestBody.max_completion_tokens) {
      const match = Object.entries(MODEL_TOKEN_LIMITS).find(([k]) => model.startsWith(k));
      if (match) requestBody.max_completion_tokens = Math.min(requestBody.max_completion_tokens, match[1]);
    }

    // Add tools/tool_choice if provided
    if (params.tools) requestBody.tools = params.tools;
    if (params.tool_choice) requestBody.tool_choice = params.tool_choice;

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 OpenAI API call attempt ${attempt}/${maxRetries} (model: ${model})`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Model not found → auto-detect best model
          if (isModelNotFound(response.status, errorText) && modelAttempt === 1) {
            console.warn(`⚠️ Model ${model} not found, auto-detecting...`);
            const available = await listModels('openai', apiKey);
            const best = pickBestModel('openai', available);
            if (best && best !== model) {
              console.log(`🔄 Switching from ${model} to ${best}`);
              model = best;
              break; // break retry loop, restart with new model
            }
          }
          
          // Rate limit retry
          if (response.status === 429) {
            let waitTime = 2000 * attempt;
            try {
              const errorData = JSON.parse(errorText);
              const msg = errorData.error?.message || '';
              const isTPM = msg.includes('tokens per min') || msg.includes('TPM');
              const retryAfter = response.headers.get('Retry-After');
              const waitMatch = msg.match(/try again in ([\d.]+)s/);
              if (retryAfter) waitTime = parseInt(retryAfter) * 1000;
              else if (waitMatch) waitTime = Math.ceil(parseFloat(waitMatch[1]) * 1000);
              else if (isTPM) waitTime = 30000 + (10000 * attempt);
            } catch {}
            if (attempt < maxRetries) {
              console.log(`⏳ Waiting ${waitTime}ms before retry...`);
              await new Promise(r => setTimeout(r, waitTime));
              continue;
            }
          }
          
          throw new Error(`OpenAI chat failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ OpenAI chat successful');
        
        const result: any = { success: true, data, provider: 'OpenAI' };
        if (model !== originalModel) result._autoDetectedModel = model;
        return result;
      } catch (error: any) {
        if (attempt === maxRetries && modelAttempt === maxModelRetries) throw new Error(`OpenAI chat error: ${error.message}`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    }
  }
  
  throw new Error('OpenAI chat failed after all retries');
}

async function completionOpenAI(apiKey: string, params: any) {
  console.log('📝 Processing OpenAI completion request');
  
  // For completion requests, convert to chat format if needed
  const messages = params.messages || [
    { role: 'user', content: params.prompt || params.input || 'Hello' }
  ];

  return await chatOpenAI(apiKey, { ...params, messages });
}

async function transcribeOpenAI(apiKey: string, params: any) {
  console.log('🎤 Processing OpenAI transcription request');
  
  if (!params.audio) {
    throw new Error('No audio data provided for transcription');
  }

  try {
    // Convert base64 audio to blob
    const binaryString = atob(params.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([bytes], { type: params.mimeType || 'audio/webm' });
    formData.append('file', blob, `audio.${params.extension || 'webm'}`);
    formData.append('model', params.model || 'whisper-1');
    
    if (params.language) {
      formData.append('language', params.language);
    }
    
    if (params.prompt) {
      formData.append('prompt', params.prompt);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI transcription failed:', response.status, errorData);
      throw new Error(`OpenAI transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI transcription successful');
    
    return {
      success: true,
      data: {
        text: data.text,
        language: data.language
      },
      provider: 'OpenAI'
    };
  } catch (error: any) {
    console.error('💥 OpenAI transcription exception:', error);
    throw new Error(`OpenAI transcription error: ${error.message}`);
  }
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
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

    const knownModels = ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];
    const recommended = pickBestModel('anthropic', knownModels);
    console.log('✅ Anthropic test successful');
    
    return {
      success: true,
      provider: 'Anthropic',
      message: 'Anthropic connection successful',
      available_models: knownModels,
      recommended_model: recommended,
    };
  } catch (error: any) {
    console.error('💥 Anthropic test exception:', error);
    throw new Error(`Anthropic API error: ${error.message}`);
  }
}

async function chatAnthropic(apiKey: string, params: any) {
  console.log('💬 Processing Anthropic chat request');
  
  const originalModel = params.model || 'claude-3-5-sonnet-20241022';
  let model = originalModel;

  for (let modelAttempt = 1; modelAttempt <= 2; modelAttempt++) {
    const requestBody: any = {
      model,
      max_tokens: params.maxTokens || params.max_tokens || 1000,
      messages: params.messages || [],
      temperature: params.temperature || 0.7,
    };
    if (params.system) requestBody.system = params.system;
    if (params.tools) requestBody.tools = params.tools;
    if (params.tool_choice) requestBody.tool_choice = params.tool_choice;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        
        if (isModelNotFound(response.status, errorData) && modelAttempt === 1) {
          console.warn(`⚠️ Anthropic model ${model} not found, auto-detecting...`);
          const available = await listModels('anthropic', apiKey);
          const best = pickBestModel('anthropic', available);
          if (best && best !== model) {
            console.log(`🔄 Switching from ${model} to ${best}`);
            model = best;
            continue;
          }
        }
        
        throw new Error(`Anthropic chat failed: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log('✅ Anthropic chat successful');
      
      // Normalize Anthropic response to OpenAI format
      const normalizedData = (() => {
        try {
          const textParts = (rawData.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text);
          const toolUseParts = (rawData.content || []).filter((c: any) => c.type === 'tool_use');
          
          const message: any = {
            role: 'assistant',
            content: textParts.join('\n') || null,
          };
          
          if (toolUseParts.length > 0) {
            message.tool_calls = toolUseParts.map((t: any) => ({
              id: t.id,
              type: 'function',
              function: { name: t.name, arguments: JSON.stringify(t.input || {}) }
            }));
          }
          
          return {
            choices: [{ index: 0, message, finish_reason: rawData.stop_reason === 'end_turn' ? 'stop' : (rawData.stop_reason === 'tool_use' ? 'tool_calls' : rawData.stop_reason) }],
            usage: rawData.usage ? { prompt_tokens: rawData.usage.input_tokens, completion_tokens: rawData.usage.output_tokens, total_tokens: (rawData.usage.input_tokens || 0) + (rawData.usage.output_tokens || 0) } : undefined,
            model: rawData.model,
            _originalProvider: 'anthropic'
          };
        } catch (e) {
          console.warn('⚠️ Anthropic normalization failed, returning raw:', e);
          return rawData;
        }
      })();
      
      const result: any = { success: true, data: normalizedData, provider: 'Anthropic' };
      if (model !== originalModel) result._autoDetectedModel = model;
      return result;
    } catch (error: any) {
      if (modelAttempt === 2) throw new Error(`Anthropic chat error: ${error.message}`);
    }
  }
  throw new Error('Anthropic chat failed after model fallback');
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
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Gemini test failed:', response.status, errorData);
      throw new Error(`Gemini API test failed: ${response.statusText}`);
    }

    const data = await response.json();
    const allModels = (data.models || []).map((m: any) => (m.name || '').replace('models/', '')).filter(Boolean);
    const recommended = pickBestModel('gemini', allModels);
    console.log('✅ Gemini test successful');
    
    return {
      success: true,
      provider: 'Gemini',
      message: 'Gemini connection successful',
      available_models: allModels.slice(0, 20),
      recommended_model: recommended,
    };
  } catch (error: any) {
    console.error('💥 Gemini test exception:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

async function chatGemini(apiKey: string, params: any) {
  console.log('💬 Processing Gemini chat request');
  
  // Filter out system messages and prepend as systemInstruction
  const systemMessages = (params.messages || []).filter((msg: any) => msg.role === 'system');
  const nonSystemMessages = (params.messages || []).filter((msg: any) => msg.role !== 'system');
  
  const contents = nonSystemMessages.length > 0 
    ? nonSystemMessages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }]
      }))
    : [{ role: 'user', parts: [{ text: params.prompt || 'Hello' }] }];

  const requestBody: any = {
    contents,
    generationConfig: {
      temperature: params.temperature || 0.7,
      maxOutputTokens: params.maxTokens || params.max_tokens || 1000,
    }
  };

  // Add system instruction if present
  if (systemMessages.length > 0) {
    requestBody.systemInstruction = {
      parts: [{ text: systemMessages.map((m: any) => m.content).join('\n\n') }]
    };
  }

  // Convert OpenAI tools format to Gemini function declarations
  if (params.tools && Array.isArray(params.tools) && params.tools.length > 0) {
    try {
      const functionDeclarations = params.tools
        .filter((t: any) => t.type === 'function' && t.function)
        .map((t: any) => {
          const fn = t.function;
          const parameters = fn.parameters ? JSON.parse(JSON.stringify(fn.parameters)) : { type: 'object', properties: {} };
          // Remove unsupported fields
          delete parameters.additionalProperties;
          if (parameters.properties) {
            for (const key of Object.keys(parameters.properties)) {
              const prop = parameters.properties[key];
              if (prop && typeof prop === 'object') {
                delete prop.additionalProperties;
              }
            }
          }
          return {
            name: fn.name,
            description: fn.description || '',
            parameters,
          };
        });

      if (functionDeclarations.length > 0) {
        requestBody.tools = [{ functionDeclarations }];
        
        if (params.tool_choice === 'required') {
          requestBody.toolConfig = { functionCallingConfig: { mode: 'ANY' } };
        } else if (params.tool_choice === 'none') {
          requestBody.toolConfig = { functionCallingConfig: { mode: 'NONE' } };
        } else if (typeof params.tool_choice === 'object' && params.tool_choice?.function?.name) {
          requestBody.toolConfig = { 
            functionCallingConfig: { 
              mode: 'ANY',
              allowedFunctionNames: [params.tool_choice.function.name]
            } 
          };
        } else {
          requestBody.toolConfig = { functionCallingConfig: { mode: 'AUTO' } };
        }
      }
    } catch (toolConvertErr) {
      console.warn('⚠️ Failed to convert tools to Gemini format, sending without tools:', toolConvertErr);
    }
  }

  const originalModel = params.model || 'gemini-2.5-flash';
  let model = originalModel;

  for (let modelAttempt = 1; modelAttempt <= 2; modelAttempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        
        if (isModelNotFound(response.status, errorData) && modelAttempt === 1) {
          console.warn(`⚠️ Gemini model ${model} not found, auto-detecting...`);
          const available = await listModels('gemini', apiKey);
          const best = pickBestModel('gemini', available);
          if (best && best !== model) {
            console.log(`🔄 Switching from ${model} to ${best}`);
            model = best;
            continue;
          }
        }
        
        throw new Error(`Gemini chat failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Gemini chat successful');
      
      // Normalize Gemini response to OpenAI format
      const candidate = data?.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      
      const functionCallParts = parts.filter((p: any) => p.functionCall);
      const textParts = parts.filter((p: any) => p.text !== undefined);
      const text = textParts.map((p: any) => p.text).join('') || '';
      
      let toolCalls = null;
      if (functionCallParts.length > 0) {
        toolCalls = functionCallParts.map((p: any, idx: number) => ({
          id: `call_${Date.now()}_${idx}`,
          type: 'function',
          function: {
            name: p.functionCall.name,
            arguments: JSON.stringify(p.functionCall.args || {}),
          }
        }));
      }
      
      const normalizedData = {
        choices: [{
          message: {
            role: 'assistant',
            content: text || null,
            tool_calls: toolCalls,
          },
          index: 0,
          finish_reason: candidate?.finishReason === 'STOP' ? 'stop' : (toolCalls ? 'tool_calls' : 'stop'),
        }],
        usage: {
          prompt_tokens: data?.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data?.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: data?.usageMetadata?.totalTokenCount || 0,
        },
        model: data?.modelVersion || model,
      };
      
      const result: any = { success: true, data: normalizedData, provider: 'Gemini' };
      if (model !== originalModel) result._autoDetectedModel = model;
      return result;
    } catch (error: any) {
      if (modelAttempt === 2) throw new Error(`Gemini chat error: ${error.message}`);
    }
  }
  throw new Error('Gemini chat failed after model fallback');
}

// OpenRouter Handler Functions
async function handleOpenRouter(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing OpenRouter request: ${endpoint}`);
  
  if (endpoint === 'test') {
    return await testOpenRouter(apiKey);
  }
  
  if (endpoint === 'chat' || endpoint === 'completion') {
    return await chatOpenRouter(apiKey, params);
  }
  
  throw new Error(`Unsupported OpenRouter endpoint: ${endpoint}`);
}

async function testOpenRouter(apiKey: string) {
  console.log('🧪 Testing OpenRouter API key');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API test failed: ${response.statusText}`);
    }

    const data = await response.json();
    const allModels = (data.data || []).map((m: any) => m.id).filter(Boolean);
    const recommended = pickBestModel('openrouter', allModels);
    console.log('✅ OpenRouter test successful');
    
    return {
      success: true,
      provider: 'OpenRouter',
      message: 'OpenRouter connection successful',
      models: allModels.slice(0, 20),
      available_models: allModels.slice(0, 50),
      recommended_model: recommended,
    };
  } catch (error: any) {
    console.error('💥 OpenRouter test exception:', error);
    throw new Error(`OpenRouter API error: ${error.message}`);
  }
}

async function chatOpenRouter(apiKey: string, params: any) {
  console.log('💬 Processing OpenRouter chat request');
  
  const originalModel = params.model || 'openai/gpt-4o-mini';
  let model = originalModel;

  for (let modelAttempt = 1; modelAttempt <= 2; modelAttempt++) {
    const isNewerModel = model.includes('gpt-5') || model.includes('o3') || model.includes('o4') || model.includes('gpt-4.1');
    
    const requestBody: any = { model, messages: params.messages || [] };

    if (isNewerModel) {
      if (params.maxTokens || params.max_tokens) requestBody.max_completion_tokens = params.maxTokens || params.max_tokens || 1000;
    } else {
      if (params.maxTokens || params.max_tokens) requestBody.max_tokens = params.maxTokens || params.max_tokens || 1000;
      requestBody.temperature = params.temperature || 0.7;
    }
    delete requestBody.maxTokens;
    if (params.tools) requestBody.tools = params.tools;
    if (params.tool_choice) requestBody.tool_choice = params.tool_choice;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://creaiter.lovable.app',
          'X-Title': 'Creaiter'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        
        if (isModelNotFound(response.status, errorData) && modelAttempt === 1) {
          console.warn(`⚠️ OpenRouter model ${model} not found, auto-detecting...`);
          const available = await listModels('openrouter', apiKey);
          const best = pickBestModel('openrouter', available);
          if (best && best !== model) {
            console.log(`🔄 Switching from ${model} to ${best}`);
            model = best;
            continue;
          }
        }
        
        throw new Error(`OpenRouter chat failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ OpenRouter chat successful');
      
      const result: any = { success: true, data, provider: 'OpenRouter' };
      if (model !== originalModel) result._autoDetectedModel = model;
      return result;
    } catch (error: any) {
      if (modelAttempt === 2) throw new Error(`OpenRouter chat error: ${error.message}`);
    }
  }
  throw new Error('OpenRouter chat failed after model fallback');
}

// Mistral Handler Functions  
async function handleMistral(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing Mistral request: ${endpoint}`);
  
  if (endpoint === 'test') return await testMistral(apiKey);
  if (endpoint === 'chat' || endpoint === 'completion') return await chatMistral(apiKey, params);
  throw new Error(`Unsupported Mistral endpoint: ${endpoint}`);
}

async function testMistral(apiKey: string) {
  console.log('🧪 Testing Mistral API key');
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Mistral API test failed: ${response.statusText}`);
    }

    const data = await response.json();
    const allModels = (data.data || []).map((m: any) => m.id).filter(Boolean);
    const recommended = pickBestModel('mistral', allModels);
    console.log('✅ Mistral test successful');
    
    return {
      success: true,
      provider: 'Mistral',
      message: 'Mistral connection successful',
      available_models: allModels.slice(0, 20),
      recommended_model: recommended,
    };
  } catch (error: any) {
    console.error('💥 Mistral test exception:', error);
    throw new Error(`Mistral API error: ${error.message}`);
  }
}

async function chatMistral(apiKey: string, params: any) {
  console.log('💬 Processing Mistral chat request');
  
  const originalModel = params.model || 'mistral-large-latest';
  let model = originalModel;

  for (let modelAttempt = 1; modelAttempt <= 2; modelAttempt++) {
    const requestBody: any = {
      model,
      messages: params.messages || [],
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || params.max_tokens || 1000,
    };
    if (params.tools) requestBody.tools = params.tools;
    if (params.tool_choice) requestBody.tool_choice = params.tool_choice;

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        
        if (isModelNotFound(response.status, errorData) && modelAttempt === 1) {
          console.warn(`⚠️ Mistral model ${model} not found, auto-detecting...`);
          const available = await listModels('mistral', apiKey);
          const best = pickBestModel('mistral', available);
          if (best && best !== model) {
            console.log(`🔄 Switching from ${model} to ${best}`);
            model = best;
            continue;
          }
        }
        
        throw new Error(`Mistral chat failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Mistral chat successful');
      
      const result: any = { success: true, data, provider: 'Mistral' };
      if (model !== originalModel) result._autoDetectedModel = model;
      return result;
    } catch (error: any) {
      if (modelAttempt === 2) throw new Error(`Mistral chat error: ${error.message}`);
    }
  }
  throw new Error('Mistral chat failed after model fallback');
}

// LM Studio handlers removed — localhost is unreachable from cloud edge functions.
// Users are informed with a clear error message.

// All AI requests now use user-configured providers