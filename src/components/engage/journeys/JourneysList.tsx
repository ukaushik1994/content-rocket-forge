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
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, GitBranch, ExternalLink, MoreVertical, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { class: string; dot: string }> = {
  draft: { class: 'bg-muted/50 text-muted-foreground border-border/50', dot: 'bg-muted-foreground' },
  active: { class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  paused: { class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
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
        .from('journeys').select('*')
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
        workspace_id: currentWorkspaceId!, name, created_by: user?.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      setShowCreate(false); setName('');
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

  const stats = {
    active: journeys.filter((j: any) => j.status === 'active').length,
    draft: journeys.filter((j: any) => j.status === 'draft').length,
    paused: journeys.filter((j: any) => j.status === 'paused').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Journeys</h2>
          <p className="text-sm text-muted-foreground">Visual customer journey flows</p>
        </div>
        {canEdit && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Journey</Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
              <DialogHeader><DialogTitle>Create Journey</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <Button onClick={() => createJourney.mutate()} disabled={!name} className="w-full">Create & Open Builder</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      {journeys.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active', count: stats.active, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400' },
            { label: 'Draft', count: stats.draft, color: 'from-muted/40 to-muted/10', text: 'text-muted-foreground' },
            { label: 'Paused', count: stats.paused, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className={`p-3 bg-gradient-to-br ${s.color}`}>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.text}`}>{s.count}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : journeys.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
            <GitBranch className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-muted-foreground">No journeys yet</p>
          {canEdit && <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Create First Journey</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {journeys.map((j: any, i: number) => {
            const sc = statusConfig[j.status] || statusConfig.draft;
            return (
              <motion.div key={j.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard
                  className="p-4 cursor-pointer hover:border-primary/30 hover:scale-[1.01] transition-all duration-200"
                  onClick={() => navigate(`/engage/journeys/${j.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{j.name}</h3>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${sc.class}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {j.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{format(new Date(j.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
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
    </div>
  );
};
