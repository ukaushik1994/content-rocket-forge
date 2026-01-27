import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// WebSocket connection management
const connections = new Map<string, WebSocket>();
const userSessions = new Map<string, {
  userId: string;
  conversationId: string | null;
  lastActivity: number;
}>();

// Initialize Supabase client for database operations
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket upgrade
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();
    
    console.log(`🔗 New WebSocket connection: ${connectionId}`);
    
    socket.onopen = () => {
      connections.set(connectionId, socket);
      socket.send(JSON.stringify({
        type: 'connection_established',
        connectionId,
        timestamp: Date.now()
      }));
      console.log(`✅ WebSocket connection established: ${connectionId}`);
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        await handleWebSocketMessage(socket, connectionId, data);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    };

    socket.onclose = () => {
      console.log(`🔌 WebSocket connection closed: ${connectionId}`);
      connections.delete(connectionId);
      
      // Clean up user session
      const session = userSessions.get(connectionId);
      if (session) {
        userSessions.delete(connectionId);
        // Notify other users that this user disconnected
        broadcastToConversation(session.conversationId, {
          type: 'user_disconnected',
          userId: session.userId
        }, connectionId);
      }
    };

    socket.onerror = (error) => {
      console.error(`❌ WebSocket error for ${connectionId}:`, error);
    };

    return response;
  } catch (error) {
    console.error("Failed to upgrade to WebSocket:", error);
    return new Response("Failed to upgrade to WebSocket", { status: 500 });
  }
});

async function handleWebSocketMessage(socket: WebSocket, connectionId: string, data: any) {
  console.log(`📨 Message from ${connectionId}:`, data.type);

  switch (data.type) {
    case 'authenticate':
      await handleAuthentication(socket, connectionId, data);
      break;
      
    case 'chat_request':
      await handleChatRequest(socket, connectionId, data);
      break;
      
    case 'typing_start':
    case 'typing_stop':
      await handleTypingIndicator(socket, connectionId, data);
      break;
      
    case 'message_status_update':
      await handleMessageStatusUpdate(connectionId, data);
      break;
      
    case 'join_conversation':
      await handleJoinConversation(socket, connectionId, data);
      break;
      
    default:
      console.warn(`Unknown message type: ${data.type}`);
      socket.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${data.type}`
      }));
  }
}

async function handleAuthentication(socket: WebSocket, connectionId: string, data: any) {
  const { userId, conversationId } = data;
  
  if (!userId) {
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Authentication required'
    }));
    return;
  }
  
  // Store user session
  userSessions.set(connectionId, {
    userId,
    conversationId: conversationId || null,
    lastActivity: Date.now()
  });
  
  socket.send(JSON.stringify({
    type: 'authenticated',
    userId,
    connectionId
  }));
  
  console.log(`🔐 User authenticated: ${userId} on connection ${connectionId}`);
}

async function handleChatRequest(socket: WebSocket, connectionId: string, data: any) {
  const session = userSessions.get(connectionId);
  if (!session) {
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Not authenticated'
    }));
    return;
  }
  
  const { messages, conversationId } = data;
  
  if (!messages || !Array.isArray(messages)) {
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Messages array is required'
    }));
    return;
  }
  
  // Update session with conversation ID
  session.conversationId = conversationId;
  session.lastActivity = Date.now();
  
  // Notify start of AI thinking
  socket.send(JSON.stringify({
    type: 'ai_thinking_start',
    timestamp: Date.now()
  }));
  
  try {
    // Get user's active AI provider from database
    const { data: provider, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model, status')
      .eq('user_id', session.userId)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (providerError || !provider) {
      throw new Error('No active AI provider configured. Please configure your AI service in Settings.');
    }

    console.log(`Using AI provider: ${provider.provider} with model: ${provider.preferred_model}`);
    
    // Build system prompt for streaming responses
    const systemPrompt = `You are an intelligent workflow orchestration assistant. You help users create, execute, and manage complex multi-step workflows that integrate multiple solutions and AI capabilities. You can decompose complex tasks into manageable steps, suggest optimal solution integrations, and execute workflows with real-time progress tracking. Focus on being practical, efficient, and solution-aware in your recommendations.

Provide clear, helpful responses that directly address the user's questions and needs.`;

    // Call ai-proxy edge function with user's provider
    const { data: aiProxyResult, error: aiProxyError } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'chat',
        apiKey: provider.api_key,
        params: {
          model: provider.preferred_model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: true
        }
      }
    });

    if (aiProxyError || !aiProxyResult?.success) {
      throw new Error(aiProxyError?.message || aiProxyResult?.error || 'AI request failed');
    }

    const aiMessage = aiProxyResult.data?.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    // Simulate streaming by sending chunks of the response
    await streamResponse(socket, aiMessage, session.userId);
    
    // Broadcast to other users in the conversation
    if (conversationId) {
      broadcastToConversation(conversationId, {
        type: 'ai_response_complete',
        content: aiMessage,
        timestamp: Date.now()
      }, connectionId);
    }

  } catch (error) {
    console.error("Error processing chat request:", error);
    socket.send(JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to process chat request'
    }));
  }
}

