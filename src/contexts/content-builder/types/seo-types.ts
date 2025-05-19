
export interface SeoImprovement {
  id: string;
  type: string;
  description: string;
  recommendation: string;
  score: number;
  applied: boolean;
}

export interface SolutionIntegrationMetrics {
  featureIncorporation: number;
  positioningScore: number;
  valuePropositionClarity?: number;
  relevanceScore?: number;
  integrationLevel?: 'poor' | 'basic' | 'good' | 'excellent';
  overallScore: number;
  mentionedFeatures: string[];
  painPointsAddressed?: string[];
}
