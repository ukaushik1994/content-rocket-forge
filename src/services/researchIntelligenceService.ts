import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TopicClusterRow = Database['public']['Tables']['topic_clusters']['Row'];
type TopicClusterInsert = Database['public']['Tables']['topic_clusters']['Insert'];
type ContentGapRow = Database['public']['Tables']['content_gaps']['Row'];
type ContentGapInsert = Database['public']['Tables']['content_gaps']['Insert'];
type StrategyRecommendationRow = Database['public']['Tables']['strategy_recommendations']['Row'];

// ── Topic Clusters ──

export const fetchTopicClusters = async (userId: string): Promise<TopicClusterRow[]> => {
  const { data, error } = await supabase
    .from('topic_clusters')
    .select('*')
    .eq('user_id', userId)
    .order('importance_score', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
};

export const createTopicCluster = async (cluster: TopicClusterInsert): Promise<TopicClusterRow> => {
  const { data, error } = await supabase
    .from('topic_clusters')
    .insert(cluster)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTopicCluster = async (id: string, updates: Partial<TopicClusterInsert>): Promise<TopicClusterRow> => {
  const { data, error } = await supabase
    .from('topic_clusters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTopicCluster = async (id: string): Promise<void> => {
  const { error } = await supabase.from('topic_clusters').delete().eq('id', id);
  if (error) throw error;
};

// ── Content Gaps ──

export const fetchContentGaps = async (userId: string, clusterId?: string): Promise<ContentGapRow[]> => {
  let query = supabase
    .from('content_gaps')
    .select('*')
    .eq('user_id', userId)
    .order('opportunity_score', { ascending: false, nullsFirst: false });
  if (clusterId) query = query.eq('target_cluster_id', clusterId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

export const createContentGap = async (gap: ContentGapInsert): Promise<ContentGapRow> => {
  const { data, error } = await supabase
    .from('content_gaps')
    .insert(gap)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateContentGap = async (id: string, updates: Partial<ContentGapInsert>): Promise<ContentGapRow> => {
  const { data, error } = await supabase
    .from('content_gaps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteContentGap = async (id: string): Promise<void> => {
  const { error } = await supabase.from('content_gaps').delete().eq('id', id);
  if (error) throw error;
};

// ── Strategy Recommendations ──

export const fetchStrategyRecommendations = async (userId: string, status?: string): Promise<StrategyRecommendationRow[]> => {
  let query = supabase
    .from('strategy_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('confidence_score', { ascending: false, nullsFirst: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

export const acceptRecommendation = async (id: string): Promise<StrategyRecommendationRow> => {
  const { data, error } = await supabase
    .from('strategy_recommendations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const dismissRecommendation = async (id: string): Promise<StrategyRecommendationRow> => {
  const { data, error } = await supabase
    .from('strategy_recommendations')
    .update({ status: 'dismissed' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
