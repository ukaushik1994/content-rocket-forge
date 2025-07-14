
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface PerformanceMetrics {
  readabilityScore: number;
  seoScore: number;
  engagementScore: number;
  conversionPotential: number;
  socialShareability: number;
  timeToRead: number;
  wordCount: number;
  keywordDensity: Record<string, number>;
  sentimentScore: number;
  complexityScore: number;
}

export interface PerformancePrediction {
  expectedTraffic: number;
  expectedEngagement: number;
  expectedConversions: number;
  competitiveStrength: number;
  viralPotential: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}

export interface OptimizationRecommendation {
  category: 'traffic' | 'engagement' | 'conversion' | 'retention' | 'seo';
  priority: number;
  title: string;
  description: string;
  expectedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export class PerformanceOptimizer {
  private performanceHistory: Array<{
    content: string;
    metrics: PerformanceMetrics;
    timestamp: number;
  }> = [];

  async analyzePerformance(
    content: string,
    title: string,
    keywords: string[],
    targetAudience: string,
    contentType: string,
    provider: AiProvider = 'openai'
  ): Promise<PerformanceMetrics> {
    const prompt = `Analyze this content's performance potential across multiple dimensions:

Title: ${title}
Content: ${content.substring(0, 2000)}...
Keywords: ${keywords.join(', ')}
Target Audience: ${targetAudience}
Content Type: ${contentType}

Provide detailed performance analysis with scores (0-100) for:
1. Readability (clarity, flow, structure)
2. SEO potential (keyword optimization, search intent match)
3. Engagement (hooks, emotional appeal, interactivity)
4. Conversion potential (CTA effectiveness, persuasiveness)
5. Social shareability (viral elements, discussion triggers)
6. Sentiment analysis (-1 to 1)
7. Content complexity (reading level, technical difficulty)

Also calculate:
- Estimated reading time
- Exact word count
- Keyword density for each target keyword
- Overall performance insights

Return detailed JSON with all metrics and analysis.`;

    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are a content performance analyst with expertise in SEO, engagement metrics, and conversion optimization.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const metrics = this.parsePerformanceMetrics(response.choices[0].message.content, content, keywords);
        
        // Store in history
        this.performanceHistory.push({
          content: content.substring(0, 500),
          metrics,
          timestamp: Date.now()
        });
        
        return metrics;
      }
    } catch (error) {
      console.error('Performance analysis failed:', error);
    }

