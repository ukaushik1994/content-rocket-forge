import { supabase } from '@/integrations/supabase/client';

export interface SerpAnalysisResult {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  competitionScore: number;
  cpc: number;
  topResults: Array<{
    position: number;
    title: string;
    url: string;
    snippet: string;
    domain: string;
  }>;
  contentGaps: Array<{
    topic: string;
    description: string;
    opportunity: string;
  }>;
  questions: Array<{
    question: string;
    answer: string;
    source: string;
  }>;
  featuredSnippets: any[];
  relatedSearches: string[];
  totalResults: number;
  provider: string;
  isMockData?: boolean;
}

export interface PredictiveAnalysisResult {
  predictions: Array<{
    keyword: string;
    trendForecast: {
      keyword: string;
      currentVolume: number;
      predictedVolume: number;
      trendDirection: 'rising' | 'stable' | 'declining';
      confidence: number;
      opportunityWindow: {
        start: string;
        end: string;
        description: string;
      };
    };
    opportunityScore: {
      keyword: string;
      score: number;
      factors: {
        searchVolume: number;
        competition: number;
        contentGap: number;
        trendMomentum: number;
        seasonality: number;
      };
      recommendation: string;
      actionPriority: 'immediate' | 'high' | 'medium' | 'low';
    };
    contentPerformancePrediction: {
      successProbability: number;
      estimatedRankingPosition: number;
      timeToRank: number;
      contentRequirements: {
        minWordCount: number;
        requiredTopics: string[];
        competitorGaps: string[];
      };
    };
  }>;
}

export interface WorkflowExecutionResult {
  id: string;
  workflow_type: string;
  current_step: string;
  workflow_data: any;
  updated_at: string;
}

/**
 * Service for interacting with the SERP-AI edge function
 */
export class SerpAIService {
  /**
   * Perform basic SERP analysis for a keyword
   */
  static async analyzeKeyword(
    keyword: string,
    location: string = 'United States',
    language: string = 'en'
  ): Promise<SerpAnalysisResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('serp-ai', {
        body: {
          keyword,
          location,
          language
        }
      });

      if (error) {
        console.error('SERP analysis error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to analyze keyword:', error);
      return null;
    }
  }

  /**
   * Perform multi-keyword analysis
   */
  static async analyzeMultipleKeywords(
    keywords: string[],
    location: string = 'United States',
    language: string = 'en'
  ): Promise<{ results: Array<{ keyword: string; data: SerpAnalysisResult }> } | null> {
    try {
      const { data, error } = await supabase.functions.invoke('serp-ai/multi-keyword', {
        body: {
          keywords,
          location,
          language
        }
      });

      if (error) {
        console.error('Multi-keyword analysis error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to analyze multiple keywords:', error);
      return null;
    }
  }

  /**
   * Get predictive analysis for keywords
   */
  static async getPredictiveAnalysis(
    keywords: string[],
    userId?: string
  ): Promise<PredictiveAnalysisResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('serp-ai/predictive-analysis', {
        body: {
          keywords,
          userId
        }
      });

      if (error) {
        console.error('Predictive analysis error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get predictive analysis:', error);
      return null;
    }
  }

  /**
   * Execute workflow step
   */
  static async executeWorkflow(
    workflowId: string,
    userId: string
  ): Promise<WorkflowExecutionResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('serp-ai/workflow-execution', {
        body: {
          workflowId,
          userId
        }
      });

      if (error) {
        console.error('Workflow execution error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      return null;
    }
  }

  /**
   * Create a new workflow in the database
   */
  static async createWorkflow(
    workflowType: string,
    keywords: string[],
    userId: string
  ): Promise<string | null> {
    try {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('ai_workflow_states')
        .insert({
          id: workflowId,
          user_id: userId,
          workflow_type: workflowType,
          current_step: 'initialize',
          workflow_data: {
            keywords,
            status: 'pending',
            progress: 0,
            created_at: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Failed to create workflow:', error);
        return null;
      }

      return workflowId;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      return null;
    }
  }

  /**
   * Get workflow status
   */
  static async getWorkflowStatus(
    workflowId: string,
    userId: string
  ): Promise<WorkflowExecutionResult | null> {
    try {
      const { data, error } = await supabase
        .from('ai_workflow_states')
        .select('*')
        .eq('id', workflowId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Failed to get workflow status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      return null;
    }
  }
}

// Export convenience functions
export const serpAIService = {
  analyzeKeyword: SerpAIService.analyzeKeyword.bind(SerpAIService),
  analyzeMultipleKeywords: SerpAIService.analyzeMultipleKeywords.bind(SerpAIService),
  getPredictiveAnalysis: SerpAIService.getPredictiveAnalysis.bind(SerpAIService),
  executeWorkflow: SerpAIService.executeWorkflow.bind(SerpAIService),
  createWorkflow: SerpAIService.createWorkflow.bind(SerpAIService),
  getWorkflowStatus: SerpAIService.getWorkflowStatus.bind(SerpAIService)
};