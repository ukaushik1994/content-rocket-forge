
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
  // Additional properties needed by the application
  category?: string;
  logoUrl?: string | null;
  externalUrl?: string | null;
  useCases?: string[];
  painPoints?: string[];
  targetAudience?: string[];
  resources?: Array<{ title: string; url: string }>;
  benefits?: any[];
  tags?: any[];
}

export interface SolutionIntegrationMetrics {
  matchScore: number;
  keywordUsage: number;
  contentRelevance: number;
  potentialImpact: number;
  recommendations: SolutionRecommendation[];
  suggestedLeadIn?: string;
  // Additional properties needed by the application
  overallScore: number;
  featureIncorporation: number;
  positioningScore: number;
  mentionedFeatures?: string[];
}

export interface SolutionRecommendation {
  id: string;
  type: string;
  description: string;
  applied: boolean;
  priority: 'low' | 'medium' | 'high';
}
