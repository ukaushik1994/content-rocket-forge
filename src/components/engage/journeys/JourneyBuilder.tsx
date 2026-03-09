import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, Background,
  BackgroundVariant, Connection, MarkerType, type Node, type Edge, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Play, Pause, Plus, CheckCircle, Maximize, Users, Undo2, Redo2, BarChart3,
  Loader2, TrendingUp, ListChecks, Settings, UserPlus, History, Download,
  MoreHorizontal, GitBranch, Mail, Clock, RefreshCw, Tag, TagIcon, Globe, SplitSquareVertical, CircleStop,
  Zap, Target,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { customNodeTypes } from './nodes/CustomNodes';
import { JourneyInspector } from './JourneyInspector';
import { JourneyAnalytics } from './JourneyAnalytics';
import { JourneyEnrollments } from './JourneyEnrollments';
import { JourneyPerformance } from './JourneyPerformance';
import { EngageDialogHeader } from '../shared/EngageDialogHeader';
import { EngageButton } from '../shared/EngageButton';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MAX_HISTORY = 20;

const JourneyBuilderInner = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspaceId } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEnrollContact, setShowEnrollContact] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const reactFlowInstance = useReactFlow();

  // E6: Copy/paste
  const clipboardRef = useRef<Node | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Undo/Redo
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const historyIndexRef = useRef(-1);
  const skipHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Auto-save
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadRef = useRef(true);

  // F8/E4: Scheduling config
  const [schedulingConfig, setSchedulingConfig] = useState<any>({});
  const [suppressionRules, setSuppressionRules] = useState<any>({});

  // E3: Enroll contact
  const [enrollContactId, setEnrollContactId] = useState('');

  const pushHistory = useCallback((n: Node[], e: Edge[]) => {
    if (skipHistoryRef.current) { skipHistoryRef.current = false; return; }
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push({ nodes: JSON.parse(JSON.stringify(n)), edges: JSON.parse(JSON.stringify(e)) });
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    skipHistoryRef.current = true;
    setNodes(state.nodes);
    setEdges(state.edges);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    skipHistoryRef.current = true;
    setNodes(state.nodes);
    setEdges(state.edges);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [setNodes, setEdges]);

  // Track changes for history + auto-save
  useEffect(() => {
    if (initialLoadRef.current) return;
    pushHistory(nodes, edges);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (nodes.length > 0) {
        setAutoSaveStatus('saving');
        doSave().then(() => setAutoSaveStatus('saved')).catch(() => setAutoSaveStatus('idle'));
      }
    }, 3000);
  }, [nodes.length, edges.length]);

  const { data: journey } = useQuery({
    queryKey: ['journey', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('journeys').select('*').eq('id', id!).single();
      if (error) throw error;
      setSchedulingConfig((data as any)?.scheduling_config || {});
      setSuppressionRules((data as any)?.suppression_rules || {});
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollmentStats } = useQuery<{ active: number; completed: number; exited: number }>({
    queryKey: ['journey-enrollment-stats', id],
    queryFn: async () => {
      const { data } = await supabase.from('journey_enrollments').select('status').eq('journey_id', id!);
      const stats = { active: 0, completed: 0, exited: 0 };
      (data || []).forEach((e: any) => {
        if (e.status === 'active') stats.active++;
        else if (e.status === 'completed') stats.completed++;
        else stats.exited++;
      });
      return stats;
    },
    enabled: !!id,
  });

  // F7 FIX: Get node exec counts by joining through enrollments
  const { data: nodeExecCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['journey-node-exec-counts', id],
    queryFn: async () => {
      const { data: enrollments } = await supabase
        .from('journey_enrollments')
        .select('id')
        .eq('journey_id', id!);
      if (!enrollments?.length) return {};
      const enrollmentIds = enrollments.map(e => e.id);
      const { data } = await supabase
        .from('journey_steps')
        .select('node_id')
        .in('enrollment_id', enrollmentIds);
      const counts: Record<string, number> = {};
      (data || []).forEach((s: any) => { counts[s.node_id] = (counts[s.node_id] || 0) + 1; });
      return counts;
    },
    enabled: !!id,
  });

  // E5: Version history
  const { data: versions = [] } = useQuery({
    queryKey: ['journey-versions', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_versions')
        .select('*')
        .eq('journey_id', id!)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!id && showVersions,
  });

  // E3: Contacts for enrollment
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-enroll', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('engage_contacts')
        .select('id, email, first_name, last_name')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('unsubscribed', false)
        .limit(50);
      return data || [];
    },
    enabled: !!currentWorkspaceId && showEnrollContact,
  });

  useQuery({
    queryKey: ['journey-nodes', id],
    queryFn: async () => {
      const [{ data: dbNodes }, { data: dbEdges }] = await Promise.all([
        supabase.from('journey_nodes').select('*').eq('journey_id', id!),
        supabase.from('journey_edges').select('*').eq('journey_id', id!),
      ]);

      const loadedNodes = (dbNodes || []).map((n: any) => ({
        id: n.node_id,
        type: n.type,
        position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position,
        data: { label: n.type.replace('_', ' '), config: n.config || {}, execCount: nodeExecCounts[n.node_id] || 0 },
      }));

      const loadedEdges = (dbEdges || []).map((e: any) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.condition_label || undefined,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--border))' },
        style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      }));

      skipHistoryRef.current = true;
      setNodes(loadedNodes);
      setEdges(loadedEdges);

      setTimeout(() => {
        historyRef.current = [{ nodes: JSON.parse(JSON.stringify(loadedNodes)), edges: JSON.parse(JSON.stringify(loadedEdges)) }];
        historyIndexRef.current = 0;
        initialLoadRef.current = false;
      }, 100);

      return { dbNodes, dbEdges };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (Object.keys(nodeExecCounts).length > 0) {
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, execCount: nodeExecCounts[n.id] || 0 } })));
    }
  }, [nodeExecCounts, setNodes]);

  // Keyboard shortcuts including E6 copy/paste
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) handleDeleteNode(selectedNode.id);
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveJourney.mutate(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedNode) {
        clipboardRef.current = selectedNode;
        toast.success('Node copied');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardRef.current) {
        const src = clipboardRef.current;
        const nodeId = `${src.type}_${Date.now()}`;
        const newNode: Node = {
          id: nodeId, type: src.type,
          position: { x: src.position.x + 50, y: src.position.y + 80 },
          data: { label: (src.data as any)?.label || src.type?.replace('_', ' '), config: { ...(src.data as any)?.config }, execCount: 0 },
        };
        setNodes(nds => [...nds, newNode]);
        toast.success('Node pasted');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNode, undo, redo]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({
      ...connection,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--border))' },
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
    }, eds));
  }, [setEdges]);

  const addNode = (type: string) => {
    const nodeId = `${type}_${Date.now()}`;
    const newNode: Node = {
      id: nodeId, type,
      position: { x: 250 + Math.random() * 100, y: 100 + nodes.length * 150 },
      data: { label: type.replace('_', ' '), config: {}, execCount: 0 },
    };
    setNodes(nds => [...nds, newNode]);
  };

  const handleNodeClick = useCallback((_: any, node: Node) => setSelectedNode(node), []);

  const handleEdgeDoubleClick = useCallback((_: any, edge: Edge) => {
    const label = prompt('Edge label:', (edge.label as string) || '');
    if (label !== null) {
      setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, label: label || undefined } : e));
    }
  }, [setEdges]);

  const handleNodeConfigUpdate = (nodeId: string, config: Record<string, any>) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n));
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data: { ...prev.data, config } } : prev);
    toast.success('Node config saved');
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    toast.success('Node deleted');
  };

  const validateJourney = () => {
    const triggers = nodes.filter(n => n.type === 'trigger');
    if (triggers.length === 0) { toast.error('Journey needs at least one Trigger node'); return; }
    const ends = nodes.filter(n => n.type === 'end');
    if (ends.length === 0) { toast.warning('Add an End node to mark journey completion'); return; }
    const connected = new Set<string>();
    const queue = triggers.map(t => t.id);
    while (queue.length) {
      const current = queue.shift()!;
      if (connected.has(current)) continue;
      connected.add(current);
      edges.filter(e => e.source === current).forEach(e => queue.push(e.target));
    }
    const orphans = nodes.filter(n => !connected.has(n.id));
    if (orphans.length) { toast.error(`${orphans.length} node(s) not reachable from trigger`); return; }
    toast.success('Journey is valid ✓');
  };

  const doSave = async () => {
    if (nodes.length > 0 && currentWorkspaceId) {
      const { data: existingVersions } = await supabase
        .from('journey_versions')
        .select('version_number')
        .eq('journey_id', id!)
        .order('version_number', { ascending: false })
        .limit(1);
      const nextVersion = (existingVersions?.[0]?.version_number || 0) + 1;
      await supabase.from('journey_versions').insert({
        workspace_id: currentWorkspaceId,
        journey_id: id!,
        version_number: nextVersion,
        snapshot: { nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })), edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label })) },
        created_by: user?.id,
        change_summary: `Auto-save v${nextVersion}`,
      });
    }

    await supabase.from('journey_nodes').delete().eq('journey_id', id!);
    await supabase.from('journey_edges').delete().eq('journey_id', id!);

    if (nodes.length) {
      const dbNodes = nodes.map(n => ({
        workspace_id: currentWorkspaceId!, journey_id: id!,
        node_id: n.id, type: n.type || 'trigger',
        config: (n.data as any)?.config || {}, position: n.position,
      }));
      const { error } = await supabase.from('journey_nodes').insert(dbNodes);
      if (error) throw error;
    }

    if (edges.length) {
      const dbEdges = edges.map(e => ({
        workspace_id: currentWorkspaceId!, journey_id: id!,
        source_node_id: e.source, target_node_id: e.target,
        condition_label: (e as any).label || null,
      }));
      const { error } = await supabase.from('journey_edges').insert(dbEdges);
      if (error) throw error;
    }
  };

  const saveJourney = useMutation({
    mutationFn: doSave,
    onSuccess: () => toast.success('Journey saved'),
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async () => {
      const newStatus = journey?.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase.from('journeys').update({ status: newStatus }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['journey', id] }); toast.success('Status updated'); },
  });

  // F4: Run processor manually
  const runProcessor = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('engage-journey-processor');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processor ran: ${data?.processed || 0} processed, ${data?.skipped || 0} skipped`);
      queryClient.invalidateQueries({ queryKey: ['journey-node-exec-counts', id] });
      queryClient.invalidateQueries({ queryKey: ['journey-enrollment-stats', id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // F8/E4: Save scheduling config
  const saveSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('journeys').update({
        scheduling_config: schedulingConfig,
        suppression_rules: suppressionRules,
      }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Settings saved'); setShowSettings(false); },
  });

  // E3: Enroll contact
  const enrollContact = useMutation({
    mutationFn: async () => {
      if (!enrollContactId) return;
      const triggerNode = nodes.find(n => n.type === 'trigger');
      if (!triggerNode) throw new Error('No trigger node found');

      const { data: enrollment, error } = await supabase.from('journey_enrollments').insert({
        workspace_id: currentWorkspaceId!, journey_id: id!, contact_id: enrollContactId, status: 'active',
      }).select().single();
      if (error) throw error;

      await supabase.from('journey_steps').insert({
        workspace_id: currentWorkspaceId!, enrollment_id: enrollment.id,
        node_id: triggerNode.id, status: 'pending', scheduled_for: new Date().toISOString(), output: {},
      });
    },
    onSuccess: () => {
      toast.success('Contact enrolled');
      setShowEnrollContact(false);
      setEnrollContactId('');
      queryClient.invalidateQueries({ queryKey: ['journey-enrollment-stats', id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // E5: Restore version
  const restoreVersion = async (version: any) => {
    const snapshot = version.snapshot;
    if (!snapshot?.nodes) return;
    const restoredNodes = snapshot.nodes.map((n: any) => ({
      ...n,
      data: { ...n.data, execCount: 0 },
    }));
    const restoredEdges = (snapshot.edges || []).map((e: any) => ({
      ...e,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--border))' },
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
    }));
    setNodes(restoredNodes);
    setEdges(restoredEdges);
    setShowVersions(false);
    toast.success(`Restored to v${version.version_number}`);
  };

  // E8: Export as JSON
  const exportJourney = () => {
    const data = {
      name: journey?.name,
      description: journey?.description,
      scheduling_config: (journey as any)?.scheduling_config,
      suppression_rules: (journey as any)?.suppression_rules,
      nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, config: (n.data as any)?.config })),
      edges: edges.map(e => ({ source: e.source, target: e.target, label: e.label })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journey?.name || 'journey'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Journey exported');
  };

  const statusDotClass = journey?.status === 'active' ? 'bg-emerald-500'
    : journey?.status === 'paused' ? 'bg-amber-500'
    : 'bg-muted-foreground';

  const statusLabel = journey?.status || 'draft';

  const nodeCategories = [
    { label: 'Triggers', items: [
      { type: 'trigger', name: 'Trigger', desc: 'Start the journey', color: 'bg-purple-500', icon: Target },
    ]},
    { label: 'Actions', items: [
      { type: 'send_email', name: 'Send Email', desc: 'Send an email to contact', color: 'bg-blue-500', icon: Mail },
      { type: 'wait', name: 'Wait', desc: 'Delay before next step', color: 'bg-amber-500', icon: Clock },
      { type: 'update_contact', name: 'Update Contact', desc: 'Modify contact fields', color: 'bg-cyan-500', icon: RefreshCw },
      { type: 'add_tag', name: 'Add Tag', desc: 'Apply a tag to contact', color: 'bg-emerald-500', icon: Tag },
      { type: 'remove_tag', name: 'Remove Tag', desc: 'Remove a tag from contact', color: 'bg-rose-500', icon: TagIcon },
      { type: 'webhook', name: 'Webhook', desc: 'Call an external URL', color: 'bg-orange-500', icon: Globe },
    ]},
    { label: 'Logic', items: [
      { type: 'condition', name: 'Condition', desc: 'Branch based on rules', color: 'bg-yellow-500', icon: SplitSquareVertical },
      { type: 'end', name: 'End', desc: 'End the journey', color: 'bg-muted-foreground', icon: CircleStop },
    ]},
  ];

  const NodeDropdownItems = () => (
    <>
      {nodeCategories.map((cat, ci) => (
        <React.Fragment key={cat.label}>
          {ci > 0 && <div className="h-px bg-border/30 my-1.5" />}
          <div className="px-3 py-1.5 flex items-center gap-2">
            <div className="w-0.5 h-3 rounded-full bg-primary/40" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{cat.label}</span>
          </div>
          {cat.items.map(item => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.type} onClick={() => addNode(item.type)} className="gap-3 py-2 px-3 mx-1 rounded-lg">
                <div className={`h-7 w-7 rounded-lg ${item.color}/15 flex items-center justify-center shrink-0`}>
                  <Icon className={`h-3.5 w-3.5`} style={{ color: `var(--${item.color.replace('bg-', '')})` }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                </div>
              </DropdownMenuItem>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );

  const ToolbarIconButton = ({ onClick, disabled, title, children }: { onClick?: () => void; disabled?: boolean; title: string; children: React.ReactNode }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground" onClick={onClick} disabled={disabled}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="h-full flex flex-col -m-6 relative">
      {/* ─── Premium Toolbar ─── */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border/30 bg-background/60 backdrop-blur-2xl z-10">
        {/* Left: Navigation + Name + Status */}
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg shrink-0 text-muted-foreground hover:text-foreground" onClick={() => navigate('/engage/journeys')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex items-center gap-3">
            <h2 className="font-semibold text-foreground text-base tracking-tight truncate max-w-[240px]">
              {journey?.name || 'Journey Builder'}
            </h2>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
              <span className="text-[11px] text-muted-foreground capitalize">{statusLabel}</span>
            </div>
          </div>
          {/* Auto-save indicator */}
          <div className="shrink-0">
            {autoSaveStatus === 'saving' && (
              <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Saving</span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/80 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* Right: Grouped actions */}
        <div className="flex items-center gap-3">
          {/* ─ Undo/Redo group ─ */}
          <div className="flex items-center bg-muted/40 rounded-lg p-0.5">
            <ToolbarIconButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </ToolbarIconButton>
            <ToolbarIconButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Redo2 className="h-4 w-4" />
            </ToolbarIconButton>
          </div>

          {/* ─ Add Node ─ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-xs rounded-lg border-border/50 px-3.5">
                <Plus className="h-3.5 w-3.5" /> Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border/40 shadow-xl rounded-xl p-1">
              <NodeDropdownItems />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ─ Quick access group ─ */}
          <div className="flex items-center bg-muted/40 rounded-lg p-0.5">
            <ToolbarIconButton onClick={() => reactFlowInstance.fitView({ padding: 0.2 })} title="Fit View">
              <Maximize className="h-4 w-4" />
            </ToolbarIconButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-xl border-border/40 shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => setShowSettings(true)} className="gap-2.5 text-[13px]"><Settings className="h-3.5 w-3.5" /> Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEnrollContact(true)} className="gap-2.5 text-[13px]"><UserPlus className="h-3.5 w-3.5" /> Enroll Contact</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowVersions(true)} className="gap-2.5 text-[13px]"><History className="h-3.5 w-3.5" /> Versions</DropdownMenuItem>
                <div className="h-px bg-border/30 my-1" />
                <DropdownMenuItem onClick={exportJourney} className="gap-2.5 text-[13px]"><Download className="h-3.5 w-3.5" /> Export JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover/95 backdrop-blur-xl border-border/40 shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => setShowAnalytics(true)} className="gap-2.5 text-[13px]"><BarChart3 className="h-3.5 w-3.5" /> Analytics</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEnrollments(true)} className="gap-2.5 text-[13px]"><ListChecks className="h-3.5 w-3.5" /> Enrollments</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPerformance(true)} className="gap-2.5 text-[13px]"><TrendingUp className="h-3.5 w-3.5" /> Performance</DropdownMenuItem>
                {enrollmentStats && (
                  <>
                    <div className="h-px bg-border/30 my-1" />
                    <div className="px-3 py-2 flex items-center gap-4 text-[11px]">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />{enrollmentStats.active} active</span>
                      <span className="flex items-center gap-1.5 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{enrollmentStats.completed} done</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />{enrollmentStats.exited} exit</span>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ─ Primary actions ─ */}
          <div className="flex items-center gap-2 pl-1">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs rounded-lg border-border/50" onClick={validateJourney}>
              <CheckCircle className="h-3.5 w-3.5" /> Validate
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs rounded-lg border-border/50" onClick={() => saveJourney.mutate()}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
            <Button
              size="sm"
              className={`h-9 gap-2 text-xs rounded-full px-6 font-medium transition-all ${
                journey?.status === 'active'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 shadow-lg'
                  : 'bg-foreground text-background hover:bg-foreground/90 shadow-lg'
              }`}
              onClick={() => toggleStatus.mutate()}
            >
              {journey?.status === 'active' ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Publish</>}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Canvas ─── */}
      <div className="flex-1 relative">
        {/* Radial spotlight overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.3)_0%,transparent_70%)]" />
        {/* Corner vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,hsl(var(--background)/0.6)_100%)]" />

        {nodes.length === 0 && !initialLoadRef.current && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative pointer-events-auto text-center space-y-6"
            >
              {/* Floating icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative h-24 w-24 mx-auto"
              >
                <div className="absolute inset-0 rounded-3xl bg-primary/8 blur-xl" />
                <div className="absolute -inset-4 rounded-[28px] border border-primary/10 animate-[pulse_3s_ease-in-out_infinite]" />
                <div className="relative h-24 w-24 rounded-3xl bg-card/80 border border-border/40 flex items-center justify-center backdrop-blur-sm shadow-xl">
                  <GitBranch className="h-10 w-10 text-muted-foreground/60" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground text-lg tracking-tight">Start building your journey</p>
                <p className="text-sm text-muted-foreground/70 max-w-[280px] mx-auto">Add your first node to begin creating an automation flow</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 h-10 text-sm shadow-lg">
                    <Plus className="h-4 w-4 mr-2" /> Add First Node
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover/95 backdrop-blur-xl border-border/40 shadow-xl rounded-xl p-1">
                  <NodeDropdownItems />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick suggestion pills */}
              <div className="flex items-center gap-2 justify-center pt-1">
                <button onClick={() => addNode('trigger')} className="text-[11px] text-muted-foreground/60 hover:text-foreground px-3 py-1.5 rounded-full border border-border/30 hover:border-border/60 transition-colors">
                  Start with a Trigger
                </button>
                <button onClick={exportJourney} className="text-[11px] text-muted-foreground/60 hover:text-foreground px-3 py-1.5 rounded-full border border-border/30 hover:border-border/60 transition-colors">
                  Import JSON
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={handleNodeClick}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          nodeTypes={customNodeTypes} fitView snapToGrid snapGrid={[16, 16]}
          proOptions={{ hideAttribution: true }}
          className="[&_.react-flow__controls]:!bg-card/90 [&_.react-flow__controls]:!backdrop-blur-xl [&_.react-flow__controls]:!border-border/40 [&_.react-flow__controls]:!rounded-xl [&_.react-flow__controls]:!shadow-xl [&_.react-flow__controls-button]:!bg-transparent [&_.react-flow__controls-button]:!border-border/20 [&_.react-flow__controls-button]:!fill-muted-foreground [&_.react-flow__controls-button:hover]:!fill-foreground"
        >
          <Controls showMiniMap={false} />
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="hsl(var(--muted-foreground) / 0.12)" />
        </ReactFlow>

        <JourneyInspector
          node={selectedNode} workspaceId={currentWorkspaceId}
          onUpdate={handleNodeConfigUpdate} onClose={() => setSelectedNode(null)}
          onDeleteNode={handleDeleteNode}
        />
      </div>

      {/* Dialogs */}
      <JourneyAnalytics journeyId={id!} open={showAnalytics} onOpenChange={setShowAnalytics} nodes={nodes} />
      <JourneyEnrollments journeyId={id!} open={showEnrollments} onOpenChange={setShowEnrollments} />
      <JourneyPerformance journeyId={id!} open={showPerformance} onOpenChange={setShowPerformance} nodes={nodes} />

      {/* F8/E4: Scheduling & Suppression Settings */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <EngageDialogHeader icon={Settings} title="Journey Settings" gradientFrom="from-purple-400" gradientTo="to-blue-400" iconColor="text-purple-400" />
          <div className="space-y-5">
            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Send Window</Label>
                <Switch checked={schedulingConfig.send_window_enabled || false} onCheckedChange={v => setSchedulingConfig((c: any) => ({ ...c, send_window_enabled: v }))} />
              </div>
              {schedulingConfig.send_window_enabled && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Start Hour (UTC)</Label>
                    <Select value={String(schedulingConfig.send_window_start || 9)} onValueChange={v => setSchedulingConfig((c: any) => ({ ...c, send_window_start: Number(v) }))}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">End Hour (UTC)</Label>
                    <Select value={String(schedulingConfig.send_window_end || 18)} onValueChange={v => setSchedulingConfig((c: any) => ({ ...c, send_window_end: Number(v) }))}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Frequency Cap</Label>
                <Switch checked={schedulingConfig.frequency_cap_enabled || false} onCheckedChange={v => setSchedulingConfig((c: any) => ({ ...c, frequency_cap_enabled: v }))} />
              </div>
              {schedulingConfig.frequency_cap_enabled && (
                <div>
                  <Label className="text-xs">Max emails per day</Label>
                  <Input type="number" className="h-8 text-xs mt-1" value={schedulingConfig.max_emails_per_day || 3} onChange={e => setSchedulingConfig((c: any) => ({ ...c, max_emails_per_day: Number(e.target.value) }))} />
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Skip Unsubscribed</Label>
                <Switch checked={suppressionRules.skip_unsubscribed || false} onCheckedChange={v => setSuppressionRules((c: any) => ({ ...c, skip_unsubscribed: v }))} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Automatically skip contacts who have unsubscribed</p>
            </GlassCard>

            <EngageButton className="w-full" onClick={() => saveSettings.mutate()}>Save Settings</EngageButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* E3: Enroll Contact Dialog */}
      <Dialog open={showEnrollContact} onOpenChange={setShowEnrollContact}>
        <DialogContent className="max-w-sm">
          <EngageDialogHeader icon={UserPlus} title="Enroll Contact" gradientFrom="from-emerald-400" gradientTo="to-blue-400" iconColor="text-emerald-400" />
          <div className="space-y-3">
            <Select value={enrollContactId} onValueChange={setEnrollContactId}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select a contact" /></SelectTrigger>
              <SelectContent>
                {contacts.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.first_name || ''} {c.last_name || ''} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <EngageButton className="w-full" onClick={() => enrollContact.mutate()} disabled={!enrollContactId || enrollContact.isPending}>
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Enroll
            </EngageButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* E5: Version History Dialog */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <EngageDialogHeader icon={History} title="Version History" gradientFrom="from-purple-400" gradientTo="to-blue-400" iconColor="text-purple-400" />
          <div className="space-y-2">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No versions saved yet. Versions are created automatically on each save.</p>
            ) : (
              versions.map((v: any) => (
                <GlassCard key={v.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">v{v.version_number}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(v.created_at), 'MMM d, yyyy HH:mm')}</p>
                      {v.change_summary && <p className="text-[10px] text-muted-foreground">{v.change_summary}</p>}
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => restoreVersion(v)}>
                      Restore
                    </Button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const JourneyBuilder = () => (
  <ReactFlowProvider>
    <JourneyBuilderInner />
  </ReactFlowProvider>
);
