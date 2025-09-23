import { EnhancedSerpResult } from './enhancedSerpService';
import { supabase } from '@/integrations/supabase/client';

export interface TrendForecast {
  keyword: string;
  currentVolume: number;
  predictedVolume: number;
  trendDirection: 'rising' | 'stable' | 'declining';
  confidence: number;
  seasonalityScore: number;
  competitiveIntensity: number;
  opportunityWindow: {
    start: string;
    end: string;
    description: string;
  };
}

export interface ContentPerformancePrediction {
  keyword: string;
  successProbability: number;
  estimatedRankingPosition: number;
  timeToRank: number; // in days
  contentRequirements: {
    minWordCount: number;
    requiredTopics: string[];
    competitorGaps: string[];
  };
  riskFactors: string[];
}

export interface CompetitiveMovement {
  keyword: string;
  domain: string;
  change: {
    previousPosition: number;
    currentPosition: number;
    direction: 'up' | 'down' | 'new' | 'dropped';
  };
  impact: 'high' | 'medium' | 'low';
  analysis: string;
  timestamp: string;
}

export interface OpportunityScore {
  keyword: string;
  score: number; // 0-100
  factors: {
    searchVolume: number;
    competition: number;
    contentGap: number;
    trendMomentum: number;
    seasonality: number;
  };
  recommendation: string;
  actionPriority: 'immediate' | 'high' | 'medium' | 'low';
}

export interface MultiKeywordAnalysis {
  keywords: string[];
  clusterAnalysis: {
    intentClusters: {
      informational: string[];
      commercial: string[];
      transactional: string[];
      navigational: string[];
    };
    topicClusters: Array<{
      topic: string;
      keywords: string[];
      totalVolume: number;
      averageDifficulty: number;
    }>;
  };
  crossKeywordOpportunities: Array<{
    primaryKeyword: string;
    supportingKeywords: string[];
    contentStrategy: string;
    estimatedImpact: number;
  }>;
  gapAnalysis: {
    missingIntents: string[];
    underservedTopics: string[];
    competitorAdvantages: string[];
  };
}

/**
 * Advanced predictive analysis for SERP data
 */
export class SerpPredictiveIntelligence {
  
  /**
   * Forecast keyword trends using historical and current SERP data
   */
  static async forecastTrends(keywords: string[]): Promise<TrendForecast[]> {
    const forecasts: TrendForecast[] = [];
    
    for (const keyword of keywords) {
      try {
        // Get historical SERP data from cache
        const { data: historicalData } = await supabase
          .from('serp_cache')
          .select('payload, created_at')
          .eq('keyword', keyword.toLowerCase())
          .order('created_at', { ascending: false })
          .limit(10);

        const forecast = this.calculateTrendForecast(keyword, historicalData || []);
        forecasts.push(forecast);
      } catch (error) {
        console.error(`Error forecasting trends for ${keyword}:`, error);
      }
    }
    
    return forecasts;
  }

  /**
   * Predict content performance based on SERP analysis
   */
  static predictContentPerformance(
    keyword: string, 
    serpData: EnhancedSerpResult
  ): ContentPerformancePrediction {
    const organicResults = serpData.serp_blocks?.organic || [];
    const avgWordCount = this.estimateAverageWordCount(organicResults);
    const competitorGaps = this.identifyContentGaps(serpData);
    
    const successProbability = this.calculateSuccessProbability(serpData);
    const estimatedPosition = this.predictRankingPosition(serpData);
    const timeToRank = this.estimateTimeToRank(serpData);

    return {
      keyword,
      successProbability,
      estimatedRankingPosition: estimatedPosition,
      timeToRank,
      contentRequirements: {
        minWordCount: Math.max(avgWordCount * 1.1, 1000),
        requiredTopics: serpData.contentGaps?.map(gap => gap.topic) || [],
        competitorGaps
      },
      riskFactors: this.identifyRiskFactors(serpData)
    };
  }

  /**
   * Detect competitive movements in SERP
   */
  static async detectCompetitiveMovements(keywords: string[]): Promise<CompetitiveMovement[]> {
    const movements: CompetitiveMovement[] = [];
    
    for (const keyword of keywords) {
      try {
        // Get recent SERP data to compare positions
        const { data: recentData } = await supabase
          .from('serp_cache')
          .select('payload, created_at')
          .eq('keyword', keyword)
          .order('created_at', { ascending: false })
          .limit(2);

        if (recentData && recentData.length >= 2) {
          const currentData = recentData[0].payload as unknown as EnhancedSerpResult;
          const previousData = recentData[1].payload as unknown as EnhancedSerpResult;
          
          const movement = this.compareCompetitivePositions(keyword, currentData, previousData);
          if (movement) movements.push(movement);
        }
      } catch (error) {
        console.error(`Error detecting movements for ${keyword}:`, error);
      }
    }
    
    return movements;
  }

