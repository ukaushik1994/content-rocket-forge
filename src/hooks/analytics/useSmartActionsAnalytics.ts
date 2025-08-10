import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActionLogRow {
  id: string;
  action: 'approve' | 'request_changes' | 'reject' | 'submit_for_review';
  accepted_recommendation: boolean | null;
  latency_ms: number | null;
  created_at: string;
}

export interface RecommendationRow {
  id: string;
  action: 'approve' | 'request_changes' | 'reject' | 'submit_for_review';
  confidence: number | null;
  created_at: string;
}

export interface SmartActionsAnalyticsData {
  totalActions: number;
  actionsByType: Record<string, number>;
  acceptanceRate: number; // 0..1
  avgLatencyMs: number | null;
  lastUpdated: string;
}

async function fetchActions(limit = 500): Promise<ActionLogRow[]> {
  const { data, error } = await supabase
    .from('approval_actions_log')
    .select('id, action, accepted_recommendation, latency_ms, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ActionLogRow[];
}

async function fetchRecommendations(limit = 500): Promise<RecommendationRow[]> {
  const { data, error } = await supabase
    .from('approval_recommendations')
    .select('id, action, confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as RecommendationRow[];
}

export function useSmartActionsAnalytics() {
  const actionsQuery = useQuery({
    queryKey: ['smart-actions','actions'],
    queryFn: () => fetchActions(),
  });
  const recsQuery = useQuery({
    queryKey: ['smart-actions','recommendations'],
    queryFn: () => fetchRecommendations(),
  });

  const isLoading = actionsQuery.isLoading || recsQuery.isLoading;
  const error = actionsQuery.error || recsQuery.error || null;

  let analytics: SmartActionsAnalyticsData | null = null;
  if (actionsQuery.data) {
    const rows = actionsQuery.data;
    const totalActions = rows.length;
    const actionsByType: Record<string, number> = rows.reduce((acc, r) => {
      acc[r.action] = (acc[r.action] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const acceptedCount = rows.filter(r => !!r.accepted_recommendation).length;
    const acceptanceRate = totalActions > 0 ? acceptedCount / totalActions : 0;
    const latencies = rows.map(r => r.latency_ms).filter((v): v is number => typeof v === 'number');
    const avgLatencyMs = latencies.length ? Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) : null;

    analytics = {
      totalActions,
      actionsByType,
      acceptanceRate,
      avgLatencyMs,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    isLoading,
    error: error as Error | null,
    analytics,
    actions: actionsQuery.data ?? [],
    recommendations: recsQuery.data ?? [],
    refetch: async () => { await Promise.all([actionsQuery.refetch(), recsQuery.refetch()]); },
  };
}
