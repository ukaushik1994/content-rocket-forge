import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, GitBranch, ExternalLink, MoreVertical, Trash2, Play, Pause, Copy, Pencil, Users, Search, Workflow, Sparkles, TrendingUp, CheckSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { EngageButton } from '../shared/EngageButton';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
import { EngageFilterBar } from '../shared/EngageFilterBar';
import { EngageContentCard } from '../shared/EngageContentCard';
import { EngageSkeletonCards } from '../shared/EngageSkeletonCards';
import { EngageStatGrid } from '../shared/EngageStatCard';
import { engageStagger } from '../shared/engageAnimations';

const statusConfig: Record<string, { class: string; dot: string; pulse: boolean }> = {
  draft: { class: 'bg-muted/50 text-muted-foreground border-border/50', dot: 'bg-muted-foreground', pulse: false },
  active: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', pulse: true },
  paused: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', pulse: false },
};

const journeyTemplates = [
  {
    name: 'Welcome Series',
    description: 'Onboard new contacts with a multi-step welcome email flow',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'trigger', config: { segment: '' } } },
      { id: 'send_email_1', type: 'send_email', position: { x: 250, y: 200 }, data: { label: 'send email', config: { subject: 'Welcome!' } } },
      { id: 'wait_1', type: 'wait', position: { x: 250, y: 350 }, data: { label: 'wait', config: { duration: '2', unit: 'days' } } },
      { id: 'send_email_2', type: 'send_email', position: { x: 250, y: 500 }, data: { label: 'send email', config: { subject: 'Getting Started' } } },
      { id: 'end_1', type: 'end', position: { x: 250, y: 650 }, data: { label: 'end', config: {} } },
    ],
    edges: [
      { source: 'trigger_1', target: 'send_email_1' },
      { source: 'send_email_1', target: 'wait_1' },
      { source: 'wait_1', target: 'send_email_2' },
      { source: 'send_email_2', target: 'end_1' },
    ],
  },
  {
    name: 'Onboarding Flow',
    description: 'Guide users through product setup with conditional branches',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'trigger', config: {} } },
      { id: 'send_email_1', type: 'send_email', position: { x: 250, y: 200 }, data: { label: 'send email', config: { subject: 'Setup your account' } } },
      { id: 'wait_1', type: 'wait', position: { x: 250, y: 350 }, data: { label: 'wait', config: { duration: '3', unit: 'days' } } },
      { id: 'condition_1', type: 'condition', position: { x: 250, y: 500 }, data: { label: 'condition', config: { field: 'profile_completed' } } },
      { id: 'send_email_2', type: 'send_email', position: { x: 100, y: 650 }, data: { label: 'send email', config: { subject: 'Complete your profile' } } },
      { id: 'end_1', type: 'end', position: { x: 400, y: 650 }, data: { label: 'end', config: {} } },
    ],
    edges: [
      { source: 'trigger_1', target: 'send_email_1' },
      { source: 'send_email_1', target: 'wait_1' },
      { source: 'wait_1', target: 'condition_1' },
      { source: 'condition_1', target: 'send_email_2', label: 'No' },
      { source: 'condition_1', target: 'end_1', label: 'Yes' },
    ],
  },
  {
    name: 'Re-engagement',
    description: 'Win back inactive contacts with targeted emails',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'trigger', config: {} } },
      { id: 'wait_1', type: 'wait', position: { x: 250, y: 200 }, data: { label: 'wait', config: { duration: '7', unit: 'days' } } },
      { id: 'send_email_1', type: 'send_email', position: { x: 250, y: 350 }, data: { label: 'send email', config: { subject: 'We miss you!' } } },
      { id: 'wait_2', type: 'wait', position: { x: 250, y: 500 }, data: { label: 'wait', config: { duration: '3', unit: 'days' } } },
      { id: 'send_email_2', type: 'send_email', position: { x: 250, y: 650 }, data: { label: 'send email', config: { subject: 'Last chance offer' } } },
      { id: 'end_1', type: 'end', position: { x: 250, y: 800 }, data: { label: 'end', config: {} } },
    ],
    edges: [
      { source: 'trigger_1', target: 'wait_1' },
      { source: 'wait_1', target: 'send_email_1' },
      { source: 'send_email_1', target: 'wait_2' },
      { source: 'wait_2', target: 'send_email_2' },
      { source: 'send_email_2', target: 'end_1' },
    ],
  },
];

