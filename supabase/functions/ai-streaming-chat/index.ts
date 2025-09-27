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
    // Get the LOVABLE_API_KEY from environment
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not found in environment");
    }
    
    // Build system prompt for streaming responses
    const systemPrompt = `You are an intelligent workflow orchestration assistant. You help users create, execute, and manage complex multi-step workflows that integrate multiple solutions and AI capabilities. You can decompose complex tasks into manageable steps, suggest optimal solution integrations, and execute workflows with real-time progress tracking. Focus on being practical, efficient, and solution-aware in your recommendations.

Provide clear, helpful responses that directly address the user's questions and needs.`;

    // Call the Lovable AI Gateway for streaming response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: false // For now, we'll simulate streaming by sending the full response
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiMessage = aiResponse.choices?.[0]?.message?.content;

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
  const words = message.split(' ');
  let currentContent = '';
  
  // Send streaming chunks
  for (let i = 0; i < words.length; i++) {
    currentContent += (i > 0 ? ' ' : '') + words[i];
    
    socket.send(JSON.stringify({
      type: 'ai_response_delta',
      delta: words[i] + (i < words.length - 1 ? ' ' : ''),
      fullContent: currentContent,
      timestamp: Date.now()
    }));
    
    // Small delay to simulate streaming
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Send completion message
  socket.send(JSON.stringify({
    type: 'ai_response_complete',
    content: message,
    timestamp: Date.now()
  }));
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