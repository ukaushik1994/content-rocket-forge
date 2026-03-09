import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as svc from '@/services/researchIntelligenceService';
import type { Database } from '@/integrations/supabase/types';

type TopicClusterInsert = Database['public']['Tables']['topic_clusters']['Insert'];
type ContentGapInsert = Database['public']['Tables']['content_gaps']['Insert'];

export const useClusters = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const query = useQuery({
    queryKey: ['topic_clusters', uid],
    queryFn: () => svc.fetchTopicClusters(uid!),
    enabled: !!uid,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<TopicClusterInsert, 'user_id'>) =>
      svc.createTopicCluster({ ...data, user_id: uid! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topic_clusters', uid] }),
  });

  const deleteMutation = useMutation({
    mutationFn: svc.deleteTopicCluster,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topic_clusters', uid] }),
  });

  return { ...query, create: createMutation.mutateAsync, remove: deleteMutation.mutateAsync };
};

export const useContentGaps = (clusterId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const query = useQuery({
    queryKey: ['content_gaps', uid, clusterId],
    queryFn: () => svc.fetchContentGaps(uid!, clusterId),
    enabled: !!uid,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<ContentGapInsert, 'user_id'>) =>
      svc.createContentGap({ ...data, user_id: uid! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content_gaps'] }),
  });

  return { ...query, create: createMutation.mutateAsync };
};

export const useRecommendations = (status?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const query = useQuery({
    queryKey: ['strategy_recommendations', uid, status],
    queryFn: () => svc.fetchStrategyRecommendations(uid!, status),
    enabled: !!uid,
  });

  const acceptMutation = useMutation({
    mutationFn: svc.acceptRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategy_recommendations'] }),
  });

  const dismissMutation = useMutation({
    mutationFn: svc.dismissRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategy_recommendations'] }),
  });

  return { ...query, accept: acceptMutation.mutateAsync, dismiss: dismissMutation.mutateAsync };
};
