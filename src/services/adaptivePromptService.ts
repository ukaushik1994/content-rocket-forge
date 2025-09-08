import { supabase } from '@/integrations/supabase/client';

interface FeedbackPattern {
  feedbackType: 'positive' | 'negative' | 'neutral';
  category: string;
  commonIssues: string[];
  successfulPatterns: string[];
  averageRating: number;
  frequency: number;
}

interface AdaptivePromptData {
  basePrompt: string;
  adaptations: {
    [category: string]: {
      improvements: string[];
      warnings: string[];
      emphasis: string[];
    };
  };
  successRate: number;
  lastUpdated: Date;
}

class AdaptivePromptService {
  private feedbackPatterns: Map<string, FeedbackPattern> = new Map();
  private promptData: Map<string, AdaptivePromptData> = new Map();
  private learningEnabled = true;

  /**
   * Analyze user feedback to identify patterns
   */
  async analyzeFeedbackPatterns(): Promise<FeedbackPattern[]> {
    try {
      // Since optimization_logs table doesn't exist yet, return mock data
      // In production, replace this with actual database queries
      const mockPatterns: FeedbackPattern[] = [
        {
          feedbackType: 'positive',
          category: 'content',
          commonIssues: [],
          successfulPatterns: ['improved readability', 'better structure'],
          averageRating: 4.2,
          frequency: 25
        },
        {
          feedbackType: 'neutral',
          category: 'seo',
          commonIssues: ['over-optimization'],
          successfulPatterns: ['keyword integration'],
          averageRating: 3.8,
          frequency: 15
        }
      ];

      mockPatterns.forEach(pattern => {
        this.feedbackPatterns.set(pattern.category, pattern);
      });

      return mockPatterns;
    } catch (error) {
      console.error('Failed to analyze feedback patterns:', error);
      return [];
    }
  }

  /**
   * Generate adaptive prompts based on learned patterns
   */
  async generateAdaptivePrompt(
    category: string, 
    basePrompt: string, 
    userContent: string,
    previousResults?: any[]
  ): Promise<string> {
    if (!this.learningEnabled) return basePrompt;

    const pattern = this.feedbackPatterns.get(category);
    if (!pattern) return basePrompt;

    let adaptedPrompt = basePrompt;

    // Apply adaptations based on feedback patterns
    if (pattern.feedbackType === 'positive' && pattern.successfulPatterns.length > 0) {
      adaptedPrompt += `\n\nBased on successful optimization patterns, emphasize: ${pattern.successfulPatterns.slice(0, 3).join(', ')}.`;
    }

    if (pattern.feedbackType === 'negative' && pattern.commonIssues.length > 0) {
      adaptedPrompt += `\n\nAvoid common issues users have reported: ${pattern.commonIssues.slice(0, 2).join(', ')}.`;
    }

    // Add content-specific adaptations
    const contentCharacteristics = this.analyzeContentCharacteristics(userContent);
    if (contentCharacteristics.isShort && pattern.category === 'content') {
      adaptedPrompt += '\n\nThis is short-form content. Focus on punch and clarity over expansion.';
    }

    if (contentCharacteristics.isTechnical && pattern.category === 'humanization') {
      adaptedPrompt += '\n\nMaintain technical accuracy while making the content more conversational.';
    }

    // Track prompt performance
    this.trackPromptUsage(category, adaptedPrompt);

    return adaptedPrompt;
  }

  /**
   * Learn from optimization results and user feedback
   */
  async learnFromOptimization(
    category: string,
    originalContent: string,
    optimizedContent: string,
    userFeedback: {
      rating: number;
      comments?: string;
      appliedChanges: boolean;
    }
  ): Promise<void> {
    if (!this.learningEnabled) return;

    try {
      const insights = this.extractOptimizationInsights(
        originalContent, 
        optimizedContent, 
        userFeedback
      );

      // Update feedback patterns
      const pattern = this.feedbackPatterns.get(category) || {
        feedbackType: 'neutral',
        category,
        commonIssues: [],
        successfulPatterns: [],
        averageRating: 0,
        frequency: 0
      };

      pattern.frequency += 1;
      pattern.averageRating = 
        (pattern.averageRating * (pattern.frequency - 1) + userFeedback.rating) / 
        pattern.frequency;

      if (userFeedback.rating >= 4) {
        insights.successPatterns.forEach(successPattern => {
          if (!pattern.successfulPatterns.includes(successPattern)) {
            pattern.successfulPatterns.push(successPattern);
          }
        });
      }

      if (userFeedback.rating <= 2) {
        insights.issues.forEach(issue => {
          if (!pattern.commonIssues.includes(issue)) {
            pattern.commonIssues.push(issue);
          }
        });
      }

      this.feedbackPatterns.set(category, pattern);

      // Store learning data in database for persistence
      await this.persistLearningData();

    } catch (error) {
      console.error('Failed to learn from optimization:', error);
    }
  }

