import { supabase } from '@/integrations/supabase/client';
import { OptimizationSuggestion } from '@/components/content-builder/final-review/optimization/types';
import { QualityCheckSuggestion } from '@/components/content-builder/final-review/optimization/hooks/useContentQualityIntegration';

export interface OptimizationSettings {
  tone: 'professional' | 'casual' | 'technical' | 'friendly' | 'authoritative';
  audience: 'beginner' | 'intermediate' | 'expert' | 'general';
  seoFocus: 'light' | 'moderate' | 'aggressive';
  contentLength: 'shorter' | 'maintain' | 'longer';
  creativity: number;
  preserveStructure: boolean;
  includeExamples: boolean;
  enhanceReadability: boolean;
  customInstructions: string;
}

export type SuggestionForLogging = OptimizationSuggestion | QualityCheckSuggestion;

export interface OptimizationLog {
  id: string;
  sessionId: string;
  originalContentLength: number;
  optimizedContentLength?: number;
  suggestionsAnalyzed: SuggestionForLogging[];
  suggestionsApplied: SuggestionForLogging[];
  suggestionsRejected: SuggestionForLogging[];
  reasoning: Record<string, string>;
  success: boolean;
  optimizationSettings: OptimizationSettings;
  performanceMetrics?: Record<string, any>;
  feedbackScore?: number;
  userFeedback?: string;
  createdAt: string;
}

/**
 * Generate detailed reasoning for each optimization suggestion
 */
export function generateOptimizationReasoning(
  suggestions: SuggestionForLogging[],
  content: string,
  settings: OptimizationSettings
): Record<string, string> {
  const reasoning: Record<string, string> = {};

  suggestions.forEach(suggestion => {
    let reason = '';
    
    // Handle different suggestion types using type assertion
    if (suggestion.type === 'content' || suggestion.type === 'humanization' || 
        suggestion.type === 'serp_integration' || suggestion.type === 'solution') {
      const optSuggestion = suggestion as OptimizationSuggestion;
      switch (optSuggestion.type) {
        case 'content':
          reason = `Content optimization needed: ${optSuggestion.description}. This will improve readability and engagement based on the ${settings.tone} tone and ${settings.audience} audience settings.`;
          break;
        case 'humanization':
          reason = `AI content detected: ${optSuggestion.description}. Humanizing this content will make it sound more natural and authentic.`;
          break;
        case 'serp_integration':
          reason = `SERP data integration opportunity: ${optSuggestion.description}. This will help incorporate valuable competitor insights and improve search visibility.`;
          break;
        case 'solution':
          reason = `Solution positioning improvement: ${optSuggestion.description}. Better integration will enhance the value proposition and conversion potential.`;
          break;
      }
    } else if (suggestion.type === 'critical' || suggestion.type === 'major' || suggestion.type === 'minor') {
      const qualSuggestion = suggestion as QualityCheckSuggestion;
      reason = `Quality check (${qualSuggestion.type} priority): ${qualSuggestion.description}. This addresses a ${qualSuggestion.checklistItem || 'content quality'} issue.`;
    } else {
      reason = `Quality improvement needed: ${suggestion.description}. Applying this suggestion will enhance overall content quality.`;
    }
    
    reasoning[suggestion.id] = reason;
  });

  return reasoning;
}

/**
 * Log optimization activity to the database
 */
export async function logOptimizationActivity(
  contentId: string | null,
  sessionId: string,
  originalContentLength: number,
  suggestionsAnalyzed: SuggestionForLogging[],
  suggestionsApplied: SuggestionForLogging[] = [],
  suggestionsRejected: SuggestionForLogging[] = [],
  reasoning: Record<string, string> = {},
  settings: OptimizationSettings,
  success: boolean = false,
  optimizedContentLength?: number,
  performanceMetrics?: Record<string, any>
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('log_optimization_activity', {
      p_user_id: user.user.id,
      p_content_id: contentId,
      p_session_id: sessionId,
      p_original_length: originalContentLength,
      p_optimized_length: optimizedContentLength,
      p_suggestions_analyzed: JSON.stringify(suggestionsAnalyzed),
      p_suggestions_applied: JSON.stringify(suggestionsApplied),
      p_suggestions_rejected: JSON.stringify(suggestionsRejected),
      p_reasoning: reasoning,
      p_success: success,
      p_optimization_settings: settings as any,
      p_performance_metrics: performanceMetrics || {}
    });

    if (error) {
      console.error('Failed to log optimization activity:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error logging optimization activity:', error);
    return null;
  }
}

/**
 * Update optimization feedback after user interaction
 */
export async function updateOptimizationFeedback(
  logId: string,
  feedbackScore: number,
  userFeedback: string,
  optimizationResults?: Record<string, any>
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('update_optimization_feedback', {
      p_log_id: logId,
      p_feedback_score: feedbackScore,
      p_user_feedback: userFeedback,
      p_optimization_results: optimizationResults
    });

    if (error) {
      console.error('Failed to update optimization feedback:', error);
      return false;
    }

    return data || true;
  } catch (error) {
    console.error('Error updating optimization feedback:', error);
    return false;
  }
}

/**
 * Get optimization history for analysis and learning
 */
export async function getOptimizationHistory(
  limit: number = 100
): Promise<OptimizationLog[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('content_optimization_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch optimization history:', error);
      return [];
    }

    return data?.map(log => ({
      id: log.id,
      sessionId: log.session_id,
      originalContentLength: log.original_content_length,
      optimizedContentLength: log.optimized_content_length,
      suggestionsAnalyzed: JSON.parse(typeof log.suggestions_analyzed === 'string' ? log.suggestions_analyzed : '[]') as SuggestionForLogging[],
      suggestionsApplied: JSON.parse(typeof log.suggestions_applied === 'string' ? log.suggestions_applied : '[]') as SuggestionForLogging[],
      suggestionsRejected: JSON.parse(typeof log.suggestions_rejected === 'string' ? log.suggestions_rejected : '[]') as SuggestionForLogging[],
      reasoning: (typeof log.reasoning === 'object' ? log.reasoning : {}) as Record<string, string>,
      success: log.success,
      optimizationSettings: (typeof log.optimization_settings === 'object' && log.optimization_settings !== null ? log.optimization_settings : {}) as unknown as OptimizationSettings,
      performanceMetrics: (typeof log.performance_metrics === 'object' ? log.performance_metrics : {}) as Record<string, any>,
      feedbackScore: log.feedback_score,
      userFeedback: log.user_feedback,
      createdAt: log.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching optimization history:', error);
    return [];
  }
}

/**
 * Generate a unique session ID for optimization tracking
 */
export function generateOptimizationSessionId(): string {
  return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}