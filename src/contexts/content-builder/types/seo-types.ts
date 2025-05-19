
export interface SeoImprovement {
  id: string;
  type: string;
  description: string;
  recommendation: string;
  score: number;
  applied: boolean;
  impact?: 'high' | 'medium' | 'low'; // Add impact field to fix useContentRewriter.ts error
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
  ctaEffectiveness?: number; // Add ctaEffectiveness field to fix useSolutionAnalysis.ts error
}