async function streamResponse(socket: WebSocket, message: string, userId: string) {
  // Parse visual data from the AI response
  const parsedData = parseVisualDataFromResponse(message);
  
  // Stream content in natural chunks (sentences or paragraphs) instead of words
  const chunks = message.split(/(?<=[.!?\n])\s+/);
  let currentContent = '';
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    currentContent += (i > 0 ? ' ' : '') + chunk;
    
    socket.send(JSON.stringify({
      type: 'ai_response_delta',
      delta: chunk + (i < chunks.length - 1 ? ' ' : ''),
      fullContent: currentContent,
      timestamp: Date.now()
    }));
    
    // Natural delay based on chunk length (faster for short chunks)
    // This simulates real streaming without artificial delays
    const delay = Math.min(10, Math.max(2, chunk.length / 50));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Send completion message with visual data
  socket.send(JSON.stringify({
    type: 'ai_response_complete',
    content: parsedData.cleanContent || message,
    visualData: parsedData.visualData,
    actions: parsedData.actions,
    timestamp: Date.now()
  }));
}

/**
 * Parse visual data from AI response content
 * Extracts JSON blocks, charts, metrics, and other visual elements
 */
function parseVisualDataFromResponse(content: string): {
  cleanContent: string;
  visualData: any[] | null;
  actions: any[] | null;
} {
  const visualDataItems: any[] = [];
  const actions: any[] = [];
  let cleanContent = content;
  
  // Extract JSON blocks from markdown code blocks
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/gi;
  let match;
  
  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const jsonStr = match[1].trim();
      const parsed = JSON.parse(jsonStr);
      
      if (parsed && typeof parsed === 'object') {
        // Check if it's visual data
        if (isVisualDataObject(parsed)) {
          const normalized = normalizeToVisualData(parsed);
          if (normalized) {
            visualDataItems.push(normalized);
            // Remove the JSON block from clean content
            cleanContent = cleanContent.replace(match[0], '');
          }
        }
        
        // Check if it's an array of visual data
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (isVisualDataObject(item)) {
              const normalized = normalizeToVisualData(item);
              if (normalized) {
                visualDataItems.push(normalized);
              }
            }
          }
          cleanContent = cleanContent.replace(match[0], '');
        }
      }
    } catch (e) {
      console.warn('Failed to parse JSON block:', e);
    }
  }
  
  // Also check for inline chart/visual indicators
  const chartPatterns = [
    /\{[^{}]*"type"\s*:\s*"(chart|metrics|table|multi_chart_analysis)"[^{}]*\}/g,
  ];
  
  for (const pattern of chartPatterns) {
    let inlineMatch;
    while ((inlineMatch = pattern.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(inlineMatch[0]);
        if (isVisualDataObject(parsed)) {
          const normalized = normalizeToVisualData(parsed);
          if (normalized && !visualDataItems.some(v => JSON.stringify(v) === JSON.stringify(normalized))) {
            visualDataItems.push(normalized);
          }
        }
      } catch {
        // Ignore parse errors for inline patterns
      }
    }
  }
  
  // Clean up excessive whitespace
  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim();
  
  return {
    cleanContent,
    visualData: visualDataItems.length > 0 ? visualDataItems : null,
    actions: actions.length > 0 ? actions : null
  };
}

/**
 * Check if an object is a visual data structure
 */
function isVisualDataObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  
  const visualTypes = [
    'chart', 'metrics', 'table', 'workflow', 'summary',
    'multi_chart_analysis', 'queue_status', 'campaign_dashboard',
    'generated_image', 'generated_images'
  ];
  
  if (obj.type && visualTypes.includes(obj.type)) return true;
  if (obj.chartConfig || obj.charts || obj.metrics) return true;
  if (Array.isArray(obj.data) && obj.data.length > 0 && obj.type) return true;
  
  return false;
}

/**
 * Normalize various data formats to standard visual data structure
 */
function normalizeToVisualData(obj: any): any | null {
  // Already has proper type
  if (obj.type && ['chart', 'metrics', 'table', 'multi_chart_analysis'].includes(obj.type)) {
    return obj;
  }
  
  // Has chartConfig
  if (obj.chartConfig) {
    return {
      type: 'chart',
      chartConfig: normalizeChartConfig(obj.chartConfig),
      title: obj.title,
      description: obj.description
    };
  }
  
  // Has charts array
  if (Array.isArray(obj.charts)) {
    return {
      type: 'multi_chart_analysis',
      charts: obj.charts.map(normalizeChartConfig),
      title: obj.title || 'Analysis',
      description: obj.description
    };
  }
  
  // Has metrics array
  if (Array.isArray(obj.metrics)) {
    return { type: 'metrics', metrics: obj.metrics };
  }
  
  // Has data array - treat as chart
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    return {
      type: 'chart',
      chartConfig: normalizeChartConfig({
        type: obj.type || 'bar',
        data: obj.data,
        categories: obj.categories,
        series: obj.series,
        title: obj.title
      })
    };
  }
  
  return null;
}

