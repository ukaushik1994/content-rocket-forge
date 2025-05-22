
export interface OptimizationSuggestion {
  id: string;
  type: 'content' | 'solution';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ContentAnalysisResult {
  suggestions: OptimizationSuggestion[];
}

export interface SolutionAnalysisResult {
  suggestions: OptimizationSuggestion[];
}
