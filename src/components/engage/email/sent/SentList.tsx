import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { EngageDialogHeader } from '../../shared/EngageDialogHeader';

const statusBadge: Record<string, { color: string; icon: any }> = {
  sent: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  delivered: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle },
  failed: { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  queued: { color: 'bg-muted/50 text-muted-foreground border-border/50', icon: Clock },
};

export const SentList = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['sent-emails', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .in('status', ['sent', 'delivered'])
        .order('sent_at', { ascending: false })
        .limit(200);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sent emails..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/40" />
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} sent</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Send className="h-8 w-8 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No sent emails</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg: any, i: number) => {
            const sb = statusBadge[msg.status] || statusBadge.sent;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <GlassCard className="p-3 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setDetail(msg)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{msg.to_email}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] h-5 ${sb.color}`}>
                        <sb.icon className="h-3 w-3 mr-0.5" />
                        {msg.status}
                      </Badge>
                      {msg.sent_at && <span className="text-[10px] text-muted-foreground">{format(new Date(msg.sent_at), 'MMM d, h:mm a')}</span>}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <EngageDialogHeader icon={Send} title="Email Details" gradientFrom="from-emerald-400" gradientTo="to-teal-400" iconColor="text-emerald-400" />
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">To:</span> <span className="text-foreground">{detail.to_email}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className="text-[10px] h-4">{detail.status}</Badge></div>
                <div><span className="text-muted-foreground">Subject:</span> <span className="text-foreground">{detail.subject}</span></div>
                <div><span className="text-muted-foreground">Sent:</span> <span className="text-foreground">{detail.sent_at ? format(new Date(detail.sent_at), 'MMM d, yyyy h:mm a') : 'N/A'}</span></div>
              </div>
              {detail.error && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{detail.error}</p>}
              <div className="border border-border/30 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.body_html || '') }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
