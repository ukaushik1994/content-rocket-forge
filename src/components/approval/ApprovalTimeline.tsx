import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, Clock, Zap } from 'lucide-react';

type SmartAction = 'approve' | 'request_changes' | 'reject' | 'submit_for_review';

interface ActionRow {
  id: string;
  action: SmartAction;
  source: 'user' | 'ai';
  accepted_recommendation: boolean;
  created_at: string;
}

interface RecRow {
  id: string;
  action: SmartAction;
  confidence: number | null;
  model: string | null;
  reasoning: string | null;
  created_at: string;
}

interface ApprovalTimelineProps {
  contentId: string;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ contentId }) => {
  const { data: actions } = useQuery({
    queryKey: ['approval-actions', contentId],
    queryFn: async (): Promise<ActionRow[]> => {
      const { data, error } = await supabase
        .from('approval_actions_log')
        .select('id, action, source, accepted_recommendation, created_at')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ActionRow[];
    },
  });

  const { data: recs } = useQuery({
    queryKey: ['approval-recs', contentId],
    queryFn: async (): Promise<RecRow[]> => {
      const { data, error } = await supabase
        .from('approval_recommendations')
        .select('id, action, confidence, model, reasoning, created_at')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RecRow[];
    },
  });

  const items = React.useMemo(() => {
    const a = (actions ?? []).map((r) => ({
      id: `a-${r.id}`,
      type: 'action' as const,
      created_at: r.created_at,
      title: r.action.replace('_', ' '),
      meta: r.source === 'ai' ? 'AI' : 'User',
      badge: r.accepted_recommendation ? 'Accepted rec' : undefined,
    }));
    const b = (recs ?? []).map((r) => ({
      id: `r-${r.id}`,
      type: 'rec' as const,
      created_at: r.created_at,
      title: `AI suggests ${r.action.replace('_', ' ')}`,
      meta: r.model ?? 'heuristic-v1',
      badge: r.confidence != null ? `${r.confidence}%` : undefined,
      reasoning: r.reasoning ?? undefined,
    }));
    return [...a, ...b].sort((x, y) => (new Date(y.created_at).getTime() - new Date(x.created_at).getTime()));
  }, [actions, recs]);

  if (!items.length) {
    return (
      <Card className="bg-card/60 border-border animate-fade-in">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Approval Timeline</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">No timeline entries found.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 border-border animate-fade-in">
      <CardHeader className="pb-2"><CardTitle className="text-sm">Approval Timeline</CardTitle></CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {it.type === 'action' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Brain className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{it.title}</span>
                  {it.badge && <Badge variant="secondary" className="text-xs">{it.badge}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(it.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {it.meta}
                  </span>
                </div>
                {it.type === 'rec' && it.reasoning && (
                  <p className="text-xs text-muted-foreground mt-1">{it.reasoning}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
