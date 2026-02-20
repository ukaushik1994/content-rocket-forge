import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { corsHeaders } from "../shared/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../shared/errors.ts";
import { getApiKey } from "../shared/apiKeyService.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Removed Lovable AI - using user's configured providers only

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

    if (!apiKey) {
      return createErrorResponse(
        `No API key found for ${service}. Please configure your API key in Settings.`,
        401,
        'ai-proxy',
        endpoint
      );
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
      case 'openrouter':
        result = await handleOpenRouter(endpoint, apiKey, params);
        break;
      case 'mistral':
        result = await handleMistral(endpoint, apiKey, params);
        break;
      case 'lmstudio':
        result = await handleLMStudio(endpoint, apiKey, params);
        break;
      default:
        throw new Error(`Unsupported service: ${service}. Supported services: openai, anthropic, gemini, openrouter, mistral, lmstudio`);
    }

    // Log successful usage
    if (userId && result?.success && 'data' in result) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('llm_usage_logs').insert({
          user_id: userId,
          provider: service,
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
    requestBody.temperature = params.temperature || 0.7;
  }

  // Store the desired max_tokens before cleanup
  const legacyMaxTokens = params.maxTokens || params.max_tokens;

  // Clean up unused parameters
  delete requestBody.maxTokens;
  delete requestBody.max_tokens;

  // Set max_tokens AFTER cleanup for legacy models
  if (!isNewerModel && legacyMaxTokens) {
    requestBody.max_tokens = legacyMaxTokens;
  }

  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 OpenAI API call attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle rate limit (429) specifically with intelligent TPM/RPM detection
        if (response.status === 429) {
          console.error('❌ OpenAI chat failed:', response.status, errorText);
          
          let waitTime = 2000 * attempt; // Default exponential backoff
          try {
            const errorData = JSON.parse(errorText);
            const errorMsg = errorData.error?.message || '';
            
            // Detect TPM vs RPM limit type
            const isTPM = errorMsg.includes('tokens per min') || errorMsg.includes('TPM');
            const isRPM = errorMsg.includes('requests per min') || errorMsg.includes('RPM');
            
            // Check for Retry-After header
            const retryAfter = response.headers.get('Retry-After');
            const waitMatch = errorMsg.match(/try again in ([\d.]+)s/);
            
            if (retryAfter) {
              waitTime = parseInt(retryAfter) * 1000;
              console.log(`⏰ Rate limit (Retry-After header): ${waitTime}ms`);
            } else if (waitMatch) {
              waitTime = Math.ceil(parseFloat(waitMatch[1]) * 1000);
              console.log(`⏰ Rate limit (extracted from message): ${waitTime}ms`);
            } else if (isTPM) {
              // TPM limits need much longer waits - at least 30s
              waitTime = 30000 + (10000 * attempt); // 30s, 40s, 50s
              console.log(`⏰ TPM Rate limit detected, waiting ${waitTime}ms (attempt ${attempt})`);
            } else if (isRPM) {
              // RPM limits can use shorter waits
              waitTime = 5000 * attempt; // 5s, 10s, 15s
              console.log(`⏰ RPM Rate limit detected, waiting ${waitTime}ms (attempt ${attempt})`);
            }
            
            console.log(`🔍 Rate limit details: ${isTPM ? 'TPM' : isRPM ? 'RPM' : 'Unknown'} - ${errorMsg.substring(0, 200)}`);
          } catch (parseError) {
            console.warn('Could not parse rate limit details, using default backoff');
          }
          
          if (attempt < maxRetries) {
            console.log(`⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`);
            await new Promise(r => setTimeout(r, waitTime));
            continue;
          }
        }
        
        // For other errors, throw immediately
        console.error('❌ OpenAI chat failed:', response.status, errorText);
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
      console.error(`💥 OpenAI chat exception on attempt ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`OpenAI chat error: ${error.message}`);
      }
      
      // Wait before retry for non-rate-limit errors
      const waitTime = 2000 * attempt;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(r => setTimeout(r, waitTime));
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
    // Use x-goog-api-key header instead of URL parameter to prevent key leakage in logs
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      }
    });

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
    // Use x-goog-api-key header instead of URL parameter to prevent key leakage in logs
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
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
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenRouter test failed:', response.status, errorData);
      throw new Error(`OpenRouter API test failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenRouter test successful');
    
    return {
      success: true,
      provider: 'OpenRouter',
      message: 'OpenRouter connection successful',
      models: data.data?.slice(0, 5).map((model: any) => model.id) || []
    };
  } catch (error: any) {
    console.error('💥 OpenRouter test exception:', error);
    throw new Error(`OpenRouter API error: ${error.message}`);
  }
}