  /**
   * Get success rate statistics for different optimization types
   */
  getSuccessRateStats(): { [category: string]: { successRate: number; totalOptimizations: number; avgRating: number } } {
    const stats: { [category: string]: { successRate: number; totalOptimizations: number; avgRating: number } } = {};

    this.feedbackPatterns.forEach((pattern, category) => {
      stats[category] = {
        successRate: (pattern.averageRating / 5) * 100,
        totalOptimizations: pattern.frequency,
        avgRating: pattern.averageRating
      };
    });

    return stats;
  }

  /**
   * Reset learning data (for debugging or fresh starts)
   */
  resetLearning(): void {
    this.feedbackPatterns.clear();
    this.promptData.clear();
  }

  /**
   * Enable or disable adaptive learning
   */
  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
  }

  // Private helper methods

  private categorizeOptimization(suggestions: any[], settings: any): string {
    if (!suggestions || suggestions.length === 0) return 'general';
    
    const types = suggestions.map(s => s.type || s.category || 'general');
    const mostCommon = this.getMostFrequent(types);
    
    return mostCommon || 'general';
  }

  private extractInsightsFromComments(comments: string, pattern: FeedbackPattern, isPositive: boolean): void {
    // Simple keyword extraction - in production, use NLP
    const keywords = comments.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    if (isPositive) {
      keywords.forEach(keyword => {
        if (keyword.includes('good') || keyword.includes('great') || keyword.includes('perfect')) {
          const context = this.extractContext(comments, keyword);
          if (context && !pattern.successfulPatterns.includes(context)) {
            pattern.successfulPatterns.push(context);
          }
        }
      });
    } else {
      keywords.forEach(keyword => {
        if (keyword.includes('bad') || keyword.includes('wrong') || keyword.includes('issue')) {
          const context = this.extractContext(comments, keyword);
          if (context && !pattern.commonIssues.includes(context)) {
            pattern.commonIssues.push(context);
          }
        }
      });
    }
  }

  private analyzeContentCharacteristics(content: string) {
    const wordCount = content.split(/\s+/).length;
    const technicalTerms = ['API', 'algorithm', 'function', 'method', 'class', 'variable'];
    const technicalCount = technicalTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    ).length;

    return {
      isShort: wordCount < 100,
      isMedium: wordCount >= 100 && wordCount <= 500,
      isLong: wordCount > 500,
      isTechnical: technicalCount >= 2,
      wordCount,
      technicalScore: (technicalCount / technicalTerms.length) * 100
    };
  }

  private extractOptimizationInsights(
    original: string, 
    optimized: string, 
    feedback: { rating: number; comments?: string; appliedChanges: boolean }
  ) {
    const insights = {
      successPatterns: [] as string[],
      issues: [] as string[]
    };

    // Analyze changes made
    const lengthChange = optimized.length - original.length;
    const significantChange = Math.abs(lengthChange) > original.length * 0.1;

    if (feedback.rating >= 4) {
      if (significantChange && lengthChange > 0) {
        insights.successPatterns.push('content expansion');
      } else if (significantChange && lengthChange < 0) {
        insights.successPatterns.push('content concision');
      }
      
      if (feedback.appliedChanges) {
        insights.successPatterns.push('user applied changes');
      }
    }

    if (feedback.rating <= 2) {
      if (significantChange) {
        insights.issues.push('too many changes');
      }
      if (!feedback.appliedChanges) {
        insights.issues.push('suggestions not actionable');
      }
    }

    return insights;
  }

  private getMostFrequent<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    
    const frequency: { [key: string]: number } = {};
    let maxCount = 0;
    let mostFrequent: T | undefined;

    arr.forEach(item => {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
      if (frequency[key] > maxCount) {
        maxCount = frequency[key];
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  private extractContext(text: string, keyword: string): string | null {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return null;
    
    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + keyword.length + 20);
    
    return text.substring(start, end).trim();
  }

  private trackPromptUsage(category: string, prompt: string): void {
    // Track which prompts are being used for future analysis
    const usage = {
      category,
      prompt: prompt.substring(0, 100), // Store first 100 chars for identification
      timestamp: new Date(),
      hash: this.hashString(prompt)
    };
    
    // In production, store this in a separate tracking system
    console.debug('Prompt usage tracked:', usage);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  private async persistLearningData(): Promise<void> {
    // In a real implementation, store learning data in the database
    // For now, we'll store in localStorage as a fallback
    try {
      const data = {
        patterns: Array.from(this.feedbackPatterns.entries()),
        prompts: Array.from(this.promptData.entries()),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('adaptive_prompt_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist learning data:', error);
    }
  }
}

export const adaptivePromptService = new AdaptivePromptService();
export type { FeedbackPattern, AdaptivePromptData };