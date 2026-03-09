import React, { useState } from 'react';
import { PanelShell } from '@/components/ai-chat/panels/PanelShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Target, Lightbulb, Plus, Trash2, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useClusters, useContentGaps, useRecommendations } from '@/hooks/useResearchIntelligence';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ResearchIntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchIntelligencePanel: React.FC<ResearchIntelligencePanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('clusters');

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Research Intelligence" icon={<Brain className="h-4 w-4" />}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="clusters" className="text-xs">Clusters</TabsTrigger>
          <TabsTrigger value="gaps" className="text-xs">Content Gaps</TabsTrigger>
          <TabsTrigger value="recs" className="text-xs">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="clusters"><ClustersTab /></TabsContent>
        <TabsContent value="gaps"><GapsTab /></TabsContent>
        <TabsContent value="recs"><RecsTab /></TabsContent>
      </Tabs>
    </PanelShell>
  );
};

// ── Clusters Tab ──
const ClustersTab: React.FC = () => {
  const { data: clusters, isLoading, create, remove } = useClusters();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await create({ cluster_name: newName.trim() });
    setNewName('');
    setCreating(false);
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{clusters?.length ?? 0} clusters</p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCreating(true)}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>

      {creating && (
        <Card className="p-3 space-y-2 border-primary/20">
          <input
            autoFocus
            placeholder="Cluster name..."
            className="w-full bg-transparent text-sm border-b border-border/30 pb-1 outline-none focus:border-primary/50"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-1.5 justify-end">
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setCreating(false)}>Cancel</Button>
            <Button size="sm" className="h-6 text-xs" onClick={handleCreate}>Create</Button>
          </div>
        </Card>
      )}

      {clusters?.map(c => (
        <Card key={c.id} className="p-3 group hover:border-primary/20 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-foreground truncate">{c.cluster_name}</h4>
              {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                {c.importance_score != null && (
                  <Badge variant="secondary" className="text-[10px] h-4">Score: {c.importance_score}</Badge>
                )}
                {c.topic_count != null && (
                  <span className="text-[10px] text-muted-foreground">{c.topic_count} topics</span>
                )}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => remove(c.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      ))}

      {!clusters?.length && !creating && <EmptyState icon={Target} label="No topic clusters yet" />}
    </div>
  );
};

// ── Content Gaps Tab ──
const GAP_STATUSES = ['identified', 'in_progress', 'resolved'] as const;
const nextStatus = (current: string) => {
  const idx = GAP_STATUSES.indexOf(current as any);
  return GAP_STATUSES[(idx + 1) % GAP_STATUSES.length];
};

