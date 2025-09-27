import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CollaborationSession {
  id: string;
  session_name: string;
  host_user_id: string;
  participants: Array<{
    user_id: string;
    role: string;
    joined_at: string;
  }>;
  screen_sharing_active: boolean;
  screen_sharing_user_id?: string;
  session_data: any;
  created_at: string;
  status: string;
}

interface Annotation {
  id: string;
  userId: string;
  position: { x: number; y: number };
  content: string;
  type: 'highlight' | 'comment' | 'marker';
  created_at: string;
}

export const useAdvancedCollaboration = () => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collaborationSocket, setCollaborationSocket] = useState<WebSocket | null>(null);
  const { user } = useAuth();

  // Connect to collaboration WebSocket
  const connectCollaboration = useCallback(() => {
    if (!user) return;

    const ws = new WebSocket(`wss://iqiundzzcepmuykcnfbc.functions.supabase.co/ai-collaboration`);
    
    ws.onopen = () => {
      console.log('🤝 Connected to collaboration WebSocket');
      setCollaborationSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleCollaborationMessage(data);
    };

    ws.onclose = () => {
      console.log('🔌 Collaboration WebSocket closed');
      setCollaborationSocket(null);
    };

    ws.onerror = (error) => {
      console.error('❌ Collaboration WebSocket error:', error);
    };

    return ws;
  }, [user]);

  // Handle collaboration messages
  const handleCollaborationMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'participant_joined':
        toast.success(`User joined the collaboration session`);
        // Update active session participants
        if (activeSession && data.sessionId === activeSession.id) {
          setActiveSession(prev => prev ? {
            ...prev,
            participants: [...prev.participants, {
              user_id: data.userId,
              role: 'participant',
              joined_at: data.timestamp
            }]
          } : null);
        }
        break;

      case 'screen_sharing_started':
        toast.info('Screen sharing started');
        break;

      case 'screen_sharing_stopped':
        toast.info('Screen sharing stopped');
        break;

      case 'annotation_added':
        setAnnotations(prev => [...prev, data.annotation]);
        break;

      case 'cursor_update':
        // Handle cursor movement updates
        console.log('Cursor update:', data);
        break;

      case 'selection_update':
        // Handle text selection updates
        console.log('Selection update:', data);
        break;
    }
  }, [activeSession]);

  // Create collaboration session
  const createSession = useCallback(async (sessionName: string, conversationId?: string) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-collaboration', {
        body: {
          action: 'create_session',
          userId: user.id,
          data: {
            sessionName,
            conversationId,
            sessionData: {}
          }
        }
      });

      if (error) throw error;

      const newSession = data.session;
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      
      toast.success('Collaboration session created');
      return newSession;

    } catch (error) {
      console.error('Error creating collaboration session:', error);
      toast.error('Failed to create collaboration session');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Join collaboration session
  const joinSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-collaboration', {
        body: {
          action: 'join_session',
          sessionId,
          userId: user.id
        }
      });

      if (error) throw error;

      const session = data.session;
      setActiveSession(session);
      
      toast.success('Joined collaboration session');

    } catch (error) {
      console.error('Error joining collaboration session:', error);
      toast.error('Failed to join collaboration session');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Start screen sharing
  const startScreenSharing = useCallback(async () => {
    if (!activeSession || !user) return;

    try {
      const { error } = await supabase.functions.invoke('ai-collaboration', {
        body: {
          action: 'start_screen_sharing',
          sessionId: activeSession.id,
          userId: user.id
        }
      });

      if (error) throw error;

      setActiveSession(prev => prev ? {
        ...prev,
        screen_sharing_active: true,
        screen_sharing_user_id: user.id
      } : null);

    } catch (error) {
      console.error('Error starting screen sharing:', error);
      toast.error('Failed to start screen sharing');
    }
  }, [activeSession, user]);

  // Stop screen sharing
  const stopScreenSharing = useCallback(async () => {
    if (!activeSession || !user) return;

    try {
      const { error } = await supabase.functions.invoke('ai-collaboration', {
        body: {
          action: 'stop_screen_sharing',
          sessionId: activeSession.id,
          userId: user.id
        }
      });

      if (error) throw error;

      setActiveSession(prev => prev ? {
        ...prev,
        screen_sharing_active: false,
        screen_sharing_user_id: undefined
      } : null);

    } catch (error) {
      console.error('Error stopping screen sharing:', error);
      toast.error('Failed to stop screen sharing');
    }
  }, [activeSession, user]);

  // Add annotation
  const addAnnotation = useCallback(async (annotation: Omit<Annotation, 'id' | 'userId' | 'created_at'>) => {
    if (!activeSession || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-collaboration', {
        body: {
          action: 'add_annotation',
          sessionId: activeSession.id,
          userId: user.id,
          data: { annotation }
        }
      });

      if (error) throw error;

      const newAnnotation = data.annotation;
      setAnnotations(prev => [...prev, newAnnotation]);

    } catch (error) {
      console.error('Error adding annotation:', error);
      toast.error('Failed to add annotation');
    }
  }, [activeSession, user]);

  // Send cursor position
  const sendCursorPosition = useCallback((position: { x: number; y: number }) => {
    if (collaborationSocket && activeSession && user) {
      collaborationSocket.send(JSON.stringify({
        type: 'cursor_move',
        sessionId: activeSession.id,
        userId: user.id,
        position
      }));
    }
  }, [collaborationSocket, activeSession, user]);

  // Send text selection
  const sendTextSelection = useCallback((selection: any) => {
    if (collaborationSocket && activeSession && user) {
      collaborationSocket.send(JSON.stringify({
        type: 'text_selection',
        sessionId: activeSession.id,
        userId: user.id,
        selection
      }));
    }
  }, [collaborationSocket, activeSession, user]);

  // Load user sessions
  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .or(`host_user_id.eq.${user.id},participants.cs.{"user_id":"${user.id}"}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSessions((data || []).map(session => ({
        ...session,
        participants: Array.isArray(session.participants) ? session.participants : []
      })));

    } catch (error) {
      console.error('Error loading collaboration sessions:', error);
    }
  }, [user]);

  // Initialize collaboration
  useEffect(() => {
    if (user) {
      loadSessions();
      const ws = connectCollaboration();
      
      return () => {
        ws?.close();
      };
    }
  }, [user, loadSessions, connectCollaboration]);

  return {
    // State
    sessions,
    activeSession,
    annotations,
    isLoading,
    isConnected: !!collaborationSocket,

    // Actions
    createSession,
    joinSession,
    startScreenSharing,
    stopScreenSharing,
    addAnnotation,
    sendCursorPosition,
    sendTextSelection,
    loadSessions,

    // Utils
    isHost: activeSession?.host_user_id === user?.id,
    participantCount: activeSession?.participants.length || 0,
    isScreenSharing: activeSession?.screen_sharing_active || false,
    canShare: activeSession?.host_user_id === user?.id || activeSession?.screen_sharing_user_id === user?.id
  };
};