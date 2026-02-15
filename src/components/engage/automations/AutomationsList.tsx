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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Zap, MoreVertical, Trash2, Play, Pause, Pencil, X, Copy, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { RuleBuilder, type Rule } from '@/components/engage/shared/RuleBuilder';

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

interface ActionItem {
  type: string;
  config: Record<string, string>;
}

interface AutomationForm {
  name: string;
  trigger_type: string;
  trigger_value: string;
  actions: ActionItem[];
  conditions: Rule[];
}

const defaultForm: AutomationForm = {
  name: '', trigger_type: 'segment_entry', trigger_value: '', actions: [{ type: 'send_email', config: {} }], conditions: [],
};

export const AutomationsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AutomationForm>({ ...defaultForm });
  const [showConditions, setShowConditions] = useState(false);

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

  // Execution counts from activity log
  const { data: execCounts = {} } = useQuery({
    queryKey: ['automation-exec-counts', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_activity_log')
        .select('payload')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('channel', 'automation');
      const counts: Record<string, number> = {};
      (data || []).forEach((log: any) => {
        const aId = log.payload?.automation_id;
        if (aId) counts[aId] = (counts[aId] || 0) + 1;
      });
      return counts;
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['auto-templates', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_templates').select('id, name').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['auto-journeys', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('journeys').select('id, name').eq('workspace_id', currentWorkspaceId!).eq('status', 'active');
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const { data: segmentsList = [] } = useQuery({
    queryKey: ['auto-segments', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('engage_segments').select('id, name').eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const openDialog = (automation?: any) => {
    if (automation) {
      setEditingId(automation.id);
      const tc = automation.trigger_config || {};
      const acts = (automation.actions || []).map((a: any) => ({
        type: a.type || 'send_email',
        config: a.config || {},
      }));
      const conds = (automation.conditions || []) as Rule[];
      setForm({
        name: automation.name,
        trigger_type: tc.type || 'segment_entry',
        trigger_value: tc.value || '',
        actions: acts.length ? acts : [{ type: 'send_email', config: {} }],
        conditions: conds,
      });
      setShowConditions(conds.length > 0);
    } else {
      setEditingId(null);
      setForm({ ...defaultForm, actions: [{ type: 'send_email', config: {} }], conditions: [] });
      setShowConditions(false);
    }
    setShowDialog(true);
  };

  const saveAutomation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        name: form.name,
        trigger_config: { type: form.trigger_type, value: form.trigger_value || undefined } as any,
        actions: form.actions.map(a => ({ type: a.type, config: a.config })) as any,
        conditions: form.conditions.length > 0 ? (form.conditions as any) : null,
      };

      if (editingId) {
        const { error } = await supabase.from('engage_automations').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('engage_automations').insert({
          ...payload, workspace_id: currentWorkspaceId!, created_by: user?.id,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-automations'] });
      setShowDialog(false);
      toast.success(editingId ? 'Automation updated' : 'Automation created');
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

  const duplicateAutomation = useMutation({
    mutationFn: async (a: any) => {
      const { error } = await supabase.from('engage_automations').insert({
        workspace_id: currentWorkspaceId!,
        created_by: user?.id,
        name: `${a.name} (Copy)`,
        trigger_config: a.trigger_config,
        actions: a.actions,
        conditions: a.conditions,
        status: 'paused',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-automations'] });
      toast.success('Automation duplicated');
    },
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

  const addAction = () => setForm(f => ({ ...f, actions: [...f.actions, { type: 'send_email', config: {} }] }));
  const removeAction = (idx: number) => setForm(f => ({ ...f, actions: f.actions.filter((_, i) => i !== idx) }));
  const updateAction = (idx: number, key: string, val: any) => {
    setForm(f => ({
      ...f,
      actions: f.actions.map((a, i) => i === idx ? (key === 'type' ? { type: val, config: {} } : { ...a, config: { ...a.config, [key]: val } }) : a),
    }));
  };

  const stats = {
    active: automations.filter((a: any) => a.status === 'active').length,
    paused: automations.filter((a: any) => a.status === 'paused').length,
    total: automations.length,
  };

  const renderActionConfig = (action: ActionItem, idx: number) => {
    switch (action.type) {
      case 'send_email':
        return (
          <Select value={action.config.template_id || ''} onValueChange={v => updateAction(idx, 'template_id', v)}>
            <SelectTrigger className="h-8"><SelectValue placeholder="Pick template" /></SelectTrigger>
            <SelectContent>{templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        );
      case 'add_tag':
      case 'remove_tag':
        return <Input className="h-8" placeholder="Tag name" value={action.config.tag || ''} onChange={e => updateAction(idx, 'tag', e.target.value)} />;
      case 'enroll_journey':
        return (
          <Select value={action.config.journey_id || ''} onValueChange={v => updateAction(idx, 'journey_id', v)}>
            <SelectTrigger className="h-8"><SelectValue placeholder="Pick journey" /></SelectTrigger>
            <SelectContent>{journeys.map((j: any) => <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>)}</SelectContent>
          </Select>
        );
      case 'webhook':
        return <Input className="h-8" placeholder="https://..." value={action.config.url || ''} onChange={e => updateAction(idx, 'url', e.target.value)} />;
      default:
        return null;
    }
  };

  const renderTriggerValue = () => {
    switch (form.trigger_type) {
      case 'tag_added':
        return <Input className="h-8 mt-1" placeholder="Tag name" value={form.trigger_value} onChange={e => setForm(f => ({ ...f, trigger_value: e.target.value }))} />;
      case 'segment_entry':
        return (
          <Select value={form.trigger_value} onValueChange={v => setForm(f => ({ ...f, trigger_value: v }))}>
            <SelectTrigger className="h-8 mt-1"><SelectValue placeholder="Pick segment" /></SelectTrigger>
            <SelectContent>{segmentsList.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        );
      case 'event_occurred':
        return <Input className="h-8 mt-1" placeholder="Event name" value={form.trigger_value} onChange={e => setForm(f => ({ ...f, trigger_value: e.target.value }))} />;
      default:
        return null;
    }
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
          <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> New Automation</Button>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Automation' : 'Create Automation'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>

            {/* Trigger */}
            <div className="space-y-1">
              <Label>Trigger</Label>
              <Select value={form.trigger_type} onValueChange={v => setForm(f => ({ ...f, trigger_type: v, trigger_value: '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="segment_entry">Segment Entry</SelectItem>
                  <SelectItem value="tag_added">Tag Added</SelectItem>
                  <SelectItem value="event_occurred">Event Occurred</SelectItem>
                </SelectContent>
              </Select>
              {renderTriggerValue()}
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1"><Filter className="h-3 w-3" /> Conditions (optional)</Label>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowConditions(!showConditions)}>
                  {showConditions ? 'Hide' : 'Add Conditions'}
                </Button>
              </div>
              {showConditions && (
                <GlassCard className="p-3">
                  <p className="text-[10px] text-muted-foreground mb-2">Only run actions if contact matches these conditions:</p>
                  <RuleBuilder
                    rules={form.conditions}
                    onChange={conditions => setForm(f => ({ ...f, conditions }))}
                  />
                </GlassCard>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Actions</Label>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addAction}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              {form.actions.map((action, idx) => (
                <GlassCard key={idx} className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Select value={action.type} onValueChange={v => updateAction(idx, 'type', v)}>
                      <SelectTrigger className="h-8 flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {form.actions.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeAction(idx)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {renderActionConfig(action, idx)}
                </GlassCard>
              ))}
            </div>

            <Button onClick={() => saveAutomation.mutate()} disabled={!form.name || saveAutomation.isPending} className="w-full">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
          {canEdit && <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Create First Automation</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {automations.map((a: any, i: number) => {
            const triggerType = a.trigger_config?.type || 'none';
            const actions = (a.actions || []) as any[];
            const execCount = execCounts[a.id] || 0;
            const lastTriggered = a.updated_at;
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
                        {execCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Zap className="h-2.5 w-2.5" /> {execCount}×
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Trigger: {triggerLabels[triggerType] || triggerType}{a.trigger_config?.value ? ` (${a.trigger_config.value})` : ''}</span>
                        <span>•</span>
                        <span>{actions.map((act: any) => actionLabels[act.type] || act.type).join(', ')}</span>
                        {a.conditions && (a.conditions as any[]).length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Filter className="h-2.5 w-2.5" /> {(a.conditions as any[]).length} conditions</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                        <Clock className="h-2.5 w-2.5" />
                        <span>Created {format(new Date(a.created_at), 'MMM d')}</span>
                        {lastTriggered && lastTriggered !== a.created_at && (
                          <span>• Last active {format(new Date(lastTriggered), 'MMM d, HH:mm')}</span>
                        )}
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
                            <DropdownMenuItem onClick={() => openDialog(a)}>
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateAutomation.mutate(a)}>
                              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
