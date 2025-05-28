
export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'solution' | 'humanization' | 'serp_integration';
  priority: 'high' | 'medium' | 'low';
  autoFixable?: boolean;
  impact?: 'high' | 'medium' | 'low';
  effort?: 'high' | 'medium' | 'low';
  category: 'structure' | 'seo' | 'keywords' | 'solution' | 'content';
}

// Unified suggestion type that works for both optimization and quality checks
export interface UnifiedSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'major' | 'minor' | 'content' | 'solution' | 'humanization' | 'serp_integration';
  priority: 'high' | 'medium' | 'low' | number;
  autoFixable?: boolean;
  impact?: 'high' | 'medium' | 'low';
  effort?: 'high' | 'medium' | 'low';
  category: 'structure' | 'seo' | 'keywords' | 'solution' | 'content';
  checklistItem?: string;
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