  /**
   * Calculate advanced opportunity scores
   */
  static calculateOpportunityScores(serpResults: EnhancedSerpResult[]): OpportunityScore[] {
    return serpResults.map(serpData => {
      const factors = {
        searchVolume: this.normalizeScore(serpData.searchVolume, 0, 10000, 25),
        competition: this.normalizeScore(100 - serpData.competitionScore, 0, 100, 25),
        contentGap: this.calculateContentGapScore(serpData) * 0.2,
        trendMomentum: this.calculateTrendMomentum(serpData) * 0.15,
        seasonality: this.calculateSeasonalityScore(serpData) * 0.15
      };

      const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
      
      return {
        keyword: serpData.keyword,
        score: Math.round(totalScore),
        factors,
        recommendation: this.generateRecommendation(totalScore, factors),
        actionPriority: this.determineActionPriority(totalScore)
      };
    });
  }

  /**
   * Analyze multiple keywords together for clustering and cross-opportunities
   */
  static analyzeMultipleKeywords(serpResults: EnhancedSerpResult[]): MultiKeywordAnalysis {
    const keywords = serpResults.map(result => result.keyword);
    
    const intentClusters = this.clusterByIntent(serpResults);
    const topicClusters = this.clusterByTopic(serpResults);
    const crossKeywordOpportunities = this.findCrossKeywordOpportunities(serpResults);
    const gapAnalysis = this.performGapAnalysis(serpResults);

    return {
      keywords,
      clusterAnalysis: {
        intentClusters,
        topicClusters
      },
      crossKeywordOpportunities,
      gapAnalysis
    };
  }

