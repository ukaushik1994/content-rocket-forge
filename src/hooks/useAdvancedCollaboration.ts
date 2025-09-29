import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollaborationUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  isActive: boolean;
  isTyping?: boolean;
  lastSeen?: Date;
  cursorPosition?: { x: number; y: number };
  color?: string;
  status: 'online' | 'away' | 'offline';
}

interface TypingUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  startedTyping: Date;
}

export const useAdvancedCollaboration = (conversationId?: string) => {
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Enhanced typing indicator with user names
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase
        .from('user_typing_indicators')
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          is_typing: isTyping,
          user_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [user, conversationId]);

  // Enhanced presence tracking
  const setupPresenceTracking = useCallback(() => {
    if (!user || !conversationId || channelRef.current) return;

    const channel = supabase.channel(`presence:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: CollaborationUser[] = [];
        
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== user.id) {
              activeUsers.push({
                userId: presence.user_id,
                userName: presence.user_name,
                userAvatar: presence.user_avatar,
                isActive: true,
                status: 'online',
                lastSeen: new Date(presence.last_seen),
                color: presence.color || `hsl(${Math.random() * 360}, 70%, 50%)`
              });
            }
          });
        });
        
        setCollaborators(activeUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👥 User joined:', newPresences);
        newPresences.forEach((presence: any) => {
          if (presence.user_id !== user.id) {
            toast({
              title: "User Joined",
              description: `${presence.user_name} joined the conversation`,
              duration: 3000,
            });
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👥 User left:', leftPresences);
        leftPresences.forEach((presence: any) => {
          if (presence.user_id !== user.id) {
            toast({
              title: "User Left", 
              description: `${presence.user_name} left the conversation`,
              duration: 3000,
            });
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await channel.track({
            user_id: user.id,
            user_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
            user_avatar: user.user_metadata?.avatar_url,
            last_seen: new Date().toISOString(),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
          });
          setIsConnected(true);
        }
      });

    channelRef.current = channel;
  }, [user, conversationId, toast]);

  // Listen for typing indicators
  const setupTypingIndicators = useCallback(() => {
    if (!conversationId) return;

    const typingChannel = supabase.channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const indicator = payload.new as any;
          
          if (indicator && indicator.user_id !== user?.id) {
            setTypingUsers(prev => {
              const filtered = prev.filter(tu => tu.userId !== indicator.user_id);
              
              if (indicator.is_typing) {
                return [...filtered, {
                  userId: indicator.user_id,
                  userName: indicator.user_name || 'Anonymous',
                  userAvatar: indicator.user_avatar,
                  startedTyping: new Date(indicator.updated_at)
                }];
              }
              
              return filtered;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, user]);

  // Broadcast AI response to team
  const broadcastAIResponse = useCallback(async (messageId: string, content: string, actions?: any[]) => {
    if (!user || !conversationId) return;

    try {
      const channel = supabase.channel(`ai-response:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'ai_response_shared',
        payload: {
          messageId,
          content,
          actions,
          sharedBy: user.id,
          sharedByName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error broadcasting AI response:', error);
    }
  }, [user, conversationId]);

  const startScreenSharing = useCallback(() => {
    setIsScreenSharing(true);
    toast({ title: "Screen sharing started" });
  }, [toast]);

  const stopScreenSharing = useCallback(() => {
    setIsScreenSharing(false);
    toast({ title: "Screen sharing stopped" });
  }, [toast]);

  // Cleanup
  useEffect(() => {
    if (conversationId) {
      setupPresenceTracking();
      const cleanupTyping = setupTypingIndicators();
      
      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        if (cleanupTyping) cleanupTyping();
      };
    }
  }, [conversationId, setupPresenceTracking, setupTypingIndicators]);

  // Auto-cleanup typing indicator when user stops typing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const resetTyping = () => {
      timeoutId = setTimeout(() => {
        updateTypingStatus(false);
      }, 3000);
    };

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updateTypingStatus]);

  return {
    collaborators,
    typingUsers,
    isScreenSharing,
    isConnected,
    startScreenSharing,
    stopScreenSharing,
    updateTypingStatus,
    broadcastAIResponse,
    activeUserCount: collaborators.length,
    typingUserNames: typingUsers.map(tu => tu.userName)
  };
};