import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';

export interface PerformancePrediction {
  estimatedTraffic: {
    min: number;
    max: number;
    average: number;
  };
  estimatedRanking: {
    keyword: string;
    currentPosition?: number;
    predictedPosition: number;
    confidence: number;
  }[];
  competitionLevel: 'low' | 'medium' | 'high' | 'very-high';
  successProbability: number;
  timeToRank: {
    days: number;
    confidence: number;
  };
  recommendations: string[];
  topicGaps: TopicGap[];
  searchIntentMatch: {
    score: number;
    primaryIntent: 'informational' | 'navigational' | 'transactional' | 'commercial';
    recommendations: string[];
  };
}

export interface TopicGap {
  topic: string;
  relevanceScore: number;
  searchVolume?: number;
  currentCoverage: number;
  suggestedContent: string;
}

export interface CompetitorAnalysis {
  url: string;
  title: string;
  position: number;
  contentLength: number;
  keywordUsage: number;
  domainAuthority?: number;
  strengthScore: number;
  weaknesses: string[];
}

class ContentPerformancePredictionService {
  /**
   * Predict content performance based on historical data and AI analysis
   */
  async predictPerformance(
    content: string,
    title: string,
    keywords: string[],
    contentType: string = 'blog'
  ): Promise<PerformancePrediction> {
    try {
      // Fetch historical performance data
      const historicalData = await this.getHistoricalPerformance(keywords);
      
      // Get competitor analysis
      const competitorData = await this.getCompetitorAnalysis(keywords[0]);

      // AI-powered prediction
      const prompt = this.buildPredictionPrompt(
        content,
        title,
        keywords,
        contentType,
        historicalData,
        competitorData
      );

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.4,
      });

