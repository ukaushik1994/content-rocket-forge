
import { supabase } from '@/integrations/supabase/client';
import { TopicCluster, CreateClusterData, ClusterPerformanceMetrics, dbRowToTopicCluster } from '@/types/topicCluster';

class TopicClusterService {
  // Get all clusters for current user
  async getClusters(): Promise<TopicCluster[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('topic_clusters')
      .select('*')
      .eq('user_id', user.id)
      .order('importance_score', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error loading clusters:', error);
      return [];
    }

    return (data ?? []).map(dbRowToTopicCluster);
  }

  // Create a new cluster
  async createCluster(formData: CreateClusterData): Promise<TopicCluster> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('topic_clusters')
      .insert({
        user_id: user.id,
        cluster_name: formData.name,
        description: formData.description || null,
        importance_score: 0,
        topic_count: formData.keywords.length,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return dbRowToTopicCluster(data);
  }

  // Update an existing cluster
  async updateCluster(id: string, updates: Partial<TopicCluster>): Promise<TopicCluster | null> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.cluster_name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.completion !== undefined) dbUpdates.importance_score = updates.completion;
    if (updates.articles !== undefined) dbUpdates.topic_count = updates.articles;

    const { data, error } = await supabase
      .from('topic_clusters')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return dbRowToTopicCluster(data);
  }

  // Delete a cluster
  async deleteCluster(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('topic_clusters')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Get cluster by ID
  async getCluster(id: string): Promise<TopicCluster | null> {
    const { data, error } = await supabase
      .from('topic_clusters')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return dbRowToTopicCluster(data);
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<ClusterPerformanceMetrics> {
    const clusters = await this.getClusters();
    const totalArticles = clusters.reduce((sum, c) => sum + c.articles, 0);

    return {
      totalClusters: clusters.length,
      totalTraffic: '0',
      avgPosition: '0',
      activeArticles: totalArticles.toString(),
      monthlyGrowth: 0,
      topPerformingCluster: clusters[0]?.name || 'None',
    };
  }

  // Generate content opportunities for cluster
  generateContentOpportunities(cluster: TopicCluster): string[] {
    const opportunities = [
      `How-to guide for ${cluster.mainKeyword}`,
      `Best practices for ${cluster.mainKeyword}`,
      `Common mistakes with ${cluster.mainKeyword}`,
      `${cluster.mainKeyword} vs alternatives comparison`,
      `Complete beginner's guide to ${cluster.mainKeyword}`,
    ];

    cluster.keywords.forEach(keyword => {
      opportunities.push(`Ultimate guide to ${keyword}`);
      opportunities.push(`${keyword} tips and tricks`);
    });

    return opportunities.slice(0, 8);
  }
}

export const topicClusterService = new TopicClusterService();
