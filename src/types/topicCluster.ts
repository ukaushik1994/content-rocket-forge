
export interface TopicCluster {
  id: string;
  name: string;
  mainKeyword: string;
  status: 'active' | 'draft' | 'archived';
  completion: number;
  keywords: string[];
  articles: number;
  totalTraffic: number;
  avgPosition: number;
  lastUpdated: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  targetAudience?: string;
  contentPillars?: string[];
  serpData?: any;
}

/** Maps a DB topic_clusters row to the legacy TopicCluster shape used by UI cards */
export function dbRowToTopicCluster(row: {
  id: string;
  cluster_name: string;
  description?: string | null;
  importance_score?: number | null;
  topic_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}): TopicCluster {
  return {
    id: row.id,
    name: row.cluster_name,
    mainKeyword: row.cluster_name,
    status: 'active',
    completion: row.importance_score ?? 0,
    keywords: [],
    articles: row.topic_count ?? 0,
    totalTraffic: 0,
    avgPosition: 0,
    lastUpdated: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    color: '#6366f1',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    description: row.description ?? undefined,
  };
}

export interface CreateClusterData {
  name: string;
  mainKeyword: string;
  description?: string;
  targetAudience?: string;
  keywords: string[];
  contentPillars?: string[];
}

export interface ClusterPerformanceMetrics {
  totalClusters: number;
  totalTraffic: string;
  avgPosition: string;
  activeArticles: string;
  monthlyGrowth: number;
  topPerformingCluster: string;
}
