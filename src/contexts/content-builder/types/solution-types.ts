
export interface Solution {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
  url?: string;
  apiKey?: string;
  isConnected: boolean;
  features?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface SolutionIntegrationMetrics {
  matchScore: number;
  keywordUsage: number;
  contentRelevance: number;
  potentialImpact: number;
  recommendations: SolutionRecommendation[];
  suggestedLeadIn?: string;
}

export interface SolutionRecommendation {
  id: string;
  type: string;
  description: string;
  applied: boolean;
  priority: 'low' | 'medium' | 'high';
}
