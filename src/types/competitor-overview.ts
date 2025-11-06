export interface CompetitorOverview {
  executiveSummary: string;
  keyMetrics: {
    marketPositionScore: number;
    innovationScore: number;
    threatLevel: number;
    pricingCompetitiveness: number;
  };
  competitivePositioning: string;
  topInsights: Array<{
    category: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'insight';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendedActions: string[];
  marketContext: string;
}

export interface OverviewDiagnostics {
  processing_time_ms: number;
  ai_calls: number;
  insights_count: number;
  actions_count: number;
}

export interface OverviewResponse {
  success: boolean;
  overview?: CompetitorOverview;
  diagnostics?: OverviewDiagnostics;
  error?: string;
}
