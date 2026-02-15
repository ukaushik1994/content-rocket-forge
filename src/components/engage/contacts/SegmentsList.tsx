import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Layers, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

export const SegmentsList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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

  const createSegment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('engage_segments').insert({
        workspace_id: currentWorkspaceId!,
        name,
        description: description || null,
        definition: { match: 'all', rules: [] },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engage-segments'] });
      setShowAdd(false);
      setName('');
      setDescription('');
      toast.success('Segment created');
    },
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Segments</h2>
          <p className="text-sm text-muted-foreground">Group contacts by rules</p>
        </div>
        {canEdit && (
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Segment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Segment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
                <Button onClick={() => createSegment.mutate()} disabled={!name} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : segments.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Layers className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No segments yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {segments.map((s: any) => {
            const memberCount = s.engage_segment_memberships?.[0]?.count || 0;
            return (
              <Card key={s.id} className="bg-card border-border">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground">{s.name}</h3>
                    {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" /> {memberCount}
                    </Badge>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => evaluateSegment.mutate(s.id)}
                        disabled={evaluateSegment.isPending}
                      >
                        <RefreshCw className={`h-4 w-4 ${evaluateSegment.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
