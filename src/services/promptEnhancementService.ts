import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';
import { PromptTemplate } from '@/services/userPreferencesService';

export interface FeedbackData {
  id: string;
  content_id: string;
  action: string;
  notes: string | null;
  created_at: string;
  from_status: string | null;
  to_status: string | null;
  user_id: string;
}

export interface EnhancementResult {
  success: boolean;
  enhancedTemplate?: string;
  suggestions?: string[];
  feedbackAnalysis?: string;
  error?: string;
}

/**
 * Get recent approval feedback from the last N days
 */
export async function getRecentApprovalFeedback(days: number = 30): Promise<FeedbackData[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('approval_history')
      .select(`
        id,
        content_id,
        action,
        notes,
        created_at,
        from_status,
        to_status,
        user_id,
        content_items!inner(user_id)
      `)
      .eq('content_items.user_id', user.id)
      .gte('created_at', cutoffDate.toISOString())
      .not('notes', 'is', null)
      .neq('notes', 'Status changed via approval workflow')
      .neq('notes', '')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching approval feedback:', error);
    return [];
  }
}

/**
 * Filter feedback by content format type (if possible to determine)
 */
export function filterFeedbackByFormat(feedback: FeedbackData[], formatType?: string): FeedbackData[] {
  // For now, return all feedback since we don't have format type in approval_history
  // In the future, we could join with content_items to get the format type
  return feedback;
}

/**
 * Aggregate and analyze feedback patterns
 */
export function analyzeFeedbackPatterns(feedback: FeedbackData[]): {
  commonIssues: string[];
  feedbackSummary: string;
  totalFeedbackCount: number;
} {
  if (feedback.length === 0) {
    return {
      commonIssues: [],
      feedbackSummary: 'No recent feedback available.',
      totalFeedbackCount: 0
    };
  }

  // Extract all feedback notes
  const notes = feedback
    .map(f => f.notes)
    .filter((note): note is string => note !== null && note.trim() !== '');

  // Create a summary of feedback
  const feedbackSummary = notes.length > 0 
    ? `Recent feedback from ${feedback.length} reviews:\n${notes.slice(0, 10).join('\n\n')}`
    : 'No meaningful feedback found.';

  // For now, return basic analysis. Could be enhanced with NLP in the future
  const commonIssues = [
    'Content quality concerns',
    'Structure and formatting issues', 
    'Tone and voice adjustments',
    'SEO optimization needs'
  ];

  return {
    commonIssues,
    feedbackSummary,
    totalFeedbackCount: feedback.length
  };
}

/**
 * Use AI to enhance a prompt template based on recent feedback
 */
export async function enhancePromptWithFeedback(
  currentTemplate: PromptTemplate,
  days: number = 30
): Promise<EnhancementResult> {
  try {
    // Get recent feedback
    const allFeedback = await getRecentApprovalFeedback(days);
    const relevantFeedback = filterFeedbackByFormat(allFeedback, currentTemplate.formatType);
    
    if (relevantFeedback.length === 0) {
      return {
        success: false,
        error: 'No recent feedback found to analyze. Create some content and get feedback first.'
      };
    }

    // Analyze feedback patterns
    const analysis = analyzeFeedbackPatterns(relevantFeedback);
    
    // Construct AI prompt for enhancement
    const systemPrompt = `You are an expert prompt engineering specialist. Your task is to improve content generation prompts based on user feedback.

TASK: Analyze the provided feedback and enhance the given prompt template to address common issues and improve content quality.

GUIDELINES:
- Keep the original template structure and placeholder format ({topic}, {content}, {keyword})
- Address specific issues mentioned in the feedback
- Improve clarity and specificity of instructions
- Maintain the content format requirements
- Add relevant quality guidelines based on feedback patterns
- Return ONLY the improved prompt template, no additional commentary`;

    const userPrompt = `CURRENT PROMPT TEMPLATE:
${currentTemplate.promptTemplate}

RECENT USER FEEDBACK (${analysis.totalFeedbackCount} reviews):
${analysis.feedbackSummary}

COMMON ISSUES IDENTIFIED:
${analysis.commonIssues.join('\n')}

Please provide an enhanced version of this prompt template that addresses the feedback and common issues while maintaining the original structure and placeholders.`;

    // Use AI service to generate enhanced template
    const result = await AIServiceController.generate(
      'strategy',
      systemPrompt,
      userPrompt,
      { temperature: 0.3, maxTokens: 1000 }
    );

    if (!result || !result.content) {
      return {
        success: false,
        error: 'Failed to generate enhanced template. AI service unavailable.'
      };
    }

    return {
      success: true,
      enhancedTemplate: result.content.trim(),
      suggestions: analysis.commonIssues,
      feedbackAnalysis: `Analyzed ${analysis.totalFeedbackCount} feedback entries from the last ${days} days`
    };

  } catch (error: any) {
    console.error('Error enhancing prompt with feedback:', error);
    return {
      success: false,
      error: error.message || 'Failed to enhance prompt template'
    };
  }
}

/**
 * Preview enhancement without applying changes
 */
export async function previewPromptEnhancement(
  currentTemplate: PromptTemplate,
  days: number = 30
): Promise<EnhancementResult> {
  // Same as enhancePromptWithFeedback but doesn't save
  return await enhancePromptWithFeedback(currentTemplate, days);
}