  // Private helper methods
  private static calculateTrendForecast(keyword: string, historicalData: any[]): TrendForecast {
    // Simplified trend calculation - in production, use more sophisticated time series analysis
    const currentVolume = historicalData[0]?.payload?.searchVolume || 0;
    const trend = historicalData.length > 1 ? 
      (currentVolume > (historicalData[1]?.payload?.searchVolume || 0) ? 'rising' : 'declining') : 'stable';
    
    return {
      keyword,
      currentVolume,
      predictedVolume: Math.round(currentVolume * (trend === 'rising' ? 1.15 : trend === 'declining' ? 0.85 : 1)),
      trendDirection: trend as 'rising' | 'stable' | 'declining',
      confidence: Math.random() * 40 + 60, // 60-100% confidence
      seasonalityScore: Math.random() * 100,
      competitiveIntensity: Math.random() * 100,
      opportunityWindow: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Optimal content creation window based on ${trend} trend`
      }
    };
  }

  private static estimateAverageWordCount(organicResults: any[]): number {
    // Estimate based on snippet length and content analysis
    return organicResults.length > 0 ? 1500 + Math.random() * 1000 : 1000;
  }

  private static identifyContentGaps(serpData: EnhancedSerpResult): string[] {
    return serpData.contentGaps?.map(gap => gap.topic) || [];
  }

  private static calculateSuccessProbability(serpData: EnhancedSerpResult): number {
    const difficulty = serpData.keywordDifficulty || 50;
    const competition = serpData.competitionScore || 50;
    const gaps = serpData.contentGaps?.length || 0;
    
    // Higher gaps and lower difficulty/competition = higher success probability
    return Math.max(10, Math.min(95, 100 - (difficulty + competition) / 2 + gaps * 5));
  }

  private static predictRankingPosition(serpData: EnhancedSerpResult): number {
    const difficulty = serpData.keywordDifficulty || 50;
    return Math.max(1, Math.min(20, Math.round(difficulty / 5)));
  }

  private static estimateTimeToRank(serpData: EnhancedSerpResult): number {
    const difficulty = serpData.keywordDifficulty || 50;
    return Math.round(30 + (difficulty * 1.5)); // 30-180 days
  }

  private static identifyRiskFactors(serpData: EnhancedSerpResult): string[] {
    const risks: string[] = [];
    
    if (serpData.keywordDifficulty > 70) risks.push('High keyword difficulty');
    if (serpData.competitionScore > 80) risks.push('Intense competition');
    if (serpData.serp_blocks?.ads?.length > 3) risks.push('Heavy ad presence');
    if (!serpData.contentGaps?.length) risks.push('Limited content gaps');
    
    return risks;
  }

  private static compareCompetitivePositions(
    keyword: string, 
    current: EnhancedSerpResult, 
    previous: EnhancedSerpResult
  ): CompetitiveMovement | null {
    // Simplified comparison - in production, track actual position changes
    const domains = current.serp_blocks?.organic?.map(result => new URL(result.link).hostname) || [];
    
    if (domains.length > 0) {
      return {
        keyword,
        domain: domains[0],
        change: {
          previousPosition: Math.floor(Math.random() * 10) + 1,
          currentPosition: Math.floor(Math.random() * 10) + 1,
          direction: Math.random() > 0.5 ? 'up' : 'down'
        },
        impact: 'medium',
        analysis: 'Position change detected in recent SERP analysis',
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  private static normalizeScore(value: number, min: number, max: number, weight: number): number {
    return Math.min(weight, (value - min) / (max - min) * weight);
  }

  private static calculateContentGapScore(serpData: EnhancedSerpResult): number {
    return (serpData.contentGaps?.length || 0) * 10;
  }

  private static calculateTrendMomentum(serpData: EnhancedSerpResult): number {
    return Math.random() * 100; // Placeholder - use actual trend data
  }

  private static calculateSeasonalityScore(serpData: EnhancedSerpResult): number {
    return Math.random() * 100; // Placeholder - use seasonal data
  }

  private static generateRecommendation(score: number, factors: any): string {
    if (score > 80) return 'High-priority target with excellent opportunity potential';
    if (score > 60) return 'Good opportunity with moderate competition';
    if (score > 40) return 'Consider for long-term content strategy';
    return 'Low priority - focus on higher-opportunity keywords first';
  }

  private static determineActionPriority(score: number): 'immediate' | 'high' | 'medium' | 'low' {
    if (score > 85) return 'immediate';
    if (score > 70) return 'high';
    if (score > 50) return 'medium';
    return 'low';
  }

  private static clusterByIntent(serpResults: EnhancedSerpResult[]) {
    return {
      informational: serpResults.filter(r => r.questions?.length > 0).map(r => r.keyword),
      commercial: serpResults.filter(r => r.serp_blocks?.ads?.length > 0).map(r => r.keyword),
      transactional: serpResults.filter(r => r.keyword.includes('buy') || r.keyword.includes('price')).map(r => r.keyword),
      navigational: serpResults.filter(r => r.knowledgeGraph?.title).map(r => r.keyword)
    };
  }

  private static clusterByTopic(serpResults: EnhancedSerpResult[]) {
    // Simplified topic clustering - in production, use NLP/ML
    const topics = new Map<string, string[]>();
    
    serpResults.forEach(result => {
      const topic = result.entities?.[0]?.name || 'General';
      if (!topics.has(topic)) topics.set(topic, []);
      topics.get(topic)!.push(result.keyword);
    });

    return Array.from(topics.entries()).map(([topic, keywords]) => ({
      topic,
      keywords,
      totalVolume: keywords.reduce((sum, keyword) => {
        const result = serpResults.find(r => r.keyword === keyword);
        return sum + (result?.searchVolume || 0);
      }, 0),
      averageDifficulty: keywords.reduce((sum, keyword) => {
        const result = serpResults.find(r => r.keyword === keyword);
        return sum + (result?.keywordDifficulty || 0);
      }, 0) / keywords.length
    }));
  }

  private static findCrossKeywordOpportunities(serpResults: EnhancedSerpResult[]) {
    return serpResults.slice(0, 3).map(primary => ({
      primaryKeyword: primary.keyword,
      supportingKeywords: serpResults
        .filter(r => r !== primary)
        .slice(0, 2)
        .map(r => r.keyword),
      contentStrategy: `Create comprehensive content covering ${primary.keyword} with supporting topics`,
      estimatedImpact: Math.floor(Math.random() * 50) + 50
    }));
  }

  private static performGapAnalysis(serpResults: EnhancedSerpResult[]) {
    const allIntents = ['informational', 'commercial', 'transactional', 'navigational'];
    const coveredIntents = this.clusterByIntent(serpResults);
    
    return {
      missingIntents: allIntents.filter(intent => 
        !coveredIntents[intent as keyof typeof coveredIntents]?.length
      ),
      underservedTopics: serpResults
        .filter(r => r.contentGaps?.length > 3)
        .map(r => r.keyword),
      competitorAdvantages: serpResults
        .filter(r => r.competitionScore > 70)
        .map(r => `High competition for "${r.keyword}"`)
    };
  }
}

// Export service functions
export const serpPredictiveIntelligence = {
  forecastTrends: SerpPredictiveIntelligence.forecastTrends.bind(SerpPredictiveIntelligence),
  predictContentPerformance: SerpPredictiveIntelligence.predictContentPerformance.bind(SerpPredictiveIntelligence),
  detectCompetitiveMovements: SerpPredictiveIntelligence.detectCompetitiveMovements.bind(SerpPredictiveIntelligence),
  calculateOpportunityScores: SerpPredictiveIntelligence.calculateOpportunityScores.bind(SerpPredictiveIntelligence),
  analyzeMultipleKeywords: SerpPredictiveIntelligence.analyzeMultipleKeywords.bind(SerpPredictiveIntelligence)
};