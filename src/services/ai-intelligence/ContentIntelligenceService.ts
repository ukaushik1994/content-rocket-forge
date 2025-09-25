import AIServiceController from '@/services/aiService/AIServiceController';
import { SeoAiResult } from '@/types/seo-ai';
import { analyzeContentItem } from '@/services/seoAiService';
import { ContentItemType } from '@/contexts/content/types';

export interface ContentIntelligenceScore {
  overall: number;
  seo: number;
  readability: number;
  engagement: number;
  competitiveness: number;
  predictedPerformance: number;
}

export interface CompetitiveAnalysis {
  topCompetitors: Array<{
    domain: string;
    score: number;
    gaps: string[];
    opportunities: string[];
  }>;
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface ContentOptimizationSuggestion {
  id: string;
  type: 'seo' | 'readability' | 'engagement' | 'structure' | 'competitive';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: number; // 0-100
  implementationEffort: 'low' | 'medium' | 'high';
  specificChanges: string[];
  aiReasoning: string;
}

export interface ContentIntelligenceResult {
  contentId: string;
  scores: ContentIntelligenceScore;
  competitiveAnalysis: CompetitiveAnalysis;
  optimizationSuggestions: ContentOptimizationSuggestion[];
  predictedMetrics: {
    trafficIncrease: number;
    engagementIncrease: number;
    conversionIncrease: number;
  };
  aiInsights: {
    contentGaps: string[];
    trendAlignment: number;
    audienceMatch: number;
    seasonalFactors: string[];
  };
  generatedAt: string;
}

class ContentIntelligenceService {
  private cache = new Map<string, ContentIntelligenceResult>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async analyzeContent(content: ContentItemType, includeCompetitive = true): Promise<ContentIntelligenceResult> {
    const cacheKey = `${content.id}@${content.updated_at || content.created_at}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - new Date(cached.generatedAt).getTime() < this.cacheExpiry) {
      return cached;
    }

    try {
      // Get base SEO analysis
      const seoResult = await analyzeContentItem(content);
      
      // Generate advanced AI analysis
      const aiAnalysis = await this.generateAdvancedAnalysis(content, seoResult);
      
      // Generate competitive analysis if requested
      const competitiveAnalysis = includeCompetitive 
        ? await this.generateCompetitiveAnalysis(content)
        : this.getDefaultCompetitiveAnalysis();

      // Generate optimization suggestions
      const optimizationSuggestions = await this.generateOptimizationSuggestions(
        content, 
        seoResult, 
        aiAnalysis,
        competitiveAnalysis
      );

      const result: ContentIntelligenceResult = {
        contentId: content.id,
        scores: {
          overall: this.calculateOverallScore(seoResult, aiAnalysis),
          seo: seoResult.scores.seo,
          readability: seoResult.scores.readability,
          engagement: aiAnalysis.engagementScore,
          competitiveness: aiAnalysis.competitivenessScore,
          predictedPerformance: aiAnalysis.predictedPerformance
        },
        competitiveAnalysis,
        optimizationSuggestions,
        predictedMetrics: aiAnalysis.predictedMetrics,
        aiInsights: aiAnalysis.insights,
        generatedAt: new Date().toISOString()
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Content intelligence analysis failed:', error);
      return this.getFallbackResult(content.id);
    }
  }

  private async generateAdvancedAnalysis(content: ContentItemType, seoResult: SeoAiResult) {
    const prompt = `Analyze this content for advanced intelligence metrics:

Title: ${content.title || 'Untitled'}
Content: ${content.content || ''}
SEO Score: ${seoResult.overallScore}
SEO Issues: ${seoResult.issues.map(i => i.message).join(', ')}

Provide analysis for:
1. Engagement potential (0-100)
2. Competitive positioning (0-100) 
3. Predicted performance (0-100)
4. Content gaps and opportunities
5. Trend alignment score (0-100)
6. Audience match score (0-100)
7. Predicted traffic/engagement/conversion increases (%)
8. Seasonal factors affecting performance

Return JSON only:
{
  "engagementScore": number,
  "competitivenessScore": number,
  "predictedPerformance": number,
  "predictedMetrics": {
    "trafficIncrease": number,
    "engagementIncrease": number, 
    "conversionIncrease": number
  },
  "insights": {
    "contentGaps": string[],
    "trendAlignment": number,
    "audienceMatch": number,
    "seasonalFactors": string[]
  }
}`;

    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'analysis',
        temperature: 0.2,
        max_tokens: 800
      });

      const parsed = this.parseJsonResponse(response?.content || '');
      return parsed || this.getDefaultAnalysis();
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getDefaultAnalysis();
    }
  }

  private async generateCompetitiveAnalysis(content: ContentItemType): Promise<CompetitiveAnalysis> {
    const prompt = `Analyze competitive landscape for this content:

Title: ${content.title}
Content: ${(content.content || '').substring(0, 1000)}...

Analyze competitive positioning and identify:
1. Top 3 competitor profiles (domain, score, gaps, opportunities)
2. Market position (leader/challenger/follower/niche)
3. Strength areas
4. Improvement areas

Return JSON only:
{
  "topCompetitors": [
    {"domain": "example.com", "score": number, "gaps": string[], "opportunities": string[]}
  ],
  "marketPosition": "leader"|"challenger"|"follower"|"niche",
  "strengthAreas": string[],
  "improvementAreas": string[]
}`;

    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'analysis',
        temperature: 0.3,
        max_tokens: 600
      });

      const parsed = this.parseJsonResponse(response?.content || '');
      return parsed || this.getDefaultCompetitiveAnalysis();
    } catch (error) {
      console.error('Competitive analysis failed:', error);
      return this.getDefaultCompetitiveAnalysis();
    }
  }

  private async generateOptimizationSuggestions(
    content: ContentItemType,
    seoResult: SeoAiResult,
    aiAnalysis: any,
    competitiveAnalysis: CompetitiveAnalysis
  ): Promise<ContentOptimizationSuggestion[]> {
    const prompt = `Generate specific optimization suggestions for this content:

Content Analysis:
- SEO Score: ${seoResult.overallScore}
- Engagement Score: ${aiAnalysis.engagementScore}
- Issues: ${seoResult.issues.map(i => i.message).join(', ')}
- Competitive Position: ${competitiveAnalysis.marketPosition}
- Improvement Areas: ${competitiveAnalysis.improvementAreas.join(', ')}

Generate 5-8 specific, actionable optimization suggestions.

Return JSON array:
[
  {
    "id": "unique-id",
    "type": "seo"|"readability"|"engagement"|"structure"|"competitive",
    "priority": "high"|"medium"|"low", 
    "title": "Clear action title",
    "description": "Detailed explanation",
    "expectedImpact": number (0-100),
    "implementationEffort": "low"|"medium"|"high",
    "specificChanges": ["change 1", "change 2"],
    "aiReasoning": "Why this suggestion will help"
  }
]`;

    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'optimization',
        temperature: 0.4,
        max_tokens: 1000
      });

      const parsed = this.parseJsonResponse(response?.content || '');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Optimization suggestions failed:', error);
      return [];
    }
  }

  private parseJsonResponse(text: string): any | null {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  private calculateOverallScore(seoResult: SeoAiResult, aiAnalysis: any): number {
    const weights = {
      seo: 0.3,
      readability: 0.2,
      engagement: 0.25,
      competitive: 0.15,
      predicted: 0.1
    };

    return Math.round(
      seoResult.scores.seo * weights.seo +
      seoResult.scores.readability * weights.readability +
      (aiAnalysis.engagementScore || 70) * weights.engagement +
      (aiAnalysis.competitivenessScore || 65) * weights.competitive +
      (aiAnalysis.predictedPerformance || 70) * weights.predicted
    );
  }

  private getDefaultAnalysis() {
    return {
      engagementScore: 70,
      competitivenessScore: 65,
      predictedPerformance: 72,
      predictedMetrics: { trafficIncrease: 15, engagementIncrease: 20, conversionIncrease: 10 },
      insights: { 
        contentGaps: ['Add more interactive elements'], 
        trendAlignment: 65, 
        audienceMatch: 70, 
        seasonalFactors: ['Consider seasonal trends'] 
      }
    };
  }

  private getDefaultCompetitiveAnalysis(): CompetitiveAnalysis {
    return {
      topCompetitors: [
        { domain: 'competitor1.com', score: 75, gaps: ['Content depth'], opportunities: ['Better SEO'] },
        { domain: 'competitor2.com', score: 70, gaps: ['User engagement'], opportunities: ['Mobile optimization'] }
      ],
      marketPosition: 'challenger',
      strengthAreas: ['Content quality', 'User experience'],
      improvementAreas: ['SEO optimization', 'Content frequency']
    };
  }

  private getFallbackResult(contentId: string): ContentIntelligenceResult {
    return {
      contentId,
      scores: { overall: 70, seo: 65, readability: 75, engagement: 70, competitiveness: 65, predictedPerformance: 70 },
      competitiveAnalysis: this.getDefaultCompetitiveAnalysis(),
      optimizationSuggestions: [],
      predictedMetrics: { trafficIncrease: 10, engagementIncrease: 15, conversionIncrease: 8 },
      aiInsights: { contentGaps: [], trendAlignment: 65, audienceMatch: 70, seasonalFactors: [] },
      generatedAt: new Date().toISOString()
    };
  }

  // Real-time scoring for live content editing
  async getRealtimeScore(contentText: string, title?: string): Promise<ContentIntelligenceScore> {
    const mockContent: ContentItemType = {
      id: 'realtime-analysis',
      title: title || 'Realtime Analysis',
      content: contentText,
      status: 'published',
      approval_status: 'approved',
      content_type: 'article',
      user_id: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const result = await this.analyzeContent(mockContent, false);
      return result.scores;
    } catch (error) {
      console.error('Realtime scoring failed:', error);
      return { overall: 60, seo: 60, readability: 65, engagement: 60, competitiveness: 55, predictedPerformance: 60 };
    }
  }
}

export const contentIntelligenceService = new ContentIntelligenceService();