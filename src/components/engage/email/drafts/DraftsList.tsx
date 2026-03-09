import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Pencil, Trash2, Rocket, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SkeletonCard = () => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-3 w-[120px]" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </GlassCard>
);

export const DraftsList = () => {
  const { currentWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['draft-campaigns', currentWorkspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(name)')
        .eq('workspace_id', currentWorkspaceId!)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspaceId,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return drafts;
    const q = search.toLowerCase();
    return drafts.filter((d: any) =>
      d.name?.toLowerCase().includes(q) || d.email_templates?.name?.toLowerCase().includes(q)
    );
  }, [drafts, search]);

  const deleteDraft = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-campaigns'] });
      toast.success('Draft deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const launchDraft = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ status: 'sending' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-campaigns'] });
      toast.success('Campaign launched!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search drafts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/40" />
        </div>
        <p className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} drafts</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm">No drafts yet</p>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Create your first campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d: any, i: number) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <GlassCard className="p-4 hover:border-border/60 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {d.email_templates?.name && (
                        <Badge variant="secondary" className="text-[10px] h-5">Template: {d.email_templates.name}</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        Updated {format(new Date(d.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Edit"
                      onClick={() => {
                        // Navigate to campaigns tab with edit intent
                        toast.info('Switching to campaign editor...');
                      }}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    {/* Launch with confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" title="Launch" disabled={launchDraft.isPending}>
                          <Rocket className="h-3.5 w-3.5 text-emerald-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Launch campaign?</AlertDialogTitle>
                          <AlertDialogDescription>"{d.name}" will begin sending immediately to all matched contacts. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => launchDraft.mutate(d.id)}>Launch</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* Delete with confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" title="Delete">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete draft?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete "{d.name}". This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteDraft.mutate(d.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
