import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Send, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

const statusBadge: Record<string, { color: string; icon: any }> = {
  sent: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
  delivered: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle },
  failed: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  queued: { color: 'bg-muted/50 text-muted-foreground border-border/50', icon: Clock },
};

type DateGroup = { label: string; items: any[] };

const groupByDate = (messages: any[]): DateGroup[] => {
  const groups: Record<string, any[]> = {};
  const order: string[] = [];

  messages.forEach((m: any) => {
    const date = m.sent_at ? new Date(m.sent_at) : new Date();
    let label = format(date, 'MMMM d, yyyy');
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else if (isThisWeek(date)) label = format(date, 'EEEE');

    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(m);
  });

  return order.map(label => ({ label, items: groups[label] }));
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

  const dateGroups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sent emails..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/40" />
        </div>
        <p className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} sent</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto">
            <Send className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm">No sent emails</p>
        </div>
      ) : (
        <div className="space-y-5">
          {dateGroups.map(group => (
            <div key={group.label}>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">{group.label}</p>
              <div className="space-y-1.5">
                {group.items.map((msg: any, i: number) => {
                  const sb = statusBadge[msg.status] || statusBadge.sent;
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}>
                      <GlassCard className="p-4 cursor-pointer hover:border-border/60 transition-all" onClick={() => setDetail(msg)}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{msg.to_email}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant="outline" className={`text-[10px] h-5 ${sb.color}`}>
                              <sb.icon className="h-3 w-3 mr-0.5" />
                              {msg.status}
                            </Badge>
                            {msg.sent_at && <span className="text-[11px] text-muted-foreground">{format(new Date(msg.sent_at), 'h:mm a')}</span>}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog — vertical layout */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <Mail className="h-4.5 w-4.5 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Email Details</h3>
          </div>
          {detail && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">To</span>
                  <span className="text-sm text-foreground">{detail.to_email}</span>
                </div>
                <div className="h-px bg-border/30" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Subject</span>
                  <span className="text-sm text-foreground truncate max-w-[280px]">{detail.subject}</span>
                </div>
                <div className="h-px bg-border/30" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[10px] h-5">{detail.status}</Badge>
                </div>
                <div className="h-px bg-border/30" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sent</span>
                  <span className="text-sm text-foreground">{detail.sent_at ? format(new Date(detail.sent_at), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                </div>
              </div>
              {detail.error && <p className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg">{detail.error}</p>}
              <div className="border border-border/30 rounded-xl p-4 max-h-[300px] overflow-y-auto bg-background/50">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.body_html || '') }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
