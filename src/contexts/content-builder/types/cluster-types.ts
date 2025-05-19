
export interface Cluster {
  id: string;
  name: string;
  keywords: string[];
  mainKeyword: string;
  volume?: number;
  competition?: number;
}

export interface KeywordGroup {
  id: string;
  keywords: string[];
  mainKeyword: string;
  volume?: number;
  difficulty?: number;
  competition?: number;
}

export type ContentCluster = Cluster;
