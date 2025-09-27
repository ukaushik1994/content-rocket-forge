import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageStatusUpdate {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  userId: string;
  timestamp: string;
}

export const useRealtimeMessageStatus = (conversationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Broadcast message status update
  const broadcastMessageStatus = useCallback(async (
    messageId: string, 
    status: 'sent' | 'delivered' | 'read' | 'failed'
  ) => {
    if (!user || !conversationId) return;

    try {
      // Update database
      await supabase.rpc('update_message_status', {
        message_id: messageId,
        new_status: status,
        user_id: user.id
      });

      // Broadcast to other clients
      const channel = supabase.channel(`conversation:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'message_status_update',
        payload: {
          messageId,
          status,
          userId: user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error broadcasting message status:', error);
    }
  }, [user, conversationId]);

  // Mark message as delivered when it appears
  const markAsDelivered = useCallback((messageId: string) => {
    broadcastMessageStatus(messageId, 'delivered');
  }, [broadcastMessageStatus]);

  // Mark message as read when user views it
  const markAsRead = useCallback((messageId: string) => {
    broadcastMessageStatus(messageId, 'read');
  }, [broadcastMessageStatus]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('broadcast', { event: 'message_status_update' }, (payload: { payload: MessageStatusUpdate }) => {
        const { messageId, status, userId, timestamp } = payload.payload;
        
        // Don't show notifications for own status updates
        if (userId === user.id) return;

        // Show toast for important status updates
        if (status === 'read') {
          toast({
            title: "Message Read",
            description: "Your message has been read",
            duration: 2000,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, toast]);

  return {
    broadcastMessageStatus,
    markAsDelivered,
    markAsRead
  };
};