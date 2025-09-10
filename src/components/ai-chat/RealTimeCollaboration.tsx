import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Share2,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';

interface RealTimeCollaborationProps {
  conversationId: string;
  onInviteUser?: (userId: string) => void;
}

interface Presence {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  is_typing: boolean;
  last_seen: string;
  cursor_position?: number;
}

export const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  conversationId,
  onInviteUser
}) => {
  const { user } = useAuth();
  const {
    collaborators,
    typingUsers,
    messageStatuses,
    addCollaborator,
    removeCollaborator,
    setUserTyping,
    updateMessageStatus
  } = useChatContextBridge();

  const [presences, setPresences] = useState<Record<string, Presence>>({});
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [showPresence, setShowPresence] = useState(true);
  const channel = supabase.channel(`conversation:${conversationId}`);

  useEffect(() => {
    if (!user || !conversationId) return;

    // Set up real-time presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const newPresences: Record<string, Presence> = {};
        
        Object.entries(newState).forEach(([key, presence]) => {
          if (Array.isArray(presence) && presence.length > 0) {
            newPresences[key] = presence[0] as Presence;
          }
        });
        
        setPresences(newPresences);
        
        // Update collaborators
        Object.values(newPresences).forEach(p => {
          if (p.user_id !== user.id) {
            addCollaborator(p.user_id, p.user_name);
          }
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0] as Presence;
        if (presence.user_id !== user.id) {
          addCollaborator(presence.user_id, presence.user_name);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const presence = leftPresences[0] as Presence;
        removeCollaborator(presence.user_id);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setUserTyping(payload.user_id, payload.is_typing);
        }
      })
      .on('broadcast', { event: 'message_status' }, ({ payload }) => {
        updateMessageStatus(payload.message_id, payload.status, payload.user_id);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const userStatus: Presence = {
            user_id: user.id,
            user_name: user.email?.split('@')[0] || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            is_typing: false,
            last_seen: new Date().toISOString()
          };

          await channel.track(userStatus);
          setIsCollaborating(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  const broadcastTyping = (isTyping: boolean) => {
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user?.id,
        is_typing: isTyping
      }
    });
  };

  const broadcastMessageStatus = (messageId: string, status: string) => {
    channel.send({
      type: 'broadcast',
      event: 'message_status',
      payload: {
        message_id: messageId,
        status,
        user_id: user?.id
      }
    });
  };

  const shareConversation = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join AI Chat Conversation',
          text: 'Join this collaborative AI chat session',
          url: `${window.location.origin}/ai-streaming-chat?join=${conversationId}`
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/ai-streaming-chat?join=${conversationId}`
        );
        // Show toast
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getActiveCollaborators = () => {
    return Object.values(presences).filter(p => p.user_id !== user?.id);
  };

  const getMessageStatusIcon = (messageId: string) => {
    const status = messageStatuses[messageId];
    if (!status) return null;

    switch (status.status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'sent':
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isCollaborating) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Connecting to collaboration...</span>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Collaboration Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Users className="h-4 w-4 text-blue-500" />
              {getActiveCollaborators().length > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <span className="text-sm font-medium">
              Collaborative Session
            </span>
            <Badge variant="secondary" className="text-xs">
              {getActiveCollaborators().length + 1} active
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPresence(!showPresence)}
            className="h-7 px-2"
          >
            {showPresence ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={shareConversation}
            className="h-7 px-2"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Active Participants */}
      <AnimatePresence>
        {showPresence && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-muted/20 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Participants</span>
            </div>

            <div className="space-y-2">
              {/* Current User */}
              <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">You</div>
                  <div className="text-xs text-muted-foreground">Host</div>
                </div>
                <Badge variant="default" className="text-xs">Online</Badge>
              </div>

              {/* Other Participants */}
              {getActiveCollaborators().map((presence) => (
                <motion.div
                  key={presence.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 p-2 bg-background/50 rounded"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={presence.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {presence.user_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{presence.user_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {typingUsers.includes(presence.user_id) ? (
                        <>
                          <MessageCircle className="h-3 w-3" />
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Typing...
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Active
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Member</Badge>
                </motion.div>
              ))}
            </div>

            {getActiveCollaborators().length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No other participants yet. Share the link to invite others!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Indicators */}
      <AnimatePresence>
        {typingUsers.length > 0 && showPresence && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex gap-1"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animation-delay-200" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animation-delay-400" />
            </motion.div>
            <span className="text-sm text-muted-foreground">
              {typingUsers.length === 1
                ? `${presences[typingUsers[0]]?.user_name || 'Someone'} is typing...`
                : `${typingUsers.length} people are typing...`
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
