
/**
 * Cluster type definitions
 */

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
}

export interface TopicCluster {
  id: string;
  name: string;
  mainKeyword: string;
  keywords: string[];
  searchVolume: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  competition: number;
  opportunity: number;
  pillarContent?: string;
  contentIdeas: string[];
  subTopics: Array<{
    title: string;
    searchVolume: number;
    difficulty: string;
    contentGap: boolean;
  }>;
  serpData?: any;
  createdAt: Date;
  status: 'draft' | 'analyzing' | 'ready' | 'published';
}
