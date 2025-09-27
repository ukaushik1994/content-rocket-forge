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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      socket.send(JSON.stringify({
        type: 'error',
        message: errorMessage,
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
    
    // Analyze user message for contextual actions and visual data
    const lastUserMessage = messages[messages.length - 1];
    const analysisContext = await analyzeMessageForContext(lastUserMessage?.content || '', messages);

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

    // Generate contextual actions and visual data for the response
    const responseContext = await generateResponseContext(streamResponse, analysisContext);
    
    // Send completion notification with context
    socket.send(JSON.stringify({
      type: 'ai_response_complete',
      provider,
      model,
      conversationId,
      actions: responseContext.actions,
      visualData: responseContext.visualData,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Chat request failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    socket.send(JSON.stringify({
      type: 'error',
      message: errorMessage,
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

// Analyze user message for context and triggers
async function analyzeMessageForContext(userMessage: string, conversationHistory: any[]) {
  const lowerMessage = userMessage.toLowerCase();
  const context: any = {
    keywords: [],
    contentType: null,
    userIntent: null,
    triggers: []
  };
  
  // Detect keywords and content creation intent
  const keywordPatterns = [
    /(?:keyword|seo|search|rank|target)\s+(?:for\s+)?["']?([^"',\n]+)["']?/gi,
    /(?:about|write|create|content)\s+(?:for\s+)?["']?([^"',\n]+)["']?/gi,
    /(?:optimize|improve)\s+(?:for\s+)?["']?([^"',\n]+)["']?/gi
  ];
  
  keywordPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(userMessage)) !== null) {
      if (match[1] && match[1].trim().length > 2) {
        context.keywords.push(match[1].trim());
      }
    }
  });
  
  // Detect content creation intent
  if (/create|write|build|generate|make.*(?:blog|article|post|content|landing|page|copy)/i.test(lowerMessage)) {
    context.userIntent = 'content_creation';
    context.triggers.push('content_creation');
  }
  
  // Detect SEO/keyword research intent
  if (/(?:keyword|seo|search|research|rank|optimize|competitor)/i.test(lowerMessage)) {
    context.userIntent = 'seo_research';
    context.triggers.push('seo_research');
  }
  
  // Detect analytics/performance intent
  if (/(?:analytics|performance|traffic|metrics|data|chart|graph)/i.test(lowerMessage)) {
    context.triggers.push('analytics');
  }
  
  return context;
}

// Generate contextual actions and visual data based on AI response
async function generateResponseContext(aiResponse: string, analysisContext: any) {
  const lowerResponse = aiResponse.toLowerCase();
  const context: any = {
    actions: [],
    visualData: null
  };
  
  // Generate content creation actions if AI mentions creating content
  if (analysisContext.triggers.includes('content_creation') || 
      /(?:create|write|build).*(?:blog|article|content|post)/i.test(lowerResponse)) {
    
    const mainKeyword = analysisContext.keywords[0] || 'your topic';
    
    context.actions.push({
      id: `create-blog-${Date.now()}`,
      label: `Create Blog Post: "${mainKeyword}"`,
      action: 'create-blog-post',
      type: 'card',
      variant: 'primary',
      description: `Create an SEO-optimized blog post about "${mainKeyword}"`,
      data: {
        contentType: 'blog-post',
        mainKeyword: mainKeyword,
        keywords: analysisContext.keywords.slice(0, 5),
        step: 1
      }
    });
    
    context.actions.push({
      id: `create-landing-${Date.now()}`,
      label: `Landing Page: "${mainKeyword}"`,
      action: 'create-landing-page',
      type: 'card',
      variant: 'secondary',
      description: `Build a conversion-focused landing page for "${mainKeyword}"`,
      data: {
        contentType: 'landing-page',
        mainKeyword: mainKeyword,
        keywords: analysisContext.keywords.slice(0, 3)
      }
    });
  }
  
  // Generate SEO research actions
  if (analysisContext.triggers.includes('seo_research') || 
      /(?:keyword|seo|research|competitor)/i.test(lowerResponse)) {
    
    const keyword = analysisContext.keywords[0] || 'your keyword';
    
    context.actions.push({
      id: `keyword-research-${Date.now()}`,
      label: 'Keyword Research',
      action: 'keyword-research',
      type: 'button',
      variant: 'outline',
      description: `Find related keywords for "${keyword}"`,
      data: { keyword }
    });
    
    context.actions.push({
      id: `competitor-analysis-${Date.now()}`,
      label: 'Competitor Analysis',
      action: 'competitor-analysis',
      type: 'button',
      variant: 'outline',
      description: `Analyze competitors for "${keyword}"`,
      data: { keyword }
    });
  }
  
  // Generate visual data for analytics mentions
  if (analysisContext.triggers.includes('analytics') || 
      /(?:performance|traffic|metrics|growth|increase)/i.test(lowerResponse)) {
    
    context.visualData = {
      type: 'metrics',
      metrics: [
        {
          id: 'traffic',
          title: 'Organic Traffic',
          value: '2,456',
          change: { value: 12.5, type: 'increase', period: 'vs last month' },
          icon: 'trending-up',
          color: 'green'
        },
        {
          id: 'keywords',
          title: 'Ranking Keywords',
          value: '147',
          change: { value: 8.3, type: 'increase', period: 'vs last month' },
          icon: 'search',
          color: 'blue'
        },
        {
          id: 'content',
          title: 'Content Pieces',
          value: '23',
          change: { value: 4, type: 'increase', period: 'vs last month' },
          icon: 'file-text',
          color: 'purple'
        }
      ]
    };
  }
  
  // Generate SERP analysis visual data for keyword-related responses
  if (analysisContext.keywords.length > 0 && /(?:serp|ranking|position|competition)/i.test(lowerResponse)) {
    const keyword = analysisContext.keywords[0];
    
    context.visualData = {
      type: 'serp_analysis',
      serpData: {
        keyword: keyword,
        searchVolume: Math.floor(Math.random() * 50000) + 5000,
        difficulty: Math.floor(Math.random() * 80) + 20,
        competitors: [
          { title: 'Top Competitor 1', url: 'example1.com', position: 1 },
          { title: 'Top Competitor 2', url: 'example2.com', position: 2 },
          { title: 'Top Competitor 3', url: 'example3.com', position: 3 }
        ],
        contentGaps: ['User intent analysis', 'Long-form content', 'Visual elements'],
        opportunities: {
          lowCompetition: [`long tail ${keyword}`, `${keyword} guide`, `best ${keyword}`],
          highVolume: [`${keyword} 2024`, `${keyword} tips`, `${keyword} reviews`],
          trending: [`${keyword} trends`, `${keyword} ai`, `${keyword} automation`]
        },
        relatedKeywords: [
          `${keyword} guide`,
          `best ${keyword}`,
          `${keyword} tips`,
          `how to ${keyword}`,
          `${keyword} 2024`
        ]
      }
    };
  }
  
  return context;
}