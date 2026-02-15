import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, MiniMap, Background,
  BackgroundVariant, Connection, MarkerType, type Node, type Edge, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Save, Play, Pause, Plus, CheckCircle, Maximize, Users, Undo2, Redo2, BarChart3, Loader2, TrendingUp, ListChecks } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { customNodeTypes } from './nodes/CustomNodes';
import { JourneyInspector } from './JourneyInspector';
import { JourneyAnalytics } from './JourneyAnalytics';
import { JourneyEnrollments } from './JourneyEnrollments';
import { JourneyPerformance } from './JourneyPerformance';

const MAX_HISTORY = 20;

const JourneyBuilderInner = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const reactFlowInstance = useReactFlow();

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

  const { data: nodeExecCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['journey-node-exec-counts', id],
    queryFn: async () => {
      const { data } = await supabase.from('journey_steps' as any).select('node_id').eq('journey_id', id!);
      const counts: Record<string, number> = {};
      ((data as any[]) || []).forEach((s: any) => { counts[s.node_id] = (counts[s.node_id] || 0) + 1; });
      return counts;
    },
    enabled: !!id,
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
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 },
        animated: true,
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) handleDeleteNode(selectedNode.id);
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveJourney.mutate(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNode, undo, redo]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({
      ...connection,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 },
      animated: true,
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

  const statusBadgeClass = journey?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : journey?.status === 'paused' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="h-full flex flex-col -m-6 relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/engage/journeys')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">{journey?.name || 'Journey Builder'}</h2>
              <Badge variant="outline" className={statusBadgeClass}>{journey?.status || 'draft'}</Badge>
              {(journey as any)?.version && <Badge variant="secondary" className="text-[9px] h-4">v{(journey as any).version}</Badge>}
            </div>
            {journey?.description && <p className="text-[10px] text-muted-foreground">{journey.description}</p>}
          </div>
          {autoSaveStatus === 'saving' && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-[10px] text-emerald-400">Auto-saved</span>
          )}
          {enrollmentStats && (
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="secondary" className="text-[10px] gap-1"><Users className="h-3 w-3" /> {enrollmentStats.active} active</Badge>
              <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-400">{enrollmentStats.completed} done</Badge>
              <Badge variant="secondary" className="text-[10px] gap-1 bg-muted/50">{enrollmentStats.exited} exited</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8"><Plus className="h-3.5 w-3.5 mr-1" /> Add Node</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50">
              <DropdownMenuItem onClick={() => addNode('trigger')}>🎯 Trigger</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('send_email')}>📧 Send Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('wait')}>⏰ Wait</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('condition')}>🔀 Condition</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('update_contact')}>👤 Update Contact</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('webhook')}>🔗 Webhook</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('end')}>🏁 End</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-8" onClick={() => reactFlowInstance.fitView({ padding: 0.2 })}>
            <Maximize className="h-3.5 w-3.5 mr-1" /> Fit
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setShowEnrollments(true)}>
            <ListChecks className="h-3.5 w-3.5 mr-1" /> Enrollments
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setShowPerformance(true)}>
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Performance
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setShowAnalytics(true)}>
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Analytics
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={validateJourney}>
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Validate
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => saveJourney.mutate()}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
          <Button size="sm" className="h-8" onClick={() => toggleStatus.mutate()}>
            {journey?.status === 'active' ? <><Pause className="h-3.5 w-3.5 mr-1" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1" /> Publish</>}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={handleNodeClick}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          nodeTypes={customNodeTypes} fitView snapToGrid snapGrid={[16, 16]}
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="!bg-card/90 !backdrop-blur-md !border-border/50 !rounded-xl !shadow-lg" />
          <MiniMap className="!bg-card/90 !backdrop-blur-md !border-border/50 !rounded-xl" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--border))" />
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
    </div>
  );
};

export const JourneyBuilder = () => (
  <ReactFlowProvider>
    <JourneyBuilderInner />
  </ReactFlowProvider>
);
