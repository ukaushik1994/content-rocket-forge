import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Zap, MoreVertical, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const triggerLabels: Record<string, string> = {
  segment_entry: 'Segment Entry',
  tag_added: 'Tag Added',
  event_occurred: 'Event Occurred',
};

const actionLabels: Record<string, string> = {
  send_email: 'Send Email',
  add_tag: 'Add Tag',
  remove_tag: 'Remove Tag',
  enroll_journey: 'Enroll in Journey',
  webhook: 'Webhook',
};

export const AutomationsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', trigger_type: 'segment_entry', action_type: 'send_email' });

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['engage-automations', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engage_automations').select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const createAutomation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('engage_automations').insert({
        workspace_id: currentWorkspaceId!, name: form.name,
        trigger_config: { type: form.trigger_type },
        actions: [{ type: form.action_type }],
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-automations'] });
      setShowCreate(false); setForm({ name: '', trigger_type: 'segment_entry', action_type: 'send_email' });
      toast.success('Automation created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteAutomation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('engage_automations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['engage-automations'] }); toast.success('Deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { error } = await supabase.from('engage_automations').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['engage-automations'] }),
  });

  const stats = {
    active: automations.filter((a: any) => a.status === 'active').length,
    paused: automations.filter((a: any) => a.status === 'paused').length,
    total: automations.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Automations</h2>
          <p className="text-sm text-muted-foreground">Rule-based triggers and actions</p>
        </div>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Automation</Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
              <DialogHeader><DialogTitle>Create Automation</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Trigger</Label>
                  <Select value={form.trigger_type} onValueChange={v => setForm(f => ({ ...f, trigger_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="segment_entry">Segment Entry</SelectItem>
                      <SelectItem value="tag_added">Tag Added</SelectItem>
                      <SelectItem value="event_occurred">Event Occurred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={form.action_type} onValueChange={v => setForm(f => ({ ...f, action_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_email">Send Email</SelectItem>
                      <SelectItem value="add_tag">Add Tag</SelectItem>
                      <SelectItem value="remove_tag">Remove Tag</SelectItem>
                      <SelectItem value="enroll_journey">Enroll in Journey</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createAutomation.mutate()} disabled={!form.name} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      {automations.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active', count: stats.active, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: Play },
            { label: 'Paused', count: stats.paused, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', icon: Pause },
            { label: 'Total', count: stats.total, color: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', icon: Zap },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className={`p-3 bg-gradient-to-br ${s.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-xl font-bold ${s.text}`}>{s.count}</p>
                  </div>
                  <s.icon className={`h-5 w-5 ${s.text} opacity-50`} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : automations.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-amber-400" />
          </div>
          <p className="text-muted-foreground">No automations yet</p>
          {canEdit && <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Create First Automation</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {automations.map((a: any, i: number) => {
            const triggerType = a.trigger_config?.type || 'none';
            const actions = (a.actions || []) as any[];
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="p-4 hover:border-primary/30 hover:scale-[1.01] transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <h3 className="font-medium text-foreground">{a.name}</h3>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${a.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-muted/50 text-muted-foreground border-border/50'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} /> {a.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Trigger: {triggerLabels[triggerType] || triggerType}</span>
                        <span>•</span>
                        <span>{actions.map((act: any) => actionLabels[act.type] || act.type).join(', ')}</span>
                        <span>•</span>
                        <span>{format(new Date(a.created_at), 'MMM d')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <Switch
                          checked={a.status === 'active'}
                          onCheckedChange={() => toggleStatus.mutate({ id: a.id, currentStatus: a.status })}
                        />
                      )}
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteAutomation.mutate(a.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
