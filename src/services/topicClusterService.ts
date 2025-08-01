
import { TopicCluster, CreateClusterData, ClusterPerformanceMetrics } from '@/types/topicCluster';
import { v4 as uuid } from 'uuid';

// In a real app, this would connect to your database
class TopicClusterService {
  private storageKey = 'topic_clusters';

  // Get all clusters
  getClusters(): TopicCluster[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const clusters = JSON.parse(stored);
        return Array.isArray(clusters) ? clusters : [];
      }
    } catch (error) {
      console.error('Error loading clusters:', error);
    }
    
    return [];
  }

  // Create a new cluster
  async createCluster(data: CreateClusterData): Promise<TopicCluster> {
    const cluster: TopicCluster = {
      id: uuid(),
      name: data.name,
      mainKeyword: data.mainKeyword,
      status: 'draft',
      completion: 0,
      keywords: data.keywords,
      articles: 0,
      totalTraffic: 0,
      avgPosition: 0,
      lastUpdated: 'Just created',
      color: this.getRandomGradient(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: data.description,
      targetAudience: data.targetAudience,
      contentPillars: data.contentPillars
    };

    const clusters = this.getClusters();
    clusters.push(cluster);
    this.saveClusters(clusters);
    
    return cluster;
  }

  // Update an existing cluster
  async updateCluster(id: string, updates: Partial<TopicCluster>): Promise<TopicCluster | null> {
    const clusters = this.getClusters();
    const index = clusters.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    clusters[index] = {
      ...clusters[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveClusters(clusters);
    return clusters[index];
  }

  // Delete a cluster
  async deleteCluster(id: string): Promise<boolean> {
    const clusters = this.getClusters();
    const filtered = clusters.filter(c => c.id !== id);
    
    if (filtered.length === clusters.length) return false;
    
    this.saveClusters(filtered);
    return true;
  }

  // Get cluster by ID
  getCluster(id: string): TopicCluster | null {
    const clusters = this.getClusters();
    return clusters.find(c => c.id === id) || null;
  }

  // Get performance metrics
  getPerformanceMetrics(): ClusterPerformanceMetrics {
    const clusters = this.getClusters();
    const activeArticles = clusters.reduce((sum, c) => sum + c.articles, 0);
    const totalTraffic = clusters.reduce((sum, c) => sum + c.totalTraffic, 0);
    const avgPosition = clusters.length > 0 
      ? clusters.reduce((sum, c) => sum + c.avgPosition, 0) / clusters.length 
      : 0;
    
    const topPerformer = clusters.reduce((top, current) => 
      current.totalTraffic > (top?.totalTraffic || 0) ? current : top, 
      clusters[0]
    );

    return {
      totalClusters: clusters.length,
      totalTraffic: this.formatNumber(totalTraffic),
      avgPosition: avgPosition > 0 ? avgPosition.toFixed(1) : '0',
      activeArticles: activeArticles.toString(),
      monthlyGrowth: 0,
      topPerformingCluster: topPerformer?.name || 'None'
    };
  }

  // Add SERP data to cluster
  async addSerpDataToCluster(clusterId: string, serpData: any): Promise<boolean> {
    const cluster = this.getCluster(clusterId);
    if (!cluster) return false;

    await this.updateCluster(clusterId, {
      serpData,
      lastUpdated: 'Just now'
    });
    
    return true;
  }

  // Generate content opportunities for cluster
  generateContentOpportunities(cluster: TopicCluster): string[] {
    const opportunities = [
      `How-to guide for ${cluster.mainKeyword}`,
      `Best practices for ${cluster.mainKeyword}`,
      `Common mistakes with ${cluster.mainKeyword}`,
      `${cluster.mainKeyword} vs alternatives comparison`,
      `Complete beginner's guide to ${cluster.mainKeyword}`
    ];

    // Add keyword-based opportunities
    cluster.keywords.forEach(keyword => {
      opportunities.push(`Ultimate guide to ${keyword}`);
      opportunities.push(`${keyword} tips and tricks`);
    });

    return opportunities.slice(0, 8); // Return top 8 opportunities
  }

  // Clear all data (useful for development/testing)
  clearAllClusters(): void {
    localStorage.removeItem(this.storageKey);
  }

  private saveClusters(clusters: TopicCluster[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(clusters));
    } catch (error) {
      console.error('Error saving clusters:', error);
    }
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }

  private getRandomGradient(): string {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600", 
      "from-pink-500 to-rose-600",
      "from-orange-500 to-red-600",
      "from-purple-500 to-indigo-600",
      "from-teal-500 to-cyan-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-green-600"
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }
}

export const topicClusterService = new TopicClusterService();
