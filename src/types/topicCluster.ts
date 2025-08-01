
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
