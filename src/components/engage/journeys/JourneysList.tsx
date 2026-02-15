import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GitBranch, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/20 text-success',
  paused: 'bg-warning/20 text-warning',
};

export const JourneysList = () => {
  const { currentWorkspaceId, canEdit } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['journeys', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const createJourney = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from('journeys').insert({
        workspace_id: currentWorkspaceId!,
        name,
        created_by: user?.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      setShowCreate(false);
      setName('');
      navigate(`/engage/journeys/${data.id}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Journeys</h2>
          <p className="text-sm text-muted-foreground">Visual customer journey flows</p>
        </div>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Journey</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Journey</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <Button onClick={() => createJourney.mutate()} disabled={!name} className="w-full">Create & Open Builder</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : journeys.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <GitBranch className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No journeys yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {journeys.map((j: any) => (
            <Card key={j.id} className="bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/engage/journeys/${j.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{j.name}</h3>
                    <Badge className={statusColors[j.status] || ''}>{j.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{format(new Date(j.created_at), 'MMM d, yyyy')}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
