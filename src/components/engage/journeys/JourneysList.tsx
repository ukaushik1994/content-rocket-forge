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
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, GitBranch, ExternalLink, MoreVertical, Trash2, Play, Pause, Copy, Pencil, Users, Search, Workflow, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { EngageHero } from '../shared/EngageHero';
import { EngageStatGrid } from '../shared/EngageStatCard';
import { engageStagger } from '../shared/engageAnimations';

const statusConfig: Record<string, { class: string; dot: string }> = {
  draft: { class: 'bg-muted/50 text-muted-foreground border-border/50', dot: 'bg-muted-foreground' },
  active: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  paused: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

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

  const { data: enrollmentCounts = {} } = useQuery({
    queryKey: ['journey-enrollment-counts', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_enrollments')
        .select('journey_id')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('status', 'active');
      const counts: Record<string, number> = {};
      (data || []).forEach((e: any) => { counts[e.journey_id] = (counts[e.journey_id] || 0) + 1; });
      return counts;
    },
    enabled: !!currentWorkspaceId,
  });

  // Node counts per journey
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

      // If template selected, insert template nodes and edges
      if (selectedTemplate !== null) {
        const template = journeyTemplates[selectedTemplate];
        const nodeInserts = template.nodes.map(n => ({
          workspace_id: currentWorkspaceId!,
          journey_id: data.id,
          node_id: n.id,
          type: n.type,
          config: n.data.config || {},
          position: n.position,
        }));
        await supabase.from('journey_nodes').insert(nodeInserts);

        const edgeInserts = template.edges.map(e => ({
          workspace_id: currentWorkspaceId!,
          journey_id: data.id,
          source_node_id: e.source,
          target_node_id: e.target,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      toast.success('Journey duplicated');
    },
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

  const renameJourney = useMutation({
    mutationFn: async () => {
      if (!renamingId || !renameValue.trim()) return;
      const { error } = await supabase.from('journeys').update({ name: renameValue.trim() }).eq('id', renamingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      setRenamingId(null);
      toast.success('Journey renamed');
    },
  });

  const stats = {
    active: journeys.filter((j: any) => j.status === 'active').length,
    draft: journeys.filter((j: any) => j.status === 'draft').length,
    paused: journeys.filter((j: any) => j.status === 'paused').length,
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngageHero
        icon={GitBranch}
        title="Journeys"
        subtitle="Visual customer journey flows"
        gradientFrom="from-purple-400"
        gradientTo="to-blue-400"
        glowFrom="from-purple-500/30"
        glowTo="to-blue-500/10"
        actions={
          canEdit ? (
            <Dialog open={showCreate} onOpenChange={o => { setShowCreate(o); if (!o) { setName(''); setDescription(''); setSelectedTemplate(null); } }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Journey</Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-lg">
                <DialogHeader><DialogTitle>Create Journey</DialogTitle></DialogHeader>
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
                  <Button onClick={() => createJourney.mutate()} disabled={!name} className="w-full">
                    {selectedTemplate !== null ? 'Create from Template' : 'Create & Open Builder'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Search */}
      <motion.div variants={engageStagger.item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search journeys..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-white/[0.03] border-white/[0.06] backdrop-blur-sm" />
      </motion.div>

      {/* Rename Dialog */}
      <Dialog open={!!renamingId} onOpenChange={() => setRenamingId(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-sm">
          <DialogHeader><DialogTitle>Rename Journey</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} />
            <Button onClick={() => renameJourney.mutate()} disabled={!renameValue.trim()} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      {journeys.length > 0 && (
        <EngageStatGrid
          stats={[
            { label: 'Active', count: stats.active, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', icon: Play },
            { label: 'Draft', count: stats.draft, color: 'from-muted/40 to-muted/10', text: 'text-muted-foreground', icon: GitBranch },
            { label: 'Paused', count: stats.paused, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', icon: Pause },
          ]}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredJourneys.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
            <GitBranch className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-muted-foreground">{searchQuery ? 'No matching journeys' : 'No journeys yet'}</p>
          {canEdit && !searchQuery && <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Create First Journey</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {filteredJourneys.map((j: any, i: number) => {
            const sc = statusConfig[j.status] || statusConfig.draft;
            const enrolled = enrollmentCounts[j.id] || 0;
            const nodeCount = nodeCounts[j.id] || 0;
            return (
              <motion.div key={j.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard
                  className="p-4 cursor-pointer hover:border-primary/30 hover:scale-[1.01] transition-all duration-200"
                  onClick={() => navigate(`/engage/journeys/${j.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">{j.name}</h3>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${sc.class}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {j.status}
                        </Badge>
                        {enrolled > 0 && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Users className="h-2.5 w-2.5" /> {enrolled} enrolled
                          </Badge>
                        )}
                        {nodeCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-500/10 text-purple-400 border-purple-500/30">
                            <Workflow className="h-2.5 w-2.5" /> {nodeCount} nodes
                          </Badge>
                        )}
                      </div>
                      {j.description && <p className="text-xs text-muted-foreground truncate">{j.description}</p>}
                      <p className="text-xs text-muted-foreground">{format(new Date(j.created_at), 'MMM d, yyyy')}</p>
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
                            <DropdownMenuItem onClick={() => { setRenamingId(j.id); setRenameValue(j.name); }}>
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Rename
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
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
