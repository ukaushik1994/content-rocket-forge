import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Send, X, Calendar, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SkeletonCard = () => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  </GlassCard>
);

export const ScheduledList = () => {
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter((m: any) =>
      m.to_email?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q)
    );
  }, [messages, search]);

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
      const { error } = await supabase
        .from('email_messages')
        .update({ status: 'sending', queued_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] });
      toast.success('Email moved to sending queue');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search scheduled emails..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/40" />
        </div>
        <p className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} queued</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto">
            <Calendar className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm">No scheduled emails</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg: any, i: number) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <GlassCard className="p-4 hover:border-border/60 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{msg.to_email}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        Queued {formatDistanceToNow(new Date(msg.queued_at), { addSuffix: true })}
                      </span>
                      {msg.campaign_id && <Badge variant="secondary" className="text-[10px] h-4">Campaign</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => sendNow.mutate(msg.id)} disabled={sendNow.isPending}>
                      <Send className="h-3 w-3" /> Send Now
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                          <X className="h-3 w-3" /> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this email?</AlertDialogTitle>
                          <AlertDialogDescription>This email to {msg.to_email} will be permanently removed from the queue.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep</AlertDialogCancel>
                          <AlertDialogAction onClick={() => cancelEmail.mutate(msg.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel Email</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
