import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, CheckCircle2, User, ExternalLink, UserPlus, Send, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  assigned: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const typeIcons: Record<string, string> = {
  mention: '@ Mention',
  comment: '💬 Comment',
  dm: '✉️ DM',
  reply: '↩️ Reply',
};

export const SocialInbox = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [newReplyTitle, setNewReplyTitle] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['social-inbox', currentWorkspaceId, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('social_inbox_items')
        .select('*, engage_contacts(email, first_name, last_name)')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false })
        .limit(100);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: savedReplies = [] } = useQuery({
    queryKey: ['social-saved-replies', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('social_saved_replies')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('social_inbox_items').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-inbox'] });
      toast.success('Status updated');
    },
  });

  const createSavedReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('social_saved_replies').insert({
        workspace_id: currentWorkspaceId!,
        title: newReplyTitle,
        content: newReplyContent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-saved-replies'] });
      setNewReplyTitle('');
      setNewReplyContent('');
      toast.success('Saved reply created');
    },
  });

  const deleteSavedReply = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_saved_replies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-saved-replies'] });
      toast.success('Reply deleted');
    },
  });

  const filtered = items.filter((item: any) =>
    !search || item.content?.toLowerCase().includes(search.toLowerCase()) || item.author_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    open: items.filter((i: any) => i.status === 'open').length,
    assigned: items.filter((i: any) => i.status === 'assigned').length,
    done: items.filter((i: any) => i.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Social Inbox</h3>
            <p className="text-sm text-muted-foreground">Mentions, comments, and DMs in one place</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSavedReplies(true)}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Saved Replies ({savedReplies.length})
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open', count: stats.open, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' },
          { label: 'Assigned', count: stats.assigned, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400' },
          { label: 'Done', count: stats.done, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400' },
        ].map((s) => (
          <GlassCard key={s.label} className={`p-3 bg-gradient-to-br ${s.color}`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold ${s.text}`}>{s.count}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-muted-foreground">No inbox items yet</p>
          <p className="text-xs text-muted-foreground">Social mentions and DMs will appear here when connected</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item: any, i: number) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard
                className="p-4 cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => { setSelectedItem(item); setReplyContent(''); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{typeIcons[item.type] || item.type}</span>
                      {item.author_name && (
                        <span className="text-sm font-medium text-foreground">{item.author_name}</span>
                      )}
                      <Badge variant="outline" className={`text-[10px] ${statusColors[item.status] || ''}`}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {format(new Date(item.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  {canEdit && item.status !== 'done' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: item.id, status: 'done' }); }}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader><DialogTitle>Inbox Item</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{selectedItem.author_name || 'Unknown'}</span>
                {selectedItem.author_profile_url && (
                  <a href={selectedItem.author_profile_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 text-primary" />
                  </a>
                )}
              </div>
              <GlassCard className="p-3">
                <p className="text-sm text-foreground">{selectedItem.content}</p>
              </GlassCard>

              {selectedItem.engage_contacts ? (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> Linked to: {selectedItem.engage_contacts.email}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not linked to a contact</p>
              )}

              {/* Quick Reply */}
              <div>
                <Label className="text-xs">Quick Reply</Label>
                <Textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3} className="mt-1" placeholder="Type your reply..." />
                {savedReplies.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {savedReplies.slice(0, 5).map((r: any) => (
                      <Button key={r.id} variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setReplyContent(r.content)}>
                        {r.title}
                      </Button>
                    ))}
                  </div>
                )}
                <Button size="sm" className="mt-2 w-full" disabled={!replyContent.trim()}>
                  <Send className="h-3.5 w-3.5 mr-1" /> Send Reply
                </Button>
              </div>

              {/* Status Actions */}
              {canEdit && (
                <div className="flex gap-2">
                  {(['open', 'assigned', 'done'] as const).map(s => (
                    <Button
                      key={s}
                      variant={selectedItem.status === s ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => { updateStatus.mutate({ id: selectedItem.id, status: s }); setSelectedItem({ ...selectedItem, status: s }); }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Saved Replies Dialog */}
      <Dialog open={showSavedReplies} onOpenChange={setShowSavedReplies}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader><DialogTitle>Saved Replies</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {savedReplies.map((r: any) => (
              <GlassCard key={r.id} className="p-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.content}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteSavedReply.mutate(r.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </GlassCard>
            ))}
            <div className="border-t border-border/30 pt-3 space-y-2">
              <Input value={newReplyTitle} onChange={e => setNewReplyTitle(e.target.value)} placeholder="Title" className="h-8 text-xs" />
              <Textarea value={newReplyContent} onChange={e => setNewReplyContent(e.target.value)} placeholder="Reply content..." rows={2} className="text-xs" />
              <Button size="sm" className="w-full" onClick={() => createSavedReply.mutate()} disabled={!newReplyTitle || !newReplyContent}>
                <Plus className="h-3 w-3 mr-1" /> Add Saved Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
