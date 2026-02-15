import React, { useCallback, useState } from 'react';
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
import { ArrowLeft, Save, Play, Pause, Plus, CheckCircle, Maximize, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { customNodeTypes } from './nodes/CustomNodes';
import { JourneyInspector } from './JourneyInspector';

const nodeColors: Record<string, string> = {
  trigger: '#8b5cf6', send_email: '#3b82f6', wait: '#f59e0b',
  condition: '#10b981', update_contact: '#6366f1', webhook: '#ec4899', end: '#6b7280',
};

const JourneyBuilderInner = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { data: journey } = useQuery({
    queryKey: ['journey', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('journeys').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Enrollment stats
  const { data: enrollmentStats } = useQuery<{ active: number; completed: number; exited: number }>({
    queryKey: ['journey-enrollment-stats', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_enrollments')
        .select('status')
        .eq('journey_id', id!);
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

  // Node execution counts
  const nodeExecQuery = useQuery({
    queryKey: ['journey-node-exec-counts', id] as const,
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_steps')
        .select('node_id')
        .eq('journey_id', id!);
      const counts: Record<string, number> = {};
      (data || []).forEach((s: any) => {
        counts[s.node_id] = (counts[s.node_id] || 0) + 1;
      });
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

      if (dbNodes?.length) {
        setNodes(dbNodes.map((n: any) => ({
          id: n.node_id,
          type: n.type,
          position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position,
          data: { label: n.type.replace('_', ' '), config: n.config || {}, execCount: nodeExecCounts[n.node_id] || 0 },
        })));
      }

      if (dbEdges?.length) {
        setEdges(dbEdges.map((e: any) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          label: e.condition_label || undefined,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 },
          animated: true,
        })));
      }
      return { dbNodes, dbEdges };
    },
    enabled: !!id,
  });

  // Update node exec counts when they change
  React.useEffect(() => {
    if (Object.keys(nodeExecCounts).length > 0) {
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, execCount: nodeExecCounts[n.id] || 0 },
      })));
    }
  }, [nodeExecCounts, setNodes]);

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
      id: nodeId,
      type,
      position: { x: 250 + Math.random() * 100, y: 100 + nodes.length * 150 },
      data: { label: type.replace('_', ' '), config: {}, execCount: 0 },
    };
    setNodes(nds => [...nds, newNode]);
  };

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

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

  const saveJourney = useMutation({
    mutationFn: async () => {
      await supabase.from('journey_nodes').delete().eq('journey_id', id!);
      await supabase.from('journey_edges').delete().eq('journey_id', id!);

      if (nodes.length) {
        const dbNodes = nodes.map(n => ({
          workspace_id: currentWorkspaceId!,
          journey_id: id!,
          node_id: n.id,
          type: n.type || 'trigger',
          config: (n.data as any)?.config || {},
          position: n.position,
        }));
        const { error } = await supabase.from('journey_nodes').insert(dbNodes);
        if (error) throw error;
      }

      if (edges.length) {
        const dbEdges = edges.map(e => ({
          workspace_id: currentWorkspaceId!,
          journey_id: id!,
          source_node_id: e.source,
          target_node_id: e.target,
          condition_label: (e as any).label || null,
        }));
        const { error } = await supabase.from('journey_edges').insert(dbEdges);
        if (error) throw error;
      }
    },
    onSuccess: () => toast.success('Journey saved'),
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async () => {
      const newStatus = journey?.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase.from('journeys').update({ status: newStatus }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey', id] });
      toast.success('Status updated');
    },
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
          <h2 className="font-semibold text-foreground">{journey?.name || 'Journey Builder'}</h2>
          <Badge variant="outline" className={statusBadgeClass}>{journey?.status || 'draft'}</Badge>
          {enrollmentStats && (
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Users className="h-3 w-3" /> {enrollmentStats.active} active
              </Badge>
              <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-400">
                {enrollmentStats.completed} done
              </Badge>
              <Badge variant="secondary" className="text-[10px] gap-1 bg-muted/50">
                {enrollmentStats.exited} exited
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={customNodeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="!bg-card/90 !backdrop-blur-md !border-border/50 !rounded-xl !shadow-lg" />
          <MiniMap className="!bg-card/90 !backdrop-blur-md !border-border/50 !rounded-xl" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--border))" />
        </ReactFlow>

        <JourneyInspector
          node={selectedNode}
          workspaceId={currentWorkspaceId}
          onUpdate={handleNodeConfigUpdate}
          onClose={() => setSelectedNode(null)}
          onDeleteNode={handleDeleteNode}
        />
      </div>
    </div>
  );
};

export const JourneyBuilder = () => (
  <ReactFlowProvider>
    <JourneyBuilderInner />
  </ReactFlowProvider>
);
