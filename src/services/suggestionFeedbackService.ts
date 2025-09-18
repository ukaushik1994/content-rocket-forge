import { supabase } from '@/integrations/supabase/client';

export interface SuggestionFeedback {
  id?: string;
  user_id: string;
  check_title: string;
  suggestion_text: string;
  helpful: boolean;
  created_at?: string;
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  helpfulCount: number;
  unhelpfulCount: number;
  helpfulnessRate: number;
  topIssues: Array<{
    checkTitle: string;
    count: number;
    helpfulnessRate: number;
  }>;
  improvementAreas: string[];
}

class SuggestionFeedbackService {
  /**
   * Save user feedback on AI suggestions using existing feedback table
   */
  async saveFeedback(feedback: Omit<SuggestionFeedback, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: feedback.user_id,
          message: `${feedback.check_title}: ${feedback.suggestion_text}`,
          sentiment: feedback.helpful ? 'positive' : 'negative',
          type: 'suggestion',
          status: 'unread'
        });

      if (error) {
        console.error('Error saving suggestion feedback:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error saving feedback:', error);
      return false;
    }
  }

  /**
   * Get feedback analytics for improving suggestions
   */
  async getFeedbackAnalytics(userId?: string): Promise<FeedbackAnalytics> {
    try {
      let query = supabase
        .from('feedback')
        .select('*')
        .eq('type', 'suggestion');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching feedback analytics:', error);
        return this.getEmptyAnalytics();
      }

      return this.analyzeFeedback(data || []);
    } catch (error) {
      console.error('Unexpected error fetching analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get suggestions for improvement based on feedback patterns
   */
  async getImprovementSuggestions(checkTitle: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('type', 'suggestion')
        .eq('sentiment', 'negative')
        .ilike('message', `%${checkTitle}%`);

      if (error || !data) {
        return [];
      }

      // Analyze unhelpful feedback to generate improvement suggestions
      const improvements = new Set<string>();

      if (data.length > 5) {
        improvements.add('Consider providing more specific, actionable steps');
      }

      if (data.length > 10) {
        improvements.add('Review and update suggestion templates for this check type');
      }

      const recentUnhelpful = data.filter(
        item => new Date(item.created_at!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );

      if (recentUnhelpful.length > 3) {
        improvements.add('Recent feedback suggests suggestions need immediate revision');
      }

      return Array.from(improvements);
    } catch (error) {
      console.error('Error generating improvement suggestions:', error);
      return [];
    }
  }

  private analyzeFeedback(feedbackData: any[]): FeedbackAnalytics {
    const totalFeedback = feedbackData.length;
    const helpfulCount = feedbackData.filter(f => f.sentiment === 'positive').length;
    const unhelpfulCount = totalFeedback - helpfulCount;
    const helpfulnessRate = totalFeedback > 0 ? (helpfulCount / totalFeedback) * 100 : 0;

    // Extract check titles from messages (format: "CheckTitle: SuggestionText")
    const issueGroups = feedbackData.reduce((acc, feedback) => {
      const checkTitle = feedback.message?.split(':')[0] || 'Unknown';
      if (!acc[checkTitle]) {
        acc[checkTitle] = [];
      }
      acc[checkTitle].push(feedback);
      return acc;
    }, {} as Record<string, any[]>);

    const topIssues = (Object.entries(issueGroups) as [string, any[]][])
      .map(([checkTitle, items]) => ({
        checkTitle,
        count: items.length,
        helpfulnessRate: items.length > 0 ? (items.filter(i => i.sentiment === 'positive').length / items.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Identify improvement areas
    const improvementAreas = topIssues
      .filter(issue => issue.helpfulnessRate < 60)
      .map(issue => issue.checkTitle);

    return {
      totalFeedback,
      helpfulCount,
      unhelpfulCount,
      helpfulnessRate,
      topIssues,
      improvementAreas
    };
  }

  private getEmptyAnalytics(): FeedbackAnalytics {
    return {
      totalFeedback: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulnessRate: 0,
      topIssues: [],
      improvementAreas: []
    };
  }
}

export const suggestionFeedbackService = new SuggestionFeedbackService();