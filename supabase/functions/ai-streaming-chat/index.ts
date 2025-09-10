import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log('🔗 WebSocket connected for AI streaming');
    socket.send(JSON.stringify({
      type: 'connection_established',
      timestamp: new Date().toISOString()
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received message:', data.type);

      if (data.type === 'chat_request') {
        await handleChatRequest(socket, data);
      } else if (data.type === 'typing_start') {
        // Broadcast typing indicator to other connected users
        socket.send(JSON.stringify({
          type: 'user_typing',
          userId: data.userId,
          timestamp: new Date().toISOString()
        }));
      } else if (data.type === 'typing_stop') {
        socket.send(JSON.stringify({
          type: 'user_typing_stopped',
          userId: data.userId,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  };

  socket.onclose = () => {
    console.log('🔌 WebSocket disconnected');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});

async function handleChatRequest(socket: WebSocket, data: any) {
  const { messages, userId, conversationId } = data;
  
  try {
    // Notify client that AI is thinking
    socket.send(JSON.stringify({
      type: 'ai_thinking_start',
      timestamp: new Date().toISOString()
    }));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's AI provider configuration
    const { data: userKeys } = await supabase
      .from('user_llm_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Priority: OpenRouter > Anthropic > OpenAI
    const openrouterKey = userKeys?.find(k => k.provider === 'openrouter');
    const anthropicKey = userKeys?.find(k => k.provider === 'anthropic');
    const openaiKey = userKeys?.find(k => k.provider === 'openai');

    let streamResponse = null;
    let provider = '';
    let model = '';

    // Try providers in order
    if (openrouterKey?.api_key) {
      try {
        streamResponse = await streamOpenRouter(socket, openrouterKey.api_key, openrouterKey.model || 'openai/gpt-4o-mini', messages);
        provider = 'openrouter';
        model = openrouterKey.model || 'openai/gpt-4o-mini';
      } catch (error) {
        console.error('OpenRouter streaming failed:', error);
      }
    }

    if (!streamResponse && anthropicKey?.api_key) {
      try {
        streamResponse = await streamAnthropic(socket, anthropicKey.api_key, anthropicKey.model || 'claude-3-haiku-20240307', messages);
        provider = 'anthropic';
        model = anthropicKey.model || 'claude-3-haiku-20240307';
      } catch (error) {
        console.error('Anthropic streaming failed:', error);
      }
    }

    if (!streamResponse && (openaiKey?.api_key || Deno.env.get('OPENAI_API_KEY'))) {
      try {
        const apiKey = openaiKey?.api_key || Deno.env.get('OPENAI_API_KEY');
        streamResponse = await streamOpenAI(socket, apiKey, openaiKey?.model || 'gpt-4o-mini', messages);
        provider = 'openai';
        model = openaiKey?.model || 'gpt-4o-mini';
      } catch (error) {
        console.error('OpenAI streaming failed:', error);
      }
    }

    if (!streamResponse) {
      throw new Error('No AI provider configured or available');
    }

    // Send completion notification
    socket.send(JSON.stringify({
      type: 'ai_response_complete',
      provider,
      model,
      conversationId,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Chat request failed:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function streamOpenRouter(socket: WebSocket, apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'AI Streaming Chat'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  return await processStreamResponse(socket, response);
}

async function streamAnthropic(socket: WebSocket, apiKey: string, model: string, messages: any[]) {
  // Convert messages format for Anthropic
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: userMessages,
      system: systemMessage?.content || '',
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  return await processAnthropicStream(socket, response);
}

async function streamOpenAI(socket: WebSocket, apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await processStreamResponse(socket, response);
}

async function processStreamResponse(socket: WebSocket, response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No readable stream');

  let fullContent = '';
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              fullContent += content;
              socket.send(JSON.stringify({
                type: 'ai_response_delta',
                content,
                fullContent,
                timestamp: new Date().toISOString()
              }));
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}

async function processAnthropicStream(socket: WebSocket, response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No readable stream');

  let fullContent = '';
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const content = parsed.delta?.text;
              if (content) {
                fullContent += content;
                socket.send(JSON.stringify({
                  type: 'ai_response_delta',
                  content,
                  fullContent,
                  timestamp: new Date().toISOString()
                }));
              }
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}