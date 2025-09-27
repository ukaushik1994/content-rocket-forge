import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// WebSocket connections for collaboration
const collaborationConnections = new Map<string, WebSocket>();
const activeSessions = new Map<string, {
  sessionId: string;
  hostUserId: string;
  participants: string[];
  sessionData: any;
}>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() === "websocket") {
    return handleWebSocketUpgrade(req);
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, userId, data } = await req.json();
    
    console.log(`🤝 Collaboration: ${action} for session ${sessionId}`);

    switch (action) {
      case 'create_session':
        return await createCollaborationSession(userId, data);
      
      case 'join_session':
        return await joinCollaborationSession(sessionId, userId);
      
      case 'update_session_data':
        return await updateSessionData(sessionId, userId, data);
      
      case 'start_screen_sharing':
        return await startScreenSharing(sessionId, userId);
      
      case 'stop_screen_sharing':
        return await stopScreenSharing(sessionId, userId);
      
      case 'add_annotation':
        return await addAnnotation(sessionId, userId, data);
      
      case 'get_session_info':
        return await getSessionInfo(sessionId, userId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in collaboration manager:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleWebSocketUpgrade(req: Request) {
  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();
    
    socket.onopen = () => {
      collaborationConnections.set(connectionId, socket);
      socket.send(JSON.stringify({
        type: 'collaboration_connected',
        connectionId
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        await handleCollaborationMessage(socket, connectionId, data);
      } catch (error) {
        console.error('Collaboration WebSocket error:', error);
      }
    };

    socket.onclose = () => {
      collaborationConnections.delete(connectionId);
    };

    return response;
  } catch (error) {
    return new Response("Failed to upgrade to WebSocket", { status: 500 });
  }
}

async function handleCollaborationMessage(socket: WebSocket, connectionId: string, data: any) {
  switch (data.type) {
    case 'cursor_move':
      broadcastToSession(data.sessionId, {
        type: 'cursor_update',
        userId: data.userId,
        position: data.position
      }, connectionId);
      break;
      
    case 'text_selection':
      broadcastToSession(data.sessionId, {
        type: 'selection_update',
        userId: data.userId,
        selection: data.selection
      }, connectionId);
      break;
      
    case 'live_annotation':
      broadcastToSession(data.sessionId, {
        type: 'annotation_added',
        userId: data.userId,
        annotation: data.annotation
      }, connectionId);
      break;
  }
}

async function createCollaborationSession(hostUserId: string, data: any) {
  const { data: session, error } = await supabase
    .from('collaboration_sessions')
    .insert({
      host_user_id: hostUserId,
      session_name: data.sessionName || 'New Collaboration Session',
      conversation_id: data.conversationId,
      session_data: data.sessionData || {},
      participants: [{ user_id: hostUserId, role: 'host', joined_at: new Date().toISOString() }]
    })
    .select()
    .single();

  if (error) throw error;

  // Store in memory for quick access
  activeSessions.set(session.id, {
    sessionId: session.id,
    hostUserId,
    participants: [hostUserId],
    sessionData: session.session_data
  });

  return new Response(JSON.stringify({ 
    session,
    message: 'Collaboration session created successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function joinCollaborationSession(sessionId: string, userId: string) {
  // Get session from database
  const { data: session, error } = await supabase
    .from('collaboration_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('status', 'active')
    .single();

  if (error) throw error;

  // Add participant
  const updatedParticipants = [
    ...session.participants,
    { user_id: userId, role: 'participant', joined_at: new Date().toISOString() }
  ];

  const { error: updateError } = await supabase
    .from('collaboration_sessions')
    .update({ participants: updatedParticipants })
    .eq('id', sessionId);

  if (updateError) throw updateError;

  // Update memory
  const activeSession = activeSessions.get(sessionId);
  if (activeSession) {
    activeSession.participants.push(userId);
  }

  // Broadcast to existing participants
  broadcastToSession(sessionId, {
    type: 'participant_joined',
    userId,
    timestamp: new Date().toISOString()
  });

  return new Response(JSON.stringify({ 
    session: { ...session, participants: updatedParticipants },
    message: 'Joined collaboration session successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateSessionData(sessionId: string, userId: string, data: any) {
  // Verify user is participant
  const activeSession = activeSessions.get(sessionId);
  if (!activeSession || !activeSession.participants.includes(userId)) {
    throw new Error('User not authorized for this session');
  }

  const { error } = await supabase
    .from('collaboration_sessions')
    .update({ 
      session_data: data.sessionData,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) throw error;

  // Update memory
  activeSession.sessionData = data.sessionData;

  // Broadcast update
  broadcastToSession(sessionId, {
    type: 'session_data_updated',
    userId,
    sessionData: data.sessionData
  });

  return new Response(JSON.stringify({ 
    message: 'Session data updated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function startScreenSharing(sessionId: string, userId: string) {
  const { error } = await supabase
    .from('collaboration_sessions')
    .update({ 
      screen_sharing_active: true,
      screen_sharing_user_id: userId
    })
    .eq('id', sessionId);

  if (error) throw error;

  broadcastToSession(sessionId, {
    type: 'screen_sharing_started',
    userId,
    timestamp: new Date().toISOString()
  });

  return new Response(JSON.stringify({ 
    message: 'Screen sharing started successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function stopScreenSharing(sessionId: string, userId: string) {
  const { error } = await supabase
    .from('collaboration_sessions')
    .update({ 
      screen_sharing_active: false,
      screen_sharing_user_id: null
    })
    .eq('id', sessionId);

  if (error) throw error;

  broadcastToSession(sessionId, {
    type: 'screen_sharing_stopped',
    userId,
    timestamp: new Date().toISOString()
  });

  return new Response(JSON.stringify({ 
    message: 'Screen sharing stopped successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function addAnnotation(sessionId: string, userId: string, data: any) {
  // Store annotation in session data
  const { data: session } = await supabase
    .from('collaboration_sessions')
    .select('session_data')
    .eq('id', sessionId)
    .single();

  const annotations = session?.session_data?.annotations || [];
  const newAnnotation = {
    id: crypto.randomUUID(),
    userId,
    ...data.annotation,
    created_at: new Date().toISOString()
  };

  annotations.push(newAnnotation);

  const { error } = await supabase
    .from('collaboration_sessions')
    .update({ 
      session_data: { 
        ...session?.session_data,
        annotations
      }
    })
    .eq('id', sessionId);

  if (error) throw error;

  broadcastToSession(sessionId, {
    type: 'annotation_added',
    userId,
    annotation: newAnnotation
  });

  return new Response(JSON.stringify({ 
    annotation: newAnnotation,
    message: 'Annotation added successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getSessionInfo(sessionId: string, userId: string) {
  const { data: session, error } = await supabase
    .from('collaboration_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;

  // Check if user is participant
  const isParticipant = session.participants.some((p: any) => p.user_id === userId);
  if (!isParticipant) {
    throw new Error('User not authorized for this session');
  }

  return new Response(JSON.stringify({ 
    session
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function broadcastToSession(sessionId: string, message: any, excludeConnectionId?: string) {
  const activeSession = activeSessions.get(sessionId);
  if (!activeSession) return;

  for (const [connId, socket] of collaborationConnections.entries()) {
    if (connId === excludeConnectionId) continue;
    
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        sessionId,
        ...message
      }));
    }
  }
}