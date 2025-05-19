
import { ContentCluster } from './content-types';

// Define the KeywordGroup for clusters and keyword organization
export interface KeywordGroup {
  id: string;
  name: string;
  keywords: string[];
}

// Define Cluster with extra data like search volume and competition
export interface Cluster extends KeywordGroup {
  mainKeyword: string;
  volume?: number;
  competition?: number;
}

// Re-export ContentCluster to avoid duplication, using 'export type' syntax
export type { ContentCluster };