      const prediction = this.parsePredictionResponse(response.content);
      return prediction;
    } catch (error) {
      console.error('Performance prediction failed:', error);
      throw error;
    }
  }

  /**
   * Identify topic gaps compared to competitors
   */
  async identifyTopicGaps(
    mainKeyword: string,
    currentContent: string
  ): Promise<TopicGap[]> {
    try {
      const prompt = `
Analyze this content and identify topic gaps compared to top-ranking competitors.

Main Keyword: ${mainKeyword}
Current Content: ${currentContent.substring(0, 1500)}...

Identify 5-10 subtopics or angles that competitors cover but this content is missing.

Return ONLY a JSON array:
[
  {
    "topic": "string",
    "relevanceScore": 0-100,
    "currentCoverage": 0-100,
    "suggestedContent": "brief description of what to add"
  }
]
      `.trim();

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.5,
      });

      const gaps = this.extractJson(response.content) as TopicGap[];
      return gaps || [];
    } catch (error) {
      console.error('Topic gap identification failed:', error);
      return [];
    }
  }

  /**
   * Analyze search intent match
   */
  async analyzeSearchIntent(
    keyword: string,
    content: string
  ): Promise<PerformancePrediction['searchIntentMatch']> {
    try {
      const prompt = `
Analyze the search intent for this keyword and how well the content matches it.

Keyword: ${keyword}
Content Preview: ${content.substring(0, 1000)}...

Determine:
1. Primary search intent (informational, navigational, transactional, commercial)
2. Intent match score (0-100)
3. Recommendations to better align with search intent

Return ONLY valid JSON:
{
  "score": number,
  "primaryIntent": "informational|navigational|transactional|commercial",
  "recommendations": ["string"]
}
      `.trim();

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.3,
      });

      const intentData = this.extractJson(response.content);
      return {
        score: intentData?.score || 50,
        primaryIntent: intentData?.primaryIntent || 'informational',
        recommendations: intentData?.recommendations || [],
      };
    } catch (error) {
      console.error('Search intent analysis failed:', error);
      return {
        score: 50,
        primaryIntent: 'informational',
        recommendations: ['Unable to analyze search intent'],
      };
    }
  }

  /**
   * Get competitor analysis from SERP data
   */
  private async getCompetitorAnalysis(keyword: string): Promise<CompetitorAnalysis[]> {
    try {
      // Try to get cached SERP data
      const { data: serpData } = await supabase
        .from('raw_serp_data')
        .select('*')
        .eq('keyword', keyword)
        .order('cached_at', { ascending: false })
        .limit(1)
        .single();

      if (serpData && serpData.organic_results) {
        const results = Array.isArray(serpData.organic_results) ? serpData.organic_results : [];
        return results.slice(0, 10).map((result: any, idx: number) => ({
          url: result.url || '',
          title: result.title || '',
          position: idx + 1,
          contentLength: result.contentLength || 0,
          keywordUsage: result.keywordDensity || 0,
          strengthScore: 100 - (idx * 10),
          weaknesses: [],
        }));
      }

      return [];
    } catch (error) {
      console.error('Competitor analysis fetch failed:', error);
      return [];
    }
  }

  /**
   * Get historical performance data for similar content
   */
  private async getHistoricalPerformance(keywords: string[]): Promise<any> {
    try {
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!contentItems || contentItems.length === 0) {
        return { averageSeoScore: 50, averageTraffic: 0 };
      }

      const avgScore = contentItems.reduce((sum, item) => sum + (item.seo_score || 0), 0) / contentItems.length;
      
      return {
        averageSeoScore: Math.round(avgScore),
        totalContent: contentItems.length,
        keywords: keywords,
      };
    } catch (error) {
      console.error('Historical performance fetch failed:', error);
      return { averageSeoScore: 50, averageTraffic: 0 };
    }
  }

  private buildPredictionPrompt(
    content: string,
    title: string,
    keywords: string[],
    contentType: string,
    historicalData: any,
    competitorData: CompetitorAnalysis[]
  ): string {
    return `
Predict the performance of this ${contentType} content based on analysis.

Title: ${title}
Keywords: ${keywords.join(', ')}
Content Length: ${content.length} characters
Content Preview: ${content.substring(0, 1000)}...

Historical Performance Context:
- Average SEO Score: ${historicalData.averageSeoScore}
- Total Published Content: ${historicalData.totalContent}

Competitor Analysis (Top ${competitorData.length} results):
${competitorData.map((c, idx) => `${idx + 1}. ${c.title} - Position ${c.position}, Length: ${c.contentLength}`).join('\n')}

Predict:
1. Estimated traffic range (min, max, average monthly visits)
2. Predicted ranking positions for each keyword
3. Competition level (low, medium, high, very-high)
4. Success probability (0-100)
5. Time to rank (days)
6. Top 3-5 actionable recommendations

Return ONLY valid JSON:
{
  "estimatedTraffic": { "min": number, "max": number, "average": number },
  "estimatedRanking": [{ "keyword": "string", "predictedPosition": number, "confidence": number }],
  "competitionLevel": "low|medium|high|very-high",
  "successProbability": number,
  "timeToRank": { "days": number, "confidence": number },
  "recommendations": ["string"]
}
    `.trim();
  }

  private parsePredictionResponse(response: string): PerformancePrediction {
    const data = this.extractJson(response);
    
    return {
      estimatedTraffic: data?.estimatedTraffic || { min: 0, max: 100, average: 50 },
      estimatedRanking: data?.estimatedRanking || [],
      competitionLevel: data?.competitionLevel || 'medium',
      successProbability: data?.successProbability || 50,
      timeToRank: data?.timeToRank || { days: 90, confidence: 50 },
      recommendations: data?.recommendations || [],
      topicGaps: [],
      searchIntentMatch: {
        score: 50,
        primaryIntent: 'informational',
        recommendations: [],
      },
    };
  }

  private extractJson(text: string): Record<string, any> | null {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as Record<string, any>;
      }
      return JSON.parse(text) as Record<string, any>;
    } catch (error) {
      console.error('Failed to parse prediction JSON:', error);
      return null;
    }
  }
}

export const contentPerformancePredictionService = new ContentPerformancePredictionService();
