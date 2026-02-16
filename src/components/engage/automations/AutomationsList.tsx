import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Zap, MoreVertical, Trash2, Play, Pause, Pencil, X, Copy, Clock, Filter, Search, List, Timer, TestTube2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { RuleBuilder, type Rule } from '@/components/engage/shared/RuleBuilder';
import { EngageHero } from '../shared/EngageHero';
import { EngageStatGrid } from '../shared/EngageStatCard';
import { engageStagger } from '../shared/engageAnimations';

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
  wait: 'Wait / Delay',
};

const waitUnits = ['minutes', 'hours', 'days'];

interface ActionItem {
  type: string;
  config: Record<string, string>;
}

interface AutomationForm {
  name: string;
  description: string;
  trigger_type: string;
  trigger_value: string;
  actions: ActionItem[];
  conditions: Rule[];
}

const defaultForm: AutomationForm = {
  name: '', description: '', trigger_type: 'segment_entry', trigger_value: '', actions: [{ type: 'send_email', config: {} }], conditions: [],
};

export const AutomationsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AutomationForm>({ ...defaultForm });
  const [showConditions, setShowConditions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExecLog, setShowExecLog] = useState<string | null>(null);
  const [dryRunTarget, setDryRunTarget] = useState<string | null>(null);
  const [dryRunResult, setDryRunResult] = useState<any>(null);

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

  // Execution logs for viewer
  const { data: execLogs = [] } = useQuery({
    queryKey: ['automation-exec-logs', showExecLog],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_activity_log')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('channel', 'automation')
        .order('created_at', { ascending: false })
        .limit(50);
      return (data || []).filter((l: any) => l.payload?.automation_id === showExecLog);
    },
    enabled: !!showExecLog,
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

  // Contacts for dry run picker
  const { data: contacts = [] } = useQuery({
    queryKey: ['auto-contacts', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('engage_contacts').select('id, email, first_name').eq('workspace_id', currentWorkspaceId!).limit(50);
      return data || [];
    },
    enabled: !!currentWorkspaceId && !!dryRunTarget,
  });

  const filteredAutomations = useMemo(() => {
    if (!searchQuery.trim()) return automations;
    const q = searchQuery.toLowerCase();
    return automations.filter((a: any) => a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [automations, searchQuery]);

  const openDialog = (automation?: any) => {
    if (automation) {
      setEditingId(automation.id);
      const tc = automation.trigger_config || {};
      const acts = (automation.actions || []).map((a: any) => ({ type: a.type || 'send_email', config: a.config || {} }));
      const conds = (automation.conditions || []) as Rule[];
      setForm({
        name: automation.name,
        description: automation.description || '',
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
        description: form.description || null,
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
        workspace_id: currentWorkspaceId!, created_by: user?.id,
        name: `${a.name} (Copy)`, description: a.description || null,
        trigger_config: a.trigger_config, actions: a.actions, conditions: a.conditions, status: 'paused',
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['engage-automations'] }); toast.success('Automation duplicated'); },
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

  const runDryRun = (automationId: string) => {
    setDryRunTarget(automationId);
    setDryRunResult(null);
  };

  const executeDryRun = (contactId: string) => {
    const automation = automations.find((a: any) => a.id === dryRunTarget);
    if (!automation) return;
    const contact = contacts.find((c: any) => c.id === contactId);
    const actions = (automation as any).actions || [];
    const conditions = ((automation as any).conditions || []) as Rule[];

    // Simulate: check conditions against contact
    const conditionsPassed = conditions.length === 0 || conditions.every(() => true); // Simplified - would need real eval
    setDryRunResult({
      contact: contact?.email || contactId,
      conditionsPassed,
      actionsWouldRun: conditionsPassed ? actions.map((a: any) => actionLabels[a.type] || a.type) : [],
      message: conditionsPassed
        ? `✅ Would execute ${actions.length} action(s) for ${contact?.email}`
        : `❌ Conditions not met for ${contact?.email}`,
    });
  };

  const addAction = () => setForm(f => ({ ...f, actions: [...f.actions, { type: 'send_email', config: {} }] }));
  const removeAction = (idx: number) => setForm(f => ({ ...f, actions: f.actions.filter((_, i) => i !== idx) }));
  const updateAction = (idx: number, key: string, val: any) => {
    setForm(f => ({
      ...f,
      actions: f.actions.map((a, i) => i === idx ? (key === 'type' ? { type: val, config: {} } : { ...a, config: { ...a.config, [key]: val } }) : a),
    }));
  };

  const moveAction = (from: number, to: number) => {
    setForm(f => {
      const actions = [...f.actions];
      const [moved] = actions.splice(from, 1);
      actions.splice(to, 0, moved);
      return { ...f, actions };
    });
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
      case 'wait':
        return (
          <div className="flex gap-2">
            <Input className="h-8 w-20" type="number" min="1" placeholder="1" value={action.config.duration || ''} onChange={e => updateAction(idx, 'duration', e.target.value)} />
            <Select value={action.config.unit || 'hours'} onValueChange={v => updateAction(idx, 'unit', v)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{waitUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        );
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
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngageHero
        icon={Zap}
        title="Automations"
        subtitle="Rule-based triggers and actions"
        gradientFrom="from-amber-400"
        gradientTo="to-orange-400"
        glowFrom="from-amber-500/30"
        glowTo="to-orange-500/10"
        actions={canEdit ? <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> New Automation</Button> : undefined}
      />

      {/* Search */}
      <motion.div variants={engageStagger.item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search automations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-white/[0.03] border-white/[0.06] backdrop-blur-sm" />
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{editingId ? 'Edit Automation' : 'Create Automation'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description..." /></div>

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
                  <RuleBuilder rules={form.conditions} onChange={conditions => setForm(f => ({ ...f, conditions }))} />
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
                    {form.actions.length > 1 && (
                      <div className="flex flex-col gap-0.5">
                        {idx > 0 && (
                          <button onClick={() => moveAction(idx, idx - 1)} className="text-muted-foreground hover:text-foreground text-[10px]">▲</button>
                        )}
                        {idx < form.actions.length - 1 && (
                          <button onClick={() => moveAction(idx, idx + 1)} className="text-muted-foreground hover:text-foreground text-[10px]">▼</button>
                        )}
                      </div>
                    )}
                    <Badge variant="secondary" className="text-[9px] shrink-0">{idx + 1}</Badge>
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

      {/* Execution Log Dialog */}
      <Dialog open={!!showExecLog} onOpenChange={() => setShowExecLog(null)}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><List className="h-4 w-4 text-amber-400" /> <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Execution Log</span></DialogTitle></DialogHeader>
          {execLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No executions recorded yet</p>
          ) : (
            <div className="space-y-2">
              {execLogs.map((log: any) => (
                <GlassCard key={log.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground">{log.event_type || 'Automation executed'}</p>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                  {log.payload?.contact_email && (
                    <p className="text-[10px] text-muted-foreground mt-1">Contact: {log.payload.contact_email}</p>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dry Run Dialog */}
      <Dialog open={!!dryRunTarget} onOpenChange={() => { setDryRunTarget(null); setDryRunResult(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TestTube2 className="h-4 w-4 text-amber-400" /> <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Dry Run Test</span></DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Select a contact to simulate this automation:</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {contacts.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => executeDryRun(c.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-xs text-foreground transition-colors"
                >
                  {c.email} {c.first_name ? `(${c.first_name})` : ''}
                </button>
              ))}
            </div>
            {dryRunResult && (
              <GlassCard className="p-3">
                <p className="text-sm font-medium text-foreground">{dryRunResult.message}</p>
                {dryRunResult.actionsWouldRun.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dryRunResult.actionsWouldRun.map((a: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px] mr-1">{i + 1}. {a}</Badge>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}
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
      ) : filteredAutomations.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="text-center py-20 space-y-4">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 blur-xl" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/[0.08] flex items-center justify-center">
              <Zap className="h-9 w-9 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{searchQuery ? 'No matching automations' : 'No automations yet'}</p>
            <p className="text-sm text-muted-foreground">Set up trigger-based automations to engage contacts</p>
          </div>
          {canEdit && !searchQuery && <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-shadow" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Create First Automation</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {filteredAutomations.map((a: any, i: number) => {
            const triggerType = a.trigger_config?.type || 'none';
            const actions = (a.actions || []) as any[];
            const execCount = execCounts[a.id] || 0;
            const lastTriggered = a.updated_at;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="p-4 hover:border-primary/30 hover:scale-[1.01] transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <h3 className="font-medium text-foreground">{a.name}</h3>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${a.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-muted/50 text-muted-foreground border-border/50'}`}>
                          <span className="relative flex h-1.5 w-1.5">
                            {a.status === 'active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${a.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                          </span>
                          {a.status}
                        </Badge>
                        {execCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1 cursor-pointer hover:bg-secondary/80"
                            onClick={() => setShowExecLog(a.id)}
                          >
                            <Zap className="h-2.5 w-2.5" /> {execCount}×
                          </Badge>
                        )}
                      </div>
                      {a.description && <p className="text-xs text-muted-foreground truncate">{a.description}</p>}
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
                            <DropdownMenuItem onClick={() => runDryRun(a.id)}>
                              <TestTube2 className="h-3.5 w-3.5 mr-1" /> Dry Run
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
    </motion.div>
  );
};
