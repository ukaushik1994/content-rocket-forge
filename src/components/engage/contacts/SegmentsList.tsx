import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NLSegmentBuilder } from './NLSegmentBuilder';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Layers, RefreshCw, Users, Trash2, Pencil, Filter, Eye, Clock, Copy, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { EngageButton } from '../shared/EngageButton';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { RuleBuilder, type Rule } from '@/components/engage/shared/RuleBuilder';
import { EngageHero } from '../shared/EngageHero';
import { EngageStatGrid } from '../shared/EngageStatCard';
import { engageStagger } from '../shared/engageAnimations';

export const SegmentsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [matchType, setMatchType] = useState<'all' | 'any'>('all');
  const [viewingSegment, setViewingSegment] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ['engage-segments', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engage_segments')
        .select('*, engage_segment_memberships(count)')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter((s: any) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [segments, searchQuery]);

  const { data: segmentMembers = [] } = useQuery({
    queryKey: ['segment-members', viewingSegment?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_segment_memberships')
        .select('contact_id, computed_at, engage_contacts(email, first_name, last_name)')
        .eq('segment_id', viewingSegment!.id)
        .limit(100);
      return data || [];
    },
    enabled: !!viewingSegment?.id,
  });

  const { data: lastEvaluated } = useQuery({
    queryKey: ['segment-last-eval', viewingSegment?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_segment_memberships')
        .select('computed_at')
        .eq('segment_id', viewingSegment!.id)
        .order('computed_at', { ascending: false })
        .limit(1);
      return data?.[0]?.computed_at || null;
    },
    enabled: !!viewingSegment?.id,
  });

  const totalMembers = segments.reduce((sum: number, s: any) => sum + (s.engage_segment_memberships?.[0]?.count || 0), 0);

  const resetForm = () => {
    setName(''); setDescription(''); setRules([]); setMatchType('all'); setEditingSegment(null);
  };

  const openEdit = (segment: any) => {
    setEditingSegment(segment);
    setName(segment.name);
    setDescription(segment.description || '');
    const def = segment.definition || {};
    setMatchType(def.match || 'all');
    setRules(def.rules || []);
  };

  const createSegment = useMutation({
    mutationFn: async () => {
      const definition = { match: matchType, rules: rules.map(r => ({ ...r })) } as any;
      let segmentId: string;
      if (editingSegment) {
        const { error } = await supabase.from('engage_segments').update({ name, description: description || null, definition }).eq('id', editingSegment.id);
        if (error) throw error;
        segmentId = editingSegment.id;
      } else {
        const { data, error } = await supabase.from('engage_segments').insert({
          workspace_id: currentWorkspaceId!, name, description: description || null, definition,
        } as any).select('id').single();
        if (error) throw error;
        segmentId = data.id;
      }
      await supabase.rpc('evaluate_segment', { p_segment_id: segmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-segments'] });
      setShowAdd(false); resetForm();
      toast.success(editingSegment ? 'Segment updated & evaluated' : 'Segment created & evaluated');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('engage_segments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['engage-segments'] }); toast.success('Segment deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  const evaluateSegment = useMutation({
    mutationFn: async (segmentId: string) => {
      const { data, error } = await supabase.rpc('evaluate_segment', { p_segment_id: segmentId });
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['engage-segments'] });
      toast.success(`Segment evaluated: ${count} members`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const duplicateSegment = useMutation({
    mutationFn: async (segment: any) => {
      const { error } = await supabase.from('engage_segments').insert({
        workspace_id: currentWorkspaceId!, name: `${segment.name} (Copy)`,
        description: segment.description || null, definition: segment.definition,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['engage-segments'] }); toast.success('Segment duplicated'); },
    onError: (e: any) => toast.error(e.message),
  });

  const exportMembersCSV = () => {
    if (!segmentMembers.length) { toast.error('No members to export'); return; }
    const rows = [['Email', 'First Name', 'Last Name']];
    segmentMembers.forEach((m: any) => {
      const c = m.engage_contacts || {};
      rows.push([c.email || '', c.first_name || '', c.last_name || '']);
    });
    const csv = rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${viewingSegment?.name || 'segment'}-members.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Members exported');
  };

  const getRuleSummary = (segment: any) => {
    const def = segment.definition || {};
    const r = def.rules || [];
    if (r.length === 0) return 'No rules defined';
    const summaries = r.slice(0, 3).map((rule: any) => `${rule.field} ${rule.operator} "${rule.value}"`);
    const joiner = def.match === 'any' ? ' OR ' : ' AND ';
    return summaries.join(joiner) + (r.length > 3 ? ` +${r.length - 3} more` : '');
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={engageStagger.container}>
      <EngageHero
        icon={Layers}
        title="Segments"
        subtitle="Group contacts by rules"
        gradientFrom="from-violet-400"
        gradientTo="to-purple-400"
        glowFrom="from-violet-500/30"
        glowTo="to-purple-500/10"
        actions={
          canEdit ? (
            <Dialog open={showAdd || !!editingSegment} onOpenChange={open => { if (!open) { setShowAdd(false); resetForm(); } else setShowAdd(true); }}>
              <DialogTrigger asChild>
                <EngageButton size="sm"><Plus className="h-4 w-4 mr-1" /> New Segment</EngageButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <EngageDialogHeader icon={Layers} title={editingSegment ? 'Edit Segment' : 'Create Segment'} gradientFrom="from-violet-400" gradientTo="to-purple-400" iconColor="text-violet-400" />
                <div className="space-y-4">
                  <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                  <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
                  <div className="flex gap-2 items-center">
                    <Label className="text-xs">Match:</Label>
                    <div className="flex gap-1">
                      {(['all', 'any'] as const).map(m => (
                        <Button key={m} variant={matchType === m ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setMatchType(m)}>
                          {m === 'all' ? 'All rules (AND)' : 'Any rule (OR)'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <NLSegmentBuilder onRulesGenerated={(newRules, match) => { setRules(newRules); setMatchType(match); }} />
                  <div>
                    <Label className="text-xs flex items-center gap-1 mb-2"><Filter className="h-3 w-3" /> Rules</Label>
                    <RuleBuilder rules={rules} onChange={setRules} />
                  </div>
                  <EngageButton onClick={() => createSegment.mutate()} disabled={!name || createSegment.isPending} className="w-full">
                    {createSegment.isPending ? 'Saving & Evaluating...' : (editingSegment ? 'Update Segment' : 'Create Segment')}
                  </EngageButton>
                </div>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Search */}
      <motion.div variants={engageStagger.item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search segments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-white/[0.03] border-white/[0.06] backdrop-blur-sm" />
      </motion.div>

      <EngageStatGrid
        stats={[
          { label: 'Segments', count: segments.length, color: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400', icon: Layers },
          { label: 'Total Members', count: totalMembers, color: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', icon: Users },
        ]}
      />

      {/* Segment Members Viewer */}
      <Dialog open={!!viewingSegment} onOpenChange={() => setViewingSegment(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <EngageDialogHeader icon={Users} title={`${viewingSegment?.name} — Members`} gradientFrom="from-violet-400" gradientTo="to-purple-400" iconColor="text-violet-400" />
          <div className="flex items-center justify-between">
            {lastEvaluated && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last evaluated: {format(new Date(lastEvaluated), 'MMM d, yyyy HH:mm')}
              </p>
            )}
            {segmentMembers.length > 0 && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportMembersCSV}>
                <Download className="h-3 w-3" /> Export CSV
              </Button>
            )}
          </div>
          {segmentMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No members. Try evaluating the segment.</p>
          ) : (
            <GlassCard className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentMembers.map((m: any) => {
                    const c = m.engage_contacts || {};
                    return (
                      <TableRow key={m.contact_id} className="border-border/20">
                        <TableCell className="text-xs">{c.email || '—'}</TableCell>
                        <TableCell className="text-xs">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </GlassCard>
          )}
        </DialogContent>
      </Dialog>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredSegments.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="text-center py-20 space-y-4">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 blur-xl" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
              <Layers className="h-9 w-9 text-violet-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{searchQuery ? 'No matching segments' : 'No segments yet'}</p>
            <p className="text-sm text-muted-foreground">Create rule-based segments to target specific audiences</p>
          </div>
          {canEdit && !searchQuery && <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-shadow" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Create First Segment</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {filteredSegments.map((s: any, i: number) => {
            const memberCount = s.engage_segment_memberships?.[0]?.count || 0;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="p-4 hover:border-primary/30 hover:scale-[1.005] transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-violet-400 shrink-0" />
                        <h3 className="font-medium text-foreground">{s.name}</h3>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Users className="h-3 w-3" /> {memberCount}
                        </Badge>
                      </div>
                      {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                      <p className="text-[10px] text-muted-foreground/70 font-mono truncate">{getRuleSummary(s)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewingSegment(s)} title="View members">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateSegment.mutate(s)} title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => evaluateSegment.mutate(s.id)} disabled={evaluateSegment.isPending}>
                            <RefreshCw className={`h-3.5 w-3.5 ${evaluateSegment.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { openEdit(s); setShowAdd(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete segment?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently remove "{s.name}" and all its memberships.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSegment.mutate(s.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
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