async function chatOpenRouter(apiKey: string, params: any) {
  console.log('💬 Processing OpenRouter chat request');
  
  const model = params.model || 'gpt-5-2025-08-07';
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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:5173',
        'X-Title': 'AI Content Creator'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenRouter chat failed:', response.status, errorData);
      throw new Error(`OpenRouter chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenRouter chat successful');
    
    return {
      success: true,
      data,
      provider: 'OpenRouter'
    };
  } catch (error: any) {
    console.error('💥 OpenRouter chat exception:', error);
    throw new Error(`OpenRouter chat error: ${error.message}`);
  }
}

// Mistral Handler Functions  
async function handleMistral(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing Mistral request: ${endpoint}`);
  
  if (endpoint === 'test') {
    return await testMistral(apiKey);
  }
  
  if (endpoint === 'chat' || endpoint === 'completion') {
    return await chatMistral(apiKey, params);
  }
  
  throw new Error(`Unsupported Mistral endpoint: ${endpoint}`);
}

async function testMistral(apiKey: string) {
  console.log('🧪 Testing Mistral API key');
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Mistral test failed:', response.status, errorData);
      throw new Error(`Mistral API test failed: ${response.statusText}`);
    }

    console.log('✅ Mistral test successful');
    
    return {
      success: true,
      provider: 'Mistral',
      message: 'Mistral connection successful'
    };
  } catch (error: any) {
    console.error('💥 Mistral test exception:', error);
    throw new Error(`Mistral API error: ${error.message}`);
  }
}

async function chatMistral(apiKey: string, params: any) {
  console.log('💬 Processing Mistral chat request');
  
  const requestBody = {
    model: params.model || 'mistral-large-latest',
    messages: params.messages || [],
    temperature: params.temperature || 0.7,
    max_tokens: params.maxTokens || params.max_tokens || 1000,
    ...params
  };

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Mistral chat failed:', response.status, errorData);
      throw new Error(`Mistral chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Mistral chat successful');
    
    return {
      success: true,
      data,
      provider: 'Mistral'
    };
  } catch (error: any) {
    console.error('💥 Mistral chat exception:', error);
    throw new Error(`Mistral chat error: ${error.message}`);
  }
}

// LM Studio Handler Functions
async function handleLMStudio(endpoint: string, apiKey: string, params: any) {
  console.log(`🔍 Processing LM Studio request: ${endpoint}`);
  
  if (endpoint === 'test') {
    return await testLMStudio(apiKey);
  }
  
  if (endpoint === 'chat' || endpoint === 'completion') {
    return await chatLMStudio(apiKey, params);
  }
  
  throw new Error(`Unsupported LM Studio endpoint: ${endpoint}`);
}

async function testLMStudio(apiKey: string) {
  console.log('🧪 Testing LM Studio API key');
  
  try {
    // LM Studio typically runs on localhost:1234 by default
    let baseUrl = apiKey.startsWith('http') ? apiKey : 'http://localhost:1234';
    // Normalize: remove trailing /v1 or /v1/ to prevent double /v1/v1
    baseUrl = baseUrl.replace(/\/v1\/?$/, '');
    console.log(`🔍 LM Studio testing connection to: ${baseUrl}`);
    
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ LM Studio test failed:', response.status, errorData);
      
      if (response.status === 404) {
        throw new Error(`LM Studio not found at ${baseUrl}. Make sure LM Studio is running and the server is started.`);
      }
      throw new Error(`LM Studio API test failed: ${response.statusText}`);
    }

    console.log('✅ LM Studio test successful');
    
    return {
      success: true,
      provider: 'LM Studio',
      message: 'LM Studio connection successful'
    };
  } catch (error: any) {
    console.error('💥 LM Studio test exception:', error);
    
    // Connection-specific error messages
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      throw new Error(`LM Studio connection timed out. Is LM Studio running at ${apiKey.startsWith('http') ? apiKey : 'http://localhost:1234'}?`);
    }
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Cannot connect to LM Studio at ${apiKey.startsWith('http') ? apiKey : 'http://localhost:1234'}. Make sure the server is running.`);
    }
    throw new Error(`LM Studio API error: ${error.message}`);
  }
}

async function chatLMStudio(apiKey: string, params: any) {
  console.log('💬 Processing LM Studio chat request');
  
  let baseUrl = apiKey.startsWith('http') ? apiKey : 'http://localhost:1234';
  // Normalize: remove trailing /v1 or /v1/ to prevent double /v1/v1
  baseUrl = baseUrl.replace(/\/v1\/?$/, '');
  
  const requestBody = {
    model: params.model || 'local-model',
    messages: params.messages || [],
    temperature: params.temperature || 0.7,
    max_tokens: params.maxTokens || params.max_tokens || 1000,
    ...params
  };

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ LM Studio chat failed:', response.status, errorData);
      throw new Error(`LM Studio chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ LM Studio chat successful');
    
    return {
      success: true,
      data,
      provider: 'LM Studio'
    };
  } catch (error: any) {
    console.error('💥 LM Studio chat exception:', error);
    throw new Error(`LM Studio chat error: ${error.message}`);
  }
}

// Lovable AI has been removed - all AI requests now use user-configured providers
// Users can configure OpenAI, Anthropic, Gemini, OpenRouter, Mistral, or LMStudio in Settings