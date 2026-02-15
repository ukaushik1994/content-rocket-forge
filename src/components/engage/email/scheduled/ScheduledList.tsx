import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Clock, Send, X, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const ScheduledList = () => {
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['scheduled-emails', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('status', 'queued')
        .order('queued_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const cancelEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] });
      toast.success('Email cancelled');
    },
  });

  const sendNow = useMutation({
    mutationFn: async (id: string) => {
      // Just keep as queued - the job runner will pick it up
      toast.info('Email will be sent on next processing cycle');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{messages.length} queued emails</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No scheduled emails</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg: any, i: number) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <GlassCard className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{msg.to_email}</p>
                    <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Queued {formatDistanceToNow(new Date(msg.queued_at), { addSuffix: true })}
                      </span>
                      {msg.campaign_id && <Badge variant="secondary" className="text-[9px] h-4">Campaign</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => sendNow.mutate(msg.id)}>
                      <Send className="h-3 w-3 mr-0.5" /> Send Now
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => cancelEmail.mutate(msg.id)}>
                      <X className="h-3 w-3 mr-0.5" /> Cancel
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