/**
 * Normalize chart configuration to ensure consistent format
 */
function normalizeChartConfig(config: any): any {
  const data = normalizeChartData(config.data || []);
  const series = config.series || extractSeriesFromData(data);
  const categories = config.categories || ['name'];
  
  return {
    type: config.type || 'bar',
    data,
    categories,
    series,
    title: config.title,
    subtitle: config.subtitle,
    colors: config.colors,
    height: config.height || 300
  };
}

/**
 * Normalize chart data - handle various AI output formats
 */
function normalizeChartData(rawData: any[]): any[] {
  if (!Array.isArray(rawData)) return [];
  
  return rawData.map(item => {
    const normalized: any = {};
    
    for (const [key, value] of Object.entries(item)) {
      const lowerKey = key.toLowerCase();
      
      // Map common alternative keys
      if (lowerKey === 'label' || lowerKey === 'category' || lowerKey === 'title') {
        normalized.name = String(value);
      } else if (lowerKey === 'count' || lowerKey === 'amount' || lowerKey === 'total') {
        normalized.value = parseNumericValue(value);
      } else if (key === 'name') {
        normalized.name = String(value);
      } else if (key === 'value') {
        normalized.value = parseNumericValue(value);
      } else {
        // Keep other keys, normalizing numeric values
        normalized[key] = typeof value === 'number' ? value : 
                         isNumericString(value) ? parseNumericValue(value) : value;
      }
    }
    
    // Ensure name exists
    if (!normalized.name) {
      normalized.name = 'Unknown';
    }
    
    return normalized;
  });
}

/**
 * Extract series configuration from data
 */
function extractSeriesFromData(data: any[]): Array<{ dataKey: string; name: string }> {
  if (!data || data.length === 0) return [{ dataKey: 'value', name: 'Value' }];
  
  const sample = data[0];
  const numericKeys = Object.keys(sample).filter(
    k => typeof sample[k] === 'number' && k !== 'name'
  );
  
  if (numericKeys.length === 0) return [{ dataKey: 'value', name: 'Value' }];
  
  return numericKeys.map(key => ({
    dataKey: key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }));
}

/**
 * Parse numeric value from string or number
 */
function parseNumericValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,$%]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Check if a value is a numeric string
 */
function isNumericString(value: any): boolean {
  if (typeof value !== 'string') return false;
  const cleaned = value.replace(/[,$%]/g, '').trim();
  return !isNaN(parseFloat(cleaned));
}

async function handleTypingIndicator(socket: WebSocket, connectionId: string, data: any) {
  const session = userSessions.get(connectionId);
  if (!session?.conversationId) return;
  
  const isTyping = data.type === 'typing_start';
  
  try {
    // Update typing indicator in database
    await supabase
      .from('user_typing_indicators')
      .upsert({
        user_id: session.userId,
        conversation_id: session.conversationId,
        is_typing: isTyping,
        last_activity: new Date().toISOString()
      });
    
    // Broadcast to other users in the conversation
    broadcastToConversation(session.conversationId, {
      type: isTyping ? 'user_typing' : 'user_typing_stopped',
      userId: session.userId,
      timestamp: Date.now()
    }, connectionId);
    
  } catch (error) {
    console.error('Error updating typing indicator:', error);
  }
}

async function handleMessageStatusUpdate(connectionId: string, data: any) {
  const session = userSessions.get(connectionId);
  if (!session) return;
  
  const { messageId, status } = data;
  
  try {
    // Update message status using the database function
    await supabase.rpc('update_message_status', {
      message_id: messageId,
      new_status: status,
      user_id: session.userId
    });
    
    console.log(`📝 Updated message ${messageId} status to ${status} for user ${session.userId}`);
    
  } catch (error) {
    console.error('Error updating message status:', error);
  }
}

async function handleJoinConversation(socket: WebSocket, connectionId: string, data: any) {
  const session = userSessions.get(connectionId);
  if (!session) return;
  
  const { conversationId } = data;
  session.conversationId = conversationId;
  
  socket.send(JSON.stringify({
    type: 'conversation_joined',
    conversationId,
    timestamp: Date.now()
  }));
  
  // Broadcast to other users
  broadcastToConversation(conversationId, {
    type: 'user_joined',
    userId: session.userId,
    timestamp: Date.now()
  }, connectionId);
}

function broadcastToConversation(conversationId: string | null, message: any, excludeConnectionId?: string) {
  if (!conversationId) return;
  
  for (const [connId, socket] of connections.entries()) {
    if (connId === excludeConnectionId) continue;
    
    const session = userSessions.get(connId);
    if (session?.conversationId === conversationId && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
}

// Clean up inactive connections every 5 minutes
setInterval(() => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes
  
  for (const [connectionId, session] of userSessions.entries()) {
    if (now - session.lastActivity > timeout) {
      console.log(`🧹 Cleaning up inactive connection: ${connectionId}`);
      const socket = connections.get(connectionId);
      if (socket) {
        socket.close();
      }
      connections.delete(connectionId);
      userSessions.delete(connectionId);
    }
  }
}, 5 * 60 * 1000);