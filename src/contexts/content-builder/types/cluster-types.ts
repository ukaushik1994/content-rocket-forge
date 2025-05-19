
export interface Cluster {
  id: string;
  name: string;
  keywords: string[];
  mainKeyword: string;
  volume?: number;
  competition?: number;
}

export interface KeywordGroup {
  mainKeyword: string;
  relatedKeywords: string[];
  volume?: number;
  competition?: number;
}

export interface ContentCluster {
  id: string;
  name: string;
  keywords: string[];
  mainKeyword?: string; // Make mainKeyword optional for compatibility
  volume?: number;
  competition?: number;
}
