import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PresenceUser {
  userId: string;
  userName: string;
  userEmail?: string;
  joinedAt: string;
  lastSeen: string;
  isActive: boolean;
  metadata?: {
    cursorPosition?: { x: number; y: number };
    currentView?: string;
    isTyping?: boolean;
  };
}

interface PresenceState {
  users: PresenceUser[];
  activeCount: number;
  isTracking: boolean;
}

export const useRealtimePresence = (conversationId?: string) => {
  const [state, setState] = useState<PresenceState>({
    users: [],
    activeCount: 0,
    isTracking: false,
  });

  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const presenceRef = useRef<PresenceUser | null>(null);

  // Update user presence
  const updatePresence = useCallback(async (metadata?: PresenceUser['metadata']) => {
    if (!channelRef.current || !user || !conversationId) return;

    const presenceData: PresenceUser = {
      userId: user.id,
      userName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Anonymous',
      userEmail: user.email,
      joinedAt: presenceRef.current?.joinedAt || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isActive: true,
      metadata: {
        ...presenceRef.current?.metadata,
        ...metadata,
      },
    };

    presenceRef.current = presenceData;

    try {
      await channelRef.current.track(presenceData);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user, conversationId]);

  // Start tracking presence
  const startTracking = useCallback(async () => {
    if (!conversationId || !user || channelRef.current) return;

    console.log('👥 Starting presence tracking for conversation:', conversationId);

    const channel = supabase.channel(`presence:${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Listen to presence sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: PresenceUser[] = [];

        Object.keys(presenceState).forEach((key) => {
          const presence = presenceState[key];
          if (presence && presence.length > 0) {
            const presenceData = presence[0] as any;
            // Validate presence data before adding
            if (presenceData.userId && presenceData.userName) {
              users.push(presenceData as PresenceUser);
            }
          }
        });

        setState(prev => ({
          ...prev,
          users,
          activeCount: users.filter(u => u.isActive).length,
        }));

        console.log('👥 Presence synced:', users.length, 'users');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      });

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setState(prev => ({ ...prev, isTracking: true }));
        await updatePresence();
      }
    });

    channelRef.current = channel;
  }, [conversationId, user, updatePresence]);

  // Stop tracking presence
  const stopTracking = useCallback(async () => {
    if (!channelRef.current) return;

    console.log('👥 Stopping presence tracking');

    try {
      await channelRef.current.untrack();
      await supabase.removeChannel(channelRef.current);
    } catch (error) {
      console.error('Error stopping presence tracking:', error);
    }

    channelRef.current = null;
    presenceRef.current = null;
    setState({
      users: [],
      activeCount: 0,
      isTracking: false,
    });
  }, []);

  // Update cursor position
  const updateCursor = useCallback((position: { x: number; y: number }) => {
    updatePresence({ cursorPosition: position });
  }, [updatePresence]);

  // Update typing status
  const setTyping = useCallback((isTyping: boolean) => {
    updatePresence({ isTyping });
  }, [updatePresence]);

  // Update current view
  const setCurrentView = useCallback((view: string) => {
    updatePresence({ currentView: view });
  }, [updatePresence]);

  // Heartbeat to keep presence alive
  useEffect(() => {
    if (!state.isTracking) return;

    const heartbeatInterval = setInterval(() => {
      updatePresence();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [state.isTracking, updatePresence]);

  // Auto-start tracking when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [conversationId, user]);

  // Handle visibility change (tab active/inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence({ isTyping: false });
      } else {
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updatePresence]);

  return {
    ...state,
    startTracking,
    stopTracking,
    updateCursor,
    setTyping,
    setCurrentView,
    currentUser: presenceRef.current,
    otherUsers: state.users.filter(u => u.userId !== user?.id),
  };
};
