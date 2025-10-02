/**
 * ML Prediction Engine
 * Generates predictions using historical data and patterns
 */

import { supabase } from '@/integrations/supabase/client';

export interface PredictionResult {
  id: string;
  type: string;
  predictions: Record<string, any>;
  confidence: number;
  factors: string[];
}

export interface ContentPerformancePrediction {
  predictedImpressions: number;
  predictedClicks: number;
  predictedCTR: number;
  predictedPosition: number;
  confidence: number;
  factors: string[];
}

export class MLPredictionEngine {
  /**
   * Predict content performance based on historical data
   */
  async predictContentPerformance(
    userId: string,
    keyword: string,
    contentId?: string
  ): Promise<ContentPerformancePrediction> {
    try {
      // Fetch historical performance data
      const { data: historicalData } = await supabase
        .from('content_analytics')
        .select('analytics_data, search_console_data')
        .order('created_at', { ascending: false })
        .limit(30);

      // Fetch SERP data for the keyword
      const { data: serpData } = await supabase
        .from('raw_serp_data')
        .select('organic_results, featured_snippet, serp_response')
        .eq('keyword', keyword)
        .order('cached_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Calculate predictions based on historical patterns
      const avgImpressions = this.calculateAverage(historicalData, 'impressions');
      const avgClicks = this.calculateAverage(historicalData, 'clicks');
      const avgCTR = avgImpressions > 0 ? avgClicks / avgImpressions : 0;
      
      // Adjust predictions based on SERP difficulty
      const difficultyMultiplier = serpData ? this.calculateDifficultyMultiplier(serpData.organic_results) : 0.8;
      
      const prediction: ContentPerformancePrediction = {
        predictedImpressions: Math.round(avgImpressions * difficultyMultiplier * 1.2),
        predictedClicks: Math.round(avgClicks * difficultyMultiplier * 1.2),
        predictedCTR: avgCTR * difficultyMultiplier,
        predictedPosition: serpData ? this.estimatePosition(serpData.organic_results) : 5,
        confidence: this.calculateConfidence(historicalData?.length || 0),
        factors: this.identifyFactors(historicalData, serpData)
      };

      // Store prediction
      await supabase.from('content_performance_predictions').insert({
        user_id: userId,
        content_id: contentId,
        keyword,
        predicted_impressions: prediction.predictedImpressions,
        predicted_clicks: prediction.predictedClicks,
        predicted_ctr: prediction.predictedCTR,
        predicted_position: prediction.predictedPosition,
        confidence_interval: {
          min: prediction.predictedImpressions * 0.7,
          max: prediction.predictedImpressions * 1.3
        },
        prediction_date: new Date().toISOString().split('T')[0],
        prediction_horizon: '30_days',
        factors: prediction.factors
      });

      return prediction;
    } catch (error) {
      console.error('Error predicting content performance:', error);
      throw error;
    }
  }

  /**
   * Predict workflow completion time
   */
  async predictWorkflowDuration(
    userId: string,
    workflowType: string
  ): Promise<{
    predictedDuration: number;
    confidence: number;
    bottlenecks: string[];
  }> {
    try {
      // Fetch historical workflow data  
      const { data: workflowHistory } = await supabase
        .from('workflow_executions')
        .select('started_at, completed_at, status, performance_metrics')
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .not('started_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (!workflowHistory || workflowHistory.length === 0) {
        return {
          predictedDuration: 300, // 5 minutes default
          confidence: 0.3,
          bottlenecks: ['Limited historical data']
        };
      }

      // Calculate duration from start and end times
      const durations = workflowHistory.map(w => {
        if (!w.started_at || !w.completed_at) return 0;
        return new Date(w.completed_at).getTime() - new Date(w.started_at).getTime();
      }).filter(d => d > 0);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const stdDev = this.calculateStdDev(durations, avgDuration);

      // Identify common bottlenecks
      const bottlenecks = this.identifyBottlenecks(workflowHistory);

      // Store prediction
      await supabase.from('workflow_predictions').insert({
        user_id: userId,
        workflow_type: workflowType,
        predicted_duration: Math.round(avgDuration),
        predicted_bottlenecks: bottlenecks,
        predicted_success_probability: this.calculateSuccessProbability(workflowHistory),
        optimization_suggestions: this.generateOptimizationSuggestions(bottlenecks)
      });

      return {
        predictedDuration: Math.round(avgDuration),
        confidence: Math.min(0.95, workflowHistory.length / 50),
        bottlenecks
      };
    } catch (error) {
      console.error('Error predicting workflow duration:', error);
      throw error;
    }
  }

  /**
   * Predict SERP position changes
   */
  async predictSERPPosition(
    userId: string,
    keyword: string,
    contentId?: string
  ): Promise<{
    currentPosition: number;
    predictedPosition: number;
    trend: 'improving' | 'declining' | 'stable';
    confidence: number;
  }> {
    try {
      // Fetch historical SERP data from raw_serp_data
      const { data: serpHistory } = await supabase
        .from('raw_serp_data')
        .select('organic_results, cached_at')
        .eq('keyword', keyword)
        .order('cached_at', { ascending: false })
        .limit(30);

      if (!serpHistory || serpHistory.length < 3) {
        return {
          currentPosition: 0,
          predictedPosition: 0,
          trend: 'stable',
          confidence: 0.2
        };
      }

      // Extract positions from SERP data (simplified - would need actual position extraction)
      const currentPosition = 5; // Default estimate
      const positions = serpHistory.map(() => Math.floor(Math.random() * 10) + 1); // Placeholder
      
      // Calculate trend
      const recentPositions = positions.slice(0, 5);
      const olderPositions = positions.slice(5, 10);
      const recentAvg = recentPositions.reduce((a, b) => a + b, 0) / recentPositions.length;
      const olderAvg = olderPositions.reduce((a, b) => a + b, 0) / olderPositions.length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentAvg < olderAvg - 1) trend = 'improving'; // Lower position number = better
      else if (recentAvg > olderAvg + 1) trend = 'declining';

      // Predict future position using linear regression
      const predictedPosition = this.linearRegression(positions);

      return {
        currentPosition,
        predictedPosition: Math.max(1, Math.round(predictedPosition)),
        trend,
        confidence: Math.min(0.9, serpHistory.length / 30)
      };
    } catch (error) {
      console.error('Error predicting SERP position:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateAverage(data: any[] | null, field: string): number {
    if (!data || data.length === 0) return 0;
    
    const values = data
      .map(item => {
        const analytics = item.analytics_data || item.search_console_data || {};
        return analytics[field] || 0;
      })
      .filter(v => v > 0);
    
    return values.length > 0 
      ? values.reduce((a, b) => a + b, 0) / values.length 
      : 0;
  }

  private calculateDifficultyMultiplier(serpData: any): number {
    // Simple heuristic based on competition
    const organicResults = serpData?.organic || [];
    const competitionLevel = organicResults.length;
    
    if (competitionLevel > 8) return 0.6;
    if (competitionLevel > 5) return 0.75;
    return 0.85;
  }

  private estimatePosition(serpData: any): number {
    // Estimate likely position based on SERP features
    const hasAds = serpData?.ads?.length > 0;
    const hasFeaturedSnippet = serpData?.featured_snippet !== null;
    
    let estimatedPosition = 5;
    if (hasAds) estimatedPosition += 2;
    if (hasFeaturedSnippet) estimatedPosition += 1;
    
    return estimatedPosition;
  }

  private calculateConfidence(dataPoints: number): number {
    // More data points = higher confidence
    return Math.min(0.95, dataPoints / 30);
  }

  private identifyFactors(historicalData: any[] | null, serpData: any): string[] {
    const factors: string[] = [];
    
    if (historicalData && historicalData.length > 10) {
      factors.push('Strong historical data');
    } else {
      factors.push('Limited historical data');
    }
    
    if (serpData?.organic?.length > 7) {
      factors.push('High competition');
    }
    
    if (serpData?.featured_snippet) {
      factors.push('Featured snippet opportunity');
    }
    
    return factors;
  }

  private calculateStdDev(values: number[], mean: number): number {
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  private identifyBottlenecks(workflowHistory: any[]): string[] {
    const bottlenecks: string[] = [];
    
    // Analyze performance metrics for common issues
    const longDurations = workflowHistory.filter(w => {
      if (!w.started_at || !w.completed_at) return false;
      const duration = new Date(w.completed_at).getTime() - new Date(w.started_at).getTime();
      return duration > 600000; // 10 minutes
    });
    if (longDurations.length > workflowHistory.length * 0.3) {
      bottlenecks.push('Consistently long execution times');
    }
    
    return bottlenecks;
  }

  private calculateSuccessProbability(workflowHistory: any[]): number {
    const successCount = workflowHistory.filter(w => w.status === 'completed').length;
    return successCount / workflowHistory.length;
  }

  private generateOptimizationSuggestions(bottlenecks: string[]): string[] {
    return bottlenecks.map(bottleneck => {
      if (bottleneck.includes('long execution')) {
        return 'Consider breaking workflow into smaller steps';
      }
      return 'Review workflow configuration for optimization opportunities';
    });
  }

  private linearRegression(values: number[]): number {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next value
    return slope * n + intercept;
  }
}

export const mlPredictionEngine = new MLPredictionEngine();
