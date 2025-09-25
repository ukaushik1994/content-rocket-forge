import AIServiceController from '@/services/aiService/AIServiceController';

export interface ContentPerformancePrediction {
  contentId: string;
  predictedMetrics: {
    views: { min: number; max: number; expected: number };
    engagement: { min: number; max: number; expected: number };
    conversions: { min: number; max: number; expected: number };
    socialShares: { min: number; max: number; expected: number };
  };
  confidenceLevel: number; // 0-100
  timeframe: '1_week' | '1_month' | '3_months' | '6_months';
  factors: Array<{
    factor: string;
    impact: number; // -100 to +100
    reasoning: string;
  }>;
  recommendations: string[];
  generatedAt: string;
}

export interface TrendAnalysis {
  trend: 'rising' | 'stable' | 'declining' | 'seasonal';
  strength: number; // 0-100
  timeframe: string;
  description: string;
  relatedKeywords: string[];
  seasonalPatterns?: Array<{
    period: string;
    impact: number;
  }>;
}

export interface OpportunityDetection {
  id: string;
  type: 'content_gap' | 'keyword_opportunity' | 'trending_topic' | 'competitor_weakness';
  title: string;
  description: string;
  opportunity: string;
  priority: number; // 0-100
  estimatedROI: number; // 0-100
  timeToImplement: number; // days
  difficulty: 'low' | 'medium' | 'high';
  actionItems: string[];
  evidence: string[];
  detectedAt: string;
}

export interface AnomalyAlert {
  id: string;
  type: 'performance_drop' | 'unexpected_spike' | 'trend_change' | 'competitive_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedMetrics: string[];
  detectedValue: number;
  expectedValue: number;
  deviation: number; // percentage
  possibleCauses: string[];
  recommendedActions: string[];
  detectedAt: string;
  autoResolvable: boolean;
}

export interface MarketIntelligence {
  marketTrends: TrendAnalysis[];
  competitorMovements: Array<{
    competitor: string;
    action: string;
    impact: number;
    ourResponse: string;
  }>;
  emergingOpportunities: OpportunityDetection[];
  riskFactors: Array<{
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
  }>;
  industryInsights: string[];
  generatedAt: string;
}

class PredictiveAnalyticsService {
  private predictionCache = new Map<string, ContentPerformancePrediction>();
  private trendCache = new Map<string, TrendAnalysis[]>();
  private opportunityCache = new Map<string, OpportunityDetection[]>();