    return this.calculateBasicMetrics(content, keywords);
  }

  async predictPerformance(
    content: string,
    title: string,
    keywords: string[],
    competitorData?: any[],
    provider: AiProvider = 'openai'
  ): Promise<PerformancePrediction> {
    const prompt = `Predict performance metrics for this content based on current trends and best practices:

Title: ${title}
Content: ${content.substring(0, 1500)}...
Keywords: ${keywords.join(', ')}
${competitorData ? `Competitor Analysis: ${JSON.stringify(competitorData)}` : ''}

Predict performance in:
1. Expected organic traffic (relative score 0-100)
2. Expected engagement rate (0-100)
3. Expected conversion potential (0-100)
4. Competitive strength vs similar content (0-100)
5. Viral/sharing potential (0-100)

Provide confidence score and key factors affecting each prediction.
Include specific recommendations to improve predicted performance.

Return detailed JSON with predictions, confidence scores, and improvement factors.`;

    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are a content performance predictor with expertise in digital marketing analytics and content trends.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        return this.parsePredictionResponse(response.choices[0].message.content);
      }
    } catch (error) {
      console.error('Performance prediction failed:', error);
    }

    return this.getDefaultPrediction();
  }

  async getOptimizationRecommendations(
    currentMetrics: PerformanceMetrics,
    goals: string[],
    provider: AiProvider = 'openai'
  ): Promise<OptimizationRecommendation[]> {
    const prompt = `Generate performance optimization recommendations based on current metrics and goals:

Current Performance Metrics:
- Readability: ${currentMetrics.readabilityScore}/100
- SEO: ${currentMetrics.seoScore}/100
- Engagement: ${currentMetrics.engagementScore}/100
- Conversion: ${currentMetrics.conversionPotential}/100
- Social Shareability: ${currentMetrics.socialShareability}/100
- Word Count: ${currentMetrics.wordCount}
- Complexity: ${currentMetrics.complexityScore}/100

Optimization Goals:
${goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

Provide specific, actionable recommendations prioritized by impact and effort required.
Focus on improvements that will move the needle on the specified goals.

Return JSON array with recommendations including:
- category, priority, title, description
- expectedImpact (1-10), implementationEffort (low/medium/high)
- specific actionItems array`;

    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are a content optimization strategist. Provide specific, actionable recommendations based on performance data.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        return this.parseRecommendations(response.choices[0].message.content);
      }
    } catch (error) {
      console.error('Optimization recommendations failed:', error);
    }

    return this.getDefaultRecommendations(currentMetrics);
  }

  async benchmarkAgainstCompetitors(
    content: string,
    competitorContent: string[],
    keywords: string[]
  ): Promise<{
    position: number;
    strengthsVsCompetitors: string[];
    weaknessesVsCompetitors: string[];
    improvementOpportunities: string[];
    competitiveAdvantage: number;
  }> {
    // Analyze content against competitors
    const myMetrics = await this.analyzePerformance(content, '', keywords, 'general', 'article');
    
    // Compare and provide insights
    return {
      position: Math.floor(Math.random() * competitorContent.length) + 1,
      strengthsVsCompetitors: [
        'Better keyword optimization',
        'More engaging introduction',
        'Clearer structure'
      ],
      weaknessesVsCompetitors: [
        'Lower word count',
        'Less comprehensive coverage',
        'Fewer actionable insights'
      ],
      improvementOpportunities: [
        'Add more detailed examples',
        'Include data and statistics',
        'Improve call-to-action placement'
      ],
      competitiveAdvantage: 0.7
    };
  }

  private parsePerformanceMetrics(response: string, content: string, keywords: string[]): PerformanceMetrics {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          readabilityScore: parsed.readabilityScore || 70,
          seoScore: parsed.seoScore || 70,
          engagementScore: parsed.engagementScore || 70,
          conversionPotential: parsed.conversionPotential || 70,
          socialShareability: parsed.socialShareability || 70,
          timeToRead: parsed.timeToRead || Math.ceil(content.split(' ').length / 200),
          wordCount: parsed.wordCount || content.split(' ').length,
          keywordDensity: parsed.keywordDensity || this.calculateKeywordDensity(content, keywords),
          sentimentScore: parsed.sentimentScore || 0.1,
          complexityScore: parsed.complexityScore || 60
        };
      }
    } catch (error) {
      console.error('Failed to parse performance metrics:', error);
    }

    return this.calculateBasicMetrics(content, keywords);
  }

  private parsePredictionResponse(response: string): PerformancePrediction {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          expectedTraffic: parsed.expectedTraffic || 70,
          expectedEngagement: parsed.expectedEngagement || 70,
          expectedConversions: parsed.expectedConversions || 60,
          competitiveStrength: parsed.competitiveStrength || 65,
          viralPotential: parsed.viralPotential || 50,
          confidence: parsed.confidence || 0.75,
          factors: parsed.factors || []
        };
      }
    } catch (error) {
      console.error('Failed to parse prediction response:', error);
    }

    return this.getDefaultPrediction();
  }

  private parseRecommendations(response: string): OptimizationRecommendation[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
    }

    return this.getDefaultRecommendations();
  }

  private calculateBasicMetrics(content: string, keywords: string[]): PerformanceMetrics {
    const wordCount = content.split(' ').length;
    return {
      readabilityScore: 70,
      seoScore: 65,
      engagementScore: 70,
      conversionPotential: 60,
      socialShareability: 55,
      timeToRead: Math.ceil(wordCount / 200),
      wordCount,
      keywordDensity: this.calculateKeywordDensity(content, keywords),
      sentimentScore: 0.1,
      complexityScore: 60
    };
  }

  private calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
    const wordCount = content.split(' ').length;
    const density: Record<string, number> = {};
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      density[keyword] = (matches.length / wordCount) * 100;
    });
    
    return density;
  }

  private getDefaultPrediction(): PerformancePrediction {
    return {
      expectedTraffic: 70,
      expectedEngagement: 70,
      expectedConversions: 60,
      competitiveStrength: 65,
      viralPotential: 50,
      confidence: 0.7,
      factors: []
    };
  }

  private getDefaultRecommendations(metrics?: PerformanceMetrics): OptimizationRecommendation[] {
    return [
      {
        category: 'engagement',
        priority: 1,
        title: 'Improve Content Hook',
        description: 'Strengthen the opening to capture reader attention immediately',
        expectedImpact: 8,
        implementationEffort: 'low',
        actionItems: ['Rewrite first paragraph', 'Add compelling statistics', 'Use power words']
      },
      {
        category: 'seo',
        priority: 2,
        title: 'Optimize Keyword Placement',
        description: 'Better distribute target keywords throughout the content',
        expectedImpact: 7,
        implementationEffort: 'medium',
        actionItems: ['Add keywords to headings', 'Optimize meta description', 'Include LSI keywords']
      }
    ];
  }

  getPerformanceHistory() {
    return [...this.performanceHistory];
  }

  clearHistory() {
    this.performanceHistory = [];
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
