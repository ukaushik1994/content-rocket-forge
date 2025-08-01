
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
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading clusters:', error);
    }
    
    // Return mock data if no stored data
    return this.getMockClusters();
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
      avgPosition: avgPosition.toFixed(1),
      activeArticles: activeArticles.toString(),
      monthlyGrowth: 12.5, // Mock growth percentage
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

  private getMockClusters(): TopicCluster[] {
    return [
      {
        id: '1',
        name: "Content Marketing Strategy",
        mainKeyword: "content marketing",
        status: "active",
        completion: 75,
        keywords: ["content strategy", "content creation", "content calendar", "content distribution"],
        articles: 12,
        totalTraffic: 45000,
        avgPosition: 5.2,
        lastUpdated: "2 days ago",
        color: "from-blue-500 to-purple-600",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Comprehensive content marketing strategy cluster",
        targetAudience: "Marketing professionals and business owners"
      },
      {
        id: '2',
        name: "SEO Optimization",
        mainKeyword: "SEO optimization",
        status: "active", 
        completion: 90,
        keywords: ["on-page SEO", "technical SEO", "link building", "keyword research"],
        articles: 18,
        totalTraffic: 67000,
        avgPosition: 3.8,
        lastUpdated: "1 day ago",
        color: "from-green-500 to-teal-600",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Complete SEO optimization guide cluster",
        targetAudience: "SEO specialists and digital marketers"
      },
      {
        id: '3',
        name: "Social Media Marketing",
        mainKeyword: "social media marketing",
        status: "draft",
        completion: 30,
        keywords: ["social media strategy", "social media ads", "content scheduling"],
        articles: 6,
        totalTraffic: 23000,
        avgPosition: 8.1,
        lastUpdated: "3 days ago",
        color: "from-pink-500 to-rose-600",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Social media marketing strategies and tactics",
        targetAudience: "Social media managers and content creators"
      }
    ];
  }
}

export const topicClusterService = new TopicClusterService();
