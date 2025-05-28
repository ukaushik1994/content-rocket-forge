
export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'solution' | 'humanization' | 'serp_integration';
  priority: 'high' | 'medium' | 'low';
  autoFixable?: boolean;
  impact?: 'high' | 'medium' | 'low';
  effort?: 'high' | 'medium' | 'low';
}

export interface ContentOptimizationResult {
  optimizedContent: string;
  appliedSuggestions: string[];
  improvements: {
    readability?: number;
    seoScore?: number;
    engagement?: number;
  };
}

export interface SolutionIntegrationAnalysis {
  mentions: number;
  contextualRelevance: number;
  naturalIntegration: number;
  callToActionPresence: boolean;
  improvementAreas: string[];
}
