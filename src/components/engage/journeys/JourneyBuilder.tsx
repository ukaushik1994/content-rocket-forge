import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Save, Play, Pause, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const nodeTypes = {
  trigger: 'trigger',
  sendEmail: 'send_email',
  wait: 'wait',
  condition: 'condition',
  updateContact: 'update_contact',
  webhook: 'webhook',
  end: 'end',
};

const nodeColors: Record<string, string> = {
  trigger: '#8b5cf6',
  send_email: '#3b82f6',
  wait: '#f59e0b',
  condition: '#10b981',
  update_contact: '#6366f1',
  webhook: '#ec4899',
  end: '#6b7280',
};

export const JourneyBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();

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

  // Load saved nodes/edges
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
          type: 'default',
          position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position,
          data: {
            label: `${n.type}${n.config?.label ? ': ' + n.config.label : ''}`,
          },
          style: {
            background: nodeColors[n.type] || '#6b7280',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 16px',
            border: 'none',
            fontSize: 12,
          },
        })));
      }

      if (dbEdges?.length) {
        setEdges(dbEdges.map((e: any) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          label: e.condition_label || undefined,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b' },
        })));
      }

      return { dbNodes, dbEdges };
    },
    enabled: !!id,
  });

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({
      ...connection,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#64748b' },
    }, eds));
  }, [setEdges]);

  const addNode = (type: string) => {
    const nodeId = `${type}_${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'default',
      position: { x: 250 + Math.random() * 100, y: 100 + nodes.length * 120 },
      data: { label: type.replace('_', ' ') },
      style: {
        background: nodeColors[type] || '#6b7280',
        color: '#fff',
        borderRadius: 8,
        padding: '8px 16px',
        border: 'none',
        fontSize: 12,
      },
    };
    setNodes(nds => [...nds, newNode]);
  };

  const saveJourney = useMutation({
    mutationFn: async () => {
      // Delete old, insert new
      await supabase.from('journey_nodes').delete().eq('journey_id', id!);
      await supabase.from('journey_edges').delete().eq('journey_id', id!);

      if (nodes.length) {
        const dbNodes = nodes.map(n => ({
          workspace_id: currentWorkspaceId!,
          journey_id: id!,
          node_id: n.id,
          type: n.id.split('_')[0] || 'trigger',
          config: { label: n.data?.label || '' },
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

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/engage/journeys')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-medium text-foreground">{journey?.name || 'Journey Builder'}</h2>
          <Badge variant="secondary">{journey?.status || 'draft'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Add Node</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => addNode('trigger')}>🎯 Trigger</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('send_email')}>📧 Send Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('wait')}>⏰ Wait</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('condition')}>🔀 Condition</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('update_contact')}>👤 Update Contact</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('webhook')}>🔗 Webhook</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode('end')}>🏁 End</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => saveJourney.mutate()}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
          <Button size="sm" onClick={() => toggleStatus.mutate()}>
            {journey?.status === 'active' ? <><Pause className="h-3.5 w-3.5 mr-1" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1" /> Publish</>}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
        >
          <Controls className="!bg-card !border-border" />
          <MiniMap className="!bg-card !border-border" />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--border))" />
        </ReactFlow>
      </div>
    </div>
  );
};