export const JourneysList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameDesc, setRenameDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  // E2: Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['journeys', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journeys').select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  // E1: All enrollment data for analytics
  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['journey-all-enrollments', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_enrollments')
        .select('journey_id, status')
        .eq('workspace_id', currentWorkspaceId!);
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const enrollmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEnrollments.filter((e: any) => e.status === 'active').forEach((e: any) => {
      counts[e.journey_id] = (counts[e.journey_id] || 0) + 1;
    });
    return counts;
  }, [allEnrollments]);

  // E1: Completion rates per journey
  const completionRates = useMemo(() => {
    const rates: Record<string, { total: number; completed: number }> = {};
    allEnrollments.forEach((e: any) => {
      if (!rates[e.journey_id]) rates[e.journey_id] = { total: 0, completed: 0 };
      rates[e.journey_id].total++;
      if (e.status === 'completed') rates[e.journey_id].completed++;
    });
    return rates;
  }, [allEnrollments]);

  const { data: nodeCounts = {} } = useQuery({
    queryKey: ['journey-node-counts', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_nodes')
        .select('journey_id')
        .in('journey_id', journeys.map((j: any) => j.id));
      const counts: Record<string, number> = {};
      (data || []).forEach((n: any) => { counts[n.journey_id] = (counts[n.journey_id] || 0) + 1; });
      return counts;
    },
    enabled: journeys.length > 0,
  });

  const filteredJourneys = useMemo(() => {
    if (!searchQuery.trim()) return journeys;
    const q = searchQuery.toLowerCase();
    return journeys.filter((j: any) =>
      j.name?.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q)
    );
  }, [journeys, searchQuery]);

  const createJourney = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from('journeys').insert({
        workspace_id: currentWorkspaceId!, name, description: description || null, created_by: user?.id,
      }).select().single();
      if (error) throw error;

      if (selectedTemplate !== null) {
        const template = journeyTemplates[selectedTemplate];
        const nodeInserts = template.nodes.map(n => ({
          workspace_id: currentWorkspaceId!, journey_id: data.id, node_id: n.id,
          type: n.type, config: n.data.config || {}, position: n.position,
        }));
        await supabase.from('journey_nodes').insert(nodeInserts);

        const edgeInserts = template.edges.map(e => ({
          workspace_id: currentWorkspaceId!, journey_id: data.id,
          source_node_id: e.source, target_node_id: e.target,
          condition_label: (e as any).label || null,
        }));
        await supabase.from('journey_edges').insert(edgeInserts);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      setShowCreate(false); setName(''); setDescription(''); setSelectedTemplate(null);
      navigate(`/engage/journeys/${data.id}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteJourney = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('journey_nodes').delete().eq('journey_id', id);
      await supabase.from('journey_edges').delete().eq('journey_id', id);
      const { error } = await supabase.from('journeys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['journeys'] }); toast.success('Journey deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  const duplicateJourney = useMutation({
    mutationFn: async (journey: any) => {
      const { data: newJ, error } = await supabase.from('journeys').insert({
        workspace_id: currentWorkspaceId!, name: `${journey.name} (Copy)`, description: journey.description || null, created_by: user?.id,
      }).select().single();
      if (error) throw error;

      const { data: nodes } = await supabase.from('journey_nodes').select('*').eq('journey_id', journey.id);
      const nodeIdMap: Record<string, string> = {};
      if (nodes?.length) {
        for (const n of nodes) {
          const newNodeId = crypto.randomUUID();
          nodeIdMap[n.node_id] = newNodeId;
          await supabase.from('journey_nodes').insert({
            workspace_id: currentWorkspaceId!, journey_id: newJ.id, node_id: newNodeId,
            type: n.type, config: n.config, position: n.position,
          });
        }
      }

      const { data: edges } = await supabase.from('journey_edges').select('*').eq('journey_id', journey.id);
      if (edges?.length) {
        for (const e of edges) {
          await supabase.from('journey_edges').insert({
            workspace_id: currentWorkspaceId!, journey_id: newJ.id,
            source_node_id: nodeIdMap[e.source_node_id] || e.source_node_id,
            target_node_id: nodeIdMap[e.target_node_id] || e.target_node_id,
            condition_label: e.condition_label,
          });
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['journeys'] }); toast.success('Journey duplicated'); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: string }) => {
      const next = current === 'active' ? 'paused' : 'active';
      const { error } = await supabase.from('journeys').update({ status: next }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journeys'] }),
  });

  // F3: Rename now includes description
  const renameJourney = useMutation({
    mutationFn: async () => {
      if (!renamingId || !renameValue.trim()) return;
      const { error } = await supabase.from('journeys').update({ name: renameValue.trim(), description: renameDesc || null }).eq('id', renamingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      setRenamingId(null);
      toast.success('Journey updated');
    },
  });

  // E2: Bulk actions
  const bulkAction = useMutation({
    mutationFn: async (action: 'activate' | 'pause' | 'delete') => {
      const ids = Array.from(selectedIds);
      if (action === 'delete') {
        for (const id of ids) {
          await supabase.from('journey_nodes').delete().eq('journey_id', id);
          await supabase.from('journey_edges').delete().eq('journey_id', id);
          await supabase.from('journeys').delete().eq('id', id);
        }
      } else {
        const status = action === 'activate' ? 'active' : 'paused';
        await supabase.from('journeys').update({ status }).in('id', ids);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      setSelectedIds(new Set());
      toast.success('Bulk action completed');
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const stats = {
    active: journeys.filter((j: any) => j.status === 'active').length,
    draft: journeys.filter((j: any) => j.status === 'draft').length,
    paused: journeys.filter((j: any) => j.status === 'paused').length,
  };

  // E1: Global analytics
  const totalEnrolled = allEnrollments.length;
  const totalCompleted = allEnrollments.filter((e: any) => e.status === 'completed').length;
  const avgCompletion = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngagePageHero
        icon={GitBranch}
        badge="Journey Builder"
        title="Journeys"
        titleAccent="Builder"
        subtitle="Visual customer journey flows — automate engagement at scale"
        gradientFrom="from-purple-400"
        gradientTo="to-blue-400"
        stats={[
          { icon: Play, label: 'Active', value: stats.active },
          { icon: GitBranch, label: 'Draft', value: stats.draft },
          { icon: Users, label: 'Enrolled', value: totalEnrolled },
          { icon: TrendingUp, label: 'Completion', value: `${avgCompletion}%` },
        ]}
        actions={
          canEdit ? (
            <Dialog open={showCreate} onOpenChange={o => { setShowCreate(o); if (!o) { setName(''); setDescription(''); setSelectedTemplate(null); } }}>
              <DialogTrigger asChild>
                <EngageButton size="sm"><Plus className="h-4 w-4 mr-1" /> New Journey</EngageButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <EngageDialogHeader icon={GitBranch} title="Create Journey" gradientFrom="from-purple-400" gradientTo="to-blue-400" iconColor="text-purple-400" />
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs flex items-center gap-1 mb-2"><Sparkles className="h-3 w-3" /> Start from Template</Label>
                    <div className="grid gap-2">
                      {journeyTemplates.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedTemplate(selectedTemplate === i ? null : i); if (!name) setName(t.name); }}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            selectedTemplate === i
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                          }`}
                        >
                          <p className="text-sm font-medium text-foreground">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{t.description}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{t.nodes.length} nodes</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                  <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional description..." /></div>
                  <EngageButton onClick={() => createJourney.mutate()} disabled={!name} className="w-full">
                    {selectedTemplate !== null ? 'Create from Template' : 'Create & Open Builder'}
                  </EngageButton>
                </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Search */}
      <EngageFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search journeys..."
      />

      {/* F3: Rename + Description Dialog */}
      <Dialog open={!!renamingId} onOpenChange={() => setRenamingId(null)}>
        <DialogContent className="max-w-sm">
          <EngageDialogHeader icon={Pencil} title="Edit Journey" gradientFrom="from-purple-400" gradientTo="to-blue-400" iconColor="text-purple-400" />
          <div className="space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={renameValue} onChange={e => setRenameValue(e.target.value)} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={renameDesc} onChange={e => setRenameDesc(e.target.value)} rows={2} placeholder="Optional description..." /></div>
            <Button onClick={() => renameJourney.mutate()} disabled={!renameValue.trim()} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats removed — already in hero */}

      {/* List */}
      {isLoading ? (
        <EngageSkeletonCards count={4} layout="list" />
      ) : filteredJourneys.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="text-center py-20 space-y-4">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 blur-xl" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center">
              <GitBranch className="h-9 w-9 text-purple-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{searchQuery ? 'No matching journeys' : 'No journeys yet'}</p>
            <p className="text-sm text-muted-foreground">Build visual customer journeys to automate engagement</p>
          </div>
          {/* F1: EngageButton instead of plain Button */}
          {canEdit && !searchQuery && <EngageButton size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Create First Journey</EngageButton>}
        </motion.div>
      ) : (
        <div className="grid gap-3 max-w-7xl mx-auto">
          {filteredJourneys.map((j: any, i: number) => {
            const sc = statusConfig[j.status] || statusConfig.draft;
            const enrolled = enrollmentCounts[j.id] || 0;
            const nodeCount = nodeCounts[j.id] || 0;
            const rate = completionRates[j.id];
            const completionPct = rate && rate.total > 0 ? Math.round((rate.completed / rate.total) * 100) : null;
            const isSelected = selectedIds.has(j.id);
            return (
              <EngageContentCard
                key={j.id}
                index={i}
                onClick={() => navigate(`/engage/journeys/${j.id}`)}
                selected={isSelected}
                className={`border-l-[3px] ${j.status === 'active' ? 'border-l-emerald-500' : j.status === 'paused' ? 'border-l-amber-500' : 'border-l-muted-foreground/30'}`}
                statusBadge={{
                  label: j.status,
                  className: sc.class,
                  pulse: sc.pulse,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {canEdit && (
                      <div onClick={e => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(j.id)} />
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">{j.name}</h3>
                        {enrolled > 0 && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Users className="h-2.5 w-2.5" /> {enrolled} active
                          </Badge>
                        )}
                        {nodeCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-500/10 text-purple-400 border-purple-500/30">
                            <Workflow className="h-2.5 w-2.5" /> {nodeCount} nodes
                          </Badge>
                        )}
                        {completionPct !== null && (
                          <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            <TrendingUp className="h-2.5 w-2.5" /> {completionPct}% complete
                          </Badge>
                        )}
                      </div>
                      {/* Mini flow preview with colored node dots */}
                      {nodeCount > 0 && (
                        <div className="flex items-center gap-1.5 py-1">
                          {(() => {
                            const dotColors = ['bg-purple-400', 'bg-blue-400', 'bg-amber-400', 'bg-emerald-400', 'bg-indigo-400'];
                            return Array.from({ length: Math.min(nodeCount, 6) }).map((_, idx) => (
                              <React.Fragment key={idx}>
                                <div className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]} shadow-sm shadow-current/20`} />
                                {idx < Math.min(nodeCount, 6) - 1 && <div className="w-5 h-px bg-border" />}
                              </React.Fragment>
                            ));
                          })()}
                          {nodeCount > 6 && <span className="text-[9px] text-muted-foreground ml-1">+{nodeCount - 6} more</span>}
                        </div>
                      )}
                      {j.description && <p className="text-xs text-muted-foreground truncate">{j.description}</p>}
                      <p className="text-xs text-muted-foreground">{format(new Date(j.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {canEdit && j.status !== 'draft' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStatus.mutate({ id: j.id, current: j.status })}>
                        {j.status === 'active' ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                      </Button>
                    )}
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setRenamingId(j.id); setRenameValue(j.name); setRenameDesc(j.description || ''); }}>
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateJourney.mutate(j)}>
                            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteJourney.mutate(j.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </EngageContentCard>
            );
          })}
        </div>
      )}

      {/* E2: Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
          >
            <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
            <EngageButton size="sm" onClick={() => bulkAction.mutate('activate')}>
              <Play className="h-3.5 w-3.5 mr-1" /> Activate
            </EngageButton>
            <Button variant="outline" size="sm" onClick={() => bulkAction.mutate('pause')}>
              <Pause className="h-3.5 w-3.5 mr-1" /> Pause
            </Button>
            <Button variant="destructive" size="sm" onClick={() => bulkAction.mutate('delete')}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