const GapsTab: React.FC = () => {
  const { data: clusters } = useClusters();
  const [filterCluster, setFilterCluster] = useState<string>('');
  const { data: gaps, isLoading, update, remove: removeGap } = useContentGaps(filterCluster || undefined);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{gaps?.length ?? 0} gaps</p>
        {clusters && clusters.length > 0 && (
          <Select value={filterCluster} onValueChange={setFilterCluster}>
            <SelectTrigger className="w-[140px] h-7 text-[10px]">
              <SelectValue placeholder="All clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All clusters</SelectItem>
              {clusters.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs">{c.cluster_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {gaps?.map(g => (
        <Card key={g.id} className="p-3 group hover:border-primary/20 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-foreground">{g.title}</h4>
              {g.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{g.description}</p>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] h-4">{g.gap_type}</Badge>
                {g.opportunity_score != null && (
                  <Badge variant="secondary" className={cn(
                    'text-[10px] h-4',
                    g.opportunity_score >= 70 ? 'bg-green-500/10 text-green-500' :
                    g.opportunity_score >= 40 ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-muted text-muted-foreground'
                  )}>
                    Score: {g.opportunity_score}
                  </Badge>
                )}
                {g.search_volume != null && (
                  <span className="text-[10px] text-muted-foreground">{g.search_volume.toLocaleString()} vol</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  'h-5 px-1.5 text-[10px] font-medium rounded-full',
                  (g.status ?? 'identified') === 'resolved' ? 'text-green-500' :
                  (g.status ?? 'identified') === 'in_progress' ? 'text-yellow-500' :
                  'text-muted-foreground'
                )}
                onClick={() => update({ id: g.id, updates: { status: nextStatus(g.status ?? 'identified') } })}
              >
                {g.status ?? 'identified'}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => removeGap(g.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {!gaps?.length && <EmptyState icon={Target} label="No content gaps found" />}
    </div>
  );
};

// ── Recommendations Tab ──
const RecsTab: React.FC = () => {
  const { data: recs, isLoading, accept, dismiss } = useRecommendations();
  const { data: gaps } = useContentGaps();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshRecs = async () => {
    if (!gaps?.length) {
      toast.error('Save some content gaps first to generate recommendations');
      return;
    }
    setRefreshing(true);
    try {
      const gapIds = gaps.map(g => g.id);
      const { error } = await supabase.functions.invoke('generate-strategy-recommendations', {
        body: JSON.stringify({ gap_ids: gapIds }),
      });
      if (error) throw error;
      toast.success('New recommendations generated');
    } catch {
      toast.error('Failed to generate recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  const getGapTitle = (gapId: string | null) => {
    if (!gapId || !gaps) return null;
    return gaps.find(g => g.id === gapId)?.title;
  };

  if (isLoading) return <LoadingState />;

  const active = recs?.filter(r => r.status !== 'dismissed' && r.status !== 'accepted') ?? [];
  const acted = recs?.filter(r => r.status === 'accepted' || r.status === 'dismissed') ?? [];

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{active.length} active recommendations</p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={handleRefreshRecs}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
          {refreshing ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      {active.map(r => (
        <Card key={r.id} className="p-3">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground">{r.title}</h4>
              {r.priority && (
                <Badge variant="outline" className={cn(
                  'text-[10px] h-4 shrink-0',
                  r.priority === 'high' ? 'border-red-500/30 text-red-500' :
                  r.priority === 'medium' ? 'border-yellow-500/30 text-yellow-500' :
                  'border-muted-foreground/30'
                )}>
                  {r.priority}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[10px] h-4">{r.recommendation_type}</Badge>
              {r.confidence_score != null && (
                <span className="text-[10px] text-muted-foreground">{Math.round(r.confidence_score * 100)}% confidence</span>
              )}
              {r.effort_estimate && (
                <span className="text-[10px] text-muted-foreground">{r.effort_estimate}</span>
              )}
            </div>
            {r.related_gap_id && getGapTitle(r.related_gap_id) && (
              <div className="flex items-center gap-1 mt-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground truncate">
                  Gap: {getGapTitle(r.related_gap_id)}
                </span>
              </div>
            )}
            <div className="flex gap-1.5 pt-1">
              <Button size="sm" className="h-6 text-xs" onClick={() => accept(r.id)}>
                <Check className="h-3 w-3 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground" onClick={() => dismiss(r.id)}>
                <X className="h-3 w-3 mr-1" /> Dismiss
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {acted.length > 0 && (
        <div className="pt-2 border-t border-border/10">
          <p className="text-[10px] text-muted-foreground mb-2">{acted.length} acted upon</p>
          {acted.map(r => (
            <div key={r.id} className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
              {r.status === 'accepted' ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3" />}
              <span className="truncate">{r.title}</span>
            </div>
          ))}
        </div>
      )}

      {!recs?.length && <EmptyState icon={Lightbulb} label="No recommendations yet — save content gaps to auto-generate" />}
    </div>
  );
};

// ── Shared UI ──
const LoadingState = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
  </div>
);

const EmptyState: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Icon className="h-8 w-8 text-muted-foreground/30 mb-2" />
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);