  async predictContentPerformance(
    contentData: {
      title: string;
      content: string;
      keywords: string[];
      publishDate?: string;
      category?: string;
    },
    timeframe: '1_week' | '1_month' | '3_months' | '6_months' = '1_month',
    historicalData?: any[]
  ): Promise<ContentPerformancePrediction> {
    const cacheKey = `${contentData.title}-${timeframe}`;
    const cached = this.predictionCache.get(cacheKey);
    
    if (cached && Date.now() - new Date(cached.generatedAt).getTime() < 10 * 60 * 1000) {
      return cached;
    }

    try {
      const prompt = `Predict content performance based on this data:

Content Details:
Title: ${contentData.title}
Keywords: ${contentData.keywords.join(', ')}
Content Length: ${contentData.content.length} characters
Category: ${contentData.category || 'General'}
Timeframe: ${timeframe}
Historical Data: ${historicalData ? JSON.stringify(historicalData.slice(-10)) : 'Limited'}

Generate performance predictions with:
1. Views (min/max/expected ranges)
2. Engagement rates (min/max/expected)
3. Conversion rates (min/max/expected)  
4. Social sharing potential (min/max/expected)
5. Factors affecting performance (with impact scores -100 to +100)
6. Confidence level (0-100)
7. Optimization recommendations

Return JSON:
{
  "predictedMetrics": {
    "views": {"min": number, "max": number, "expected": number},
    "engagement": {"min": number, "max": number, "expected": number},
    "conversions": {"min": number, "max": number, "expected": number},
    "socialShares": {"min": number, "max": number, "expected": number}
  },
  "confidenceLevel": number (0-100),
  "factors": [
    {"factor": "Factor name", "impact": number (-100 to +100), "reasoning": "Why this impacts performance"}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.3,
        max_tokens: 1000
      });

      const aiResult = this.parseJsonResponse(response?.content || '');
      const prediction: ContentPerformancePrediction = {
        contentId: `content-${Date.now()}`,
        timeframe,
        ...aiResult,
        generatedAt: new Date().toISOString()
      };

      if (aiResult) {
        this.predictionCache.set(cacheKey, prediction);
      }

      return prediction;

    } catch (error) {
      console.error('Performance prediction failed:', error);
      return this.getFallbackPrediction(contentData.title, timeframe);
    }
  }

  async detectTrends(
    keywords: string[],
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
    includeCompetitive = true
  ): Promise<TrendAnalysis[]> {
    const cacheKey = `trends-${keywords.join(',')}-${timeRange}`;
    const cached = this.trendCache.get(cacheKey);
    
    if (cached && cached.length > 0) return cached;

    try {
      const prompt = `Analyze trends for these keywords over ${timeRange}:

Keywords: ${keywords.join(', ')}
Include competitive analysis: ${includeCompetitive}

For each keyword/topic, analyze:
1. Trend direction (rising/stable/declining/seasonal)
2. Trend strength (0-100)
3. Timeframe description
4. Related keywords gaining traction
5. Seasonal patterns if applicable

Return JSON array:
[
  {
    "trend": "rising"|"stable"|"declining"|"seasonal",
    "strength": number (0-100),
    "timeframe": "description of timeframe",
    "description": "Trend description",
    "relatedKeywords": ["keyword1", "keyword2"],
    "seasonalPatterns": [{"period": "Q1", "impact": number}] // optional
  }
]`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.2,
        max_tokens: 800
      });

      const trends = this.parseJsonResponse(response?.content || '');
      if (Array.isArray(trends)) {
        this.trendCache.set(cacheKey, trends);
        return trends;
      }

      return this.getFallbackTrends();

    } catch (error) {
      console.error('Trend detection failed:', error);
      return this.getFallbackTrends();
    }
  }

  async detectOpportunities(
    userContent: any[],
    competitorData?: any[],
    marketData?: any
  ): Promise<OpportunityDetection[]> {
    const cacheKey = `opportunities-${userContent.length}-${Date.now()}`;
    
    try {
      const prompt = `Identify content and market opportunities based on:

User Content: ${JSON.stringify(userContent.slice(-10))}
Competitor Data: ${competitorData ? JSON.stringify(competitorData.slice(-5)) : 'Limited'}
Market Data: ${marketData ? JSON.stringify(marketData) : 'Limited'}

Detect opportunities for:
1. Content gaps (topics not covered)
2. Keyword opportunities (high potential, low competition)
3. Trending topics (emerging interests)
4. Competitor weaknesses (areas to outperform)

Return JSON array:
[
  {
    "type": "content_gap"|"keyword_opportunity"|"trending_topic"|"competitor_weakness",
    "title": "Opportunity title",
    "description": "Detailed description",
    "opportunity": "Specific opportunity description",
    "priority": number (0-100),
    "estimatedROI": number (0-100),
    "timeToImplement": number (days),
    "difficulty": "low"|"medium"|"high",
    "actionItems": ["action 1", "action 2"],
    "evidence": ["evidence 1", "evidence 2"]
  }
]`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.4,
        max_tokens: 1200
      });

      const opportunities = this.parseJsonResponse(response?.content || '');
      if (Array.isArray(opportunities)) {
        const processedOps = opportunities.map(op => ({
          ...op,
          id: `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          detectedAt: new Date().toISOString()
        }));
        
        this.opportunityCache.set(cacheKey, processedOps);
        return processedOps;
      }

      return [];

    } catch (error) {
      console.error('Opportunity detection failed:', error);
      return [];
    }
  }

  async detectAnomalies(
    currentMetrics: Record<string, number>,
    historicalMetrics: Array<Record<string, number>>,
    thresholdPercent = 25
  ): Promise<AnomalyAlert[]> {
    try {
      // Calculate expected values from historical data
      const expectedValues: Record<string, number> = {};
      const metricKeys = Object.keys(currentMetrics);
      
      metricKeys.forEach(key => {
        const historicalValues = historicalMetrics
          .map(m => m[key])
          .filter(v => typeof v === 'number' && !isNaN(v));
        
        if (historicalValues.length > 0) {
          expectedValues[key] = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
        }
      });

      const anomalies: AnomalyAlert[] = [];

      // Check each metric for anomalies
      metricKeys.forEach(key => {
        const current = currentMetrics[key];
        const expected = expectedValues[key];
        
        if (expected && current !== undefined) {
          const deviation = ((current - expected) / expected) * 100;
          
          if (Math.abs(deviation) > thresholdPercent) {
            const severity: 'low' | 'medium' | 'high' | 'critical' = 
                           Math.abs(deviation) > 75 ? 'critical' : 
                           Math.abs(deviation) > 50 ? 'high' : 
                           Math.abs(deviation) > 25 ? 'medium' : 'low';
            
            anomalies.push({
              id: `anomaly-${key}-${Date.now()}`,
              type: deviation < 0 ? 'performance_drop' : 'unexpected_spike',
              severity,
              title: `${key} ${deviation < 0 ? 'Drop' : 'Spike'} Detected`,
              description: `${key} is ${Math.abs(deviation).toFixed(1)}% ${deviation < 0 ? 'below' : 'above'} expected levels`,
              affectedMetrics: [key],
              detectedValue: current,
              expectedValue: expected,
              deviation: Math.abs(deviation),
              possibleCauses: this.generatePossibleCauses(key, deviation < 0),
              recommendedActions: this.generateRecommendedActions(key, deviation < 0),
              detectedAt: new Date().toISOString(),
              autoResolvable: severity === 'low' || severity === 'medium'
            });
          }
        }
      });

      return anomalies;

    } catch (error) {
      console.error('Anomaly detection failed:', error);
      return [];
    }
  }

  async generateMarketIntelligence(
    industry: string,
    userFocus: string[],
    competitorDomains: string[] = []
  ): Promise<MarketIntelligence> {
    try {
      const prompt = `Generate market intelligence report:

Industry: ${industry}
User Focus Areas: ${userFocus.join(', ')}
Competitors: ${competitorDomains.join(', ')}

Provide intelligence on:
1. Market trends (direction, strength, description)
2. Competitor movements and our recommended responses
3. Emerging opportunities 
4. Risk factors with mitigation strategies
5. Industry insights and predictions

Return JSON:
{
  "marketTrends": [
    {"trend": "rising"|"stable"|"declining", "strength": number, "timeframe": "string", "description": "string", "relatedKeywords": ["kw1"]}
  ],
  "competitorMovements": [
    {"competitor": "name", "action": "what they did", "impact": number, "ourResponse": "our recommended response"}
  ],
  "emergingOpportunities": [
    {"type": "content_gap", "title": "title", "description": "desc", "priority": number, "difficulty": "low"}
  ],
  "riskFactors": [
    {"risk": "risk description", "probability": number, "impact": number, "mitigation": "how to mitigate"}
  ],
  "industryInsights": ["insight 1", "insight 2"]
}`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.3,
        max_tokens: 1500
      });

      const intelligence = this.parseJsonResponse(response?.content || '');
      
      if (intelligence) {
        return {
          ...intelligence,
          generatedAt: new Date().toISOString()
        };
      }

      return this.getFallbackMarketIntelligence();

    } catch (error) {
      console.error('Market intelligence generation failed:', error);
      return this.getFallbackMarketIntelligence();
    }
  }

  private parseJsonResponse(text: string): any | null {
    const match = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  private getFallbackPrediction(title: string, timeframe: string): ContentPerformancePrediction {
    return {
      contentId: `fallback-${Date.now()}`,
      predictedMetrics: {
        views: { min: 100, max: 500, expected: 300 },
        engagement: { min: 2, max: 8, expected: 5 },
        conversions: { min: 1, max: 5, expected: 3 },
        socialShares: { min: 5, max: 25, expected: 15 }
      },
      confidenceLevel: 60,
      timeframe: timeframe as '1_week' | '1_month' | '3_months' | '6_months',
      factors: [
        { factor: 'Content Quality', impact: 30, reasoning: 'High-quality content typically performs better' },
        { factor: 'SEO Optimization', impact: 25, reasoning: 'Well-optimized content gets more organic traffic' }
      ],
      recommendations: ['Optimize for target keywords', 'Include engaging visuals', 'Add clear call-to-actions'],
      generatedAt: new Date().toISOString()
    };
  }

  private getFallbackTrends(): TrendAnalysis[] {
    return [
      {
        trend: 'rising',
        strength: 75,
        timeframe: '30 days',
        description: 'Increasing interest in AI and automation topics',
        relatedKeywords: ['artificial intelligence', 'automation', 'machine learning']
      }
    ];
  }

  private generatePossibleCauses(metric: string, isDecrease: boolean): string[] {
    const causes = {
      views: isDecrease ? ['SEO algorithm changes', 'Increased competition', 'Seasonal factors'] : 
             ['Viral content', 'Improved SEO', 'Trending topic coverage'],
      engagement: isDecrease ? ['Content quality issues', 'Audience fatigue', 'Platform changes'] :
                  ['High-quality content', 'Trending topics', 'Improved user experience'],
      conversions: isDecrease ? ['CTA placement issues', 'Landing page problems', 'Price sensitivity'] :
                   ['Better targeting', 'Improved offers', 'Enhanced user journey']
    };

    return causes[metric as keyof typeof causes] || ['Unknown factors', 'External market changes'];
  }

  private generateRecommendedActions(metric: string, isDecrease: boolean): string[] {
    const actions = {
      views: isDecrease ? ['Review SEO strategy', 'Analyze competitor content', 'Update content freshness'] :
             ['Scale successful content', 'Analyze traffic sources', 'Maintain momentum'],
      engagement: isDecrease ? ['Improve content quality', 'A/B test different formats', 'Survey audience preferences'] :
                  ['Replicate successful formats', 'Engage with active users', 'Create series content'],
      conversions: isDecrease ? ['Optimize conversion funnel', 'Test different CTAs', 'Review pricing strategy'] :
                   ['Scale successful campaigns', 'Document best practices', 'Expand to similar audiences']
    };

    return actions[metric as keyof typeof actions] || ['Monitor closely', 'Investigate root causes', 'Implement testing'];
  }

  private getFallbackMarketIntelligence(): MarketIntelligence {
    return {
      marketTrends: this.getFallbackTrends(),
      competitorMovements: [
        { competitor: 'Competitor A', action: 'Launched new content series', impact: 15, ourResponse: 'Create competing content with unique angle' }
      ],
      emergingOpportunities: [],
      riskFactors: [
        { risk: 'Market saturation', probability: 40, impact: 60, mitigation: 'Focus on niche differentiation' }
      ],
      industryInsights: ['AI integration becoming standard', 'Video content gaining prominence'],
      generatedAt: new Date().toISOString()
    };
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();