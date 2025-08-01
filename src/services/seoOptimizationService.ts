
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { analyzeContentQuality, ContentQualityMetrics } from '@/services/contentQualityService';
import { detectAIContent } from '@/services/aiContentDetectionService';
import { analyzeSerpData, SerpAnalysisResult } from '@/services/serpAnalysisService';

export interface SeoOptimizationConfig {
  targetKeyword: string;
  secondaryKeywords: string[];
  contentType: 'article' | 'blog' | 'landing-page' | 'product-page';
  targetAudience: 'beginner' | 'intermediate' | 'expert';
  writingStyle: 'professional' | 'conversational' | 'technical' | 'casual';
}

export interface SeoAnalysisResults {
  overallScore: number;
  keywordScore: number;
  readabilityScore: number;
  structureScore: number;
  competitivenessScore: number;
  aiDetectionScore: number;
  contentLength: {
    current: number;
    recommended: number;
    status: 'too-short' | 'optimal' | 'too-long';
  };
  keywordDensity: {
    main: number;
    secondary: number[];
    status: 'low' | 'optimal' | 'high';
  };
  headingStructure: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasProperStructure: boolean;
  };
  qualityMetrics: ContentQualityMetrics;
}

export interface SeoRecommendation {
  id: string;
  type: 'critical' | 'major' | 'minor';
  category: 'keywords' | 'structure' | 'readability' | 'content' | 'technical';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  beforeText?: string;
  afterText?: string;
}

export class SeoOptimizationService {
  private provider: AiProvider = 'openai';

  async analyzeContent(
    content: string,
    config: SeoOptimizationConfig
  ): Promise<{
    analysis: SeoAnalysisResults;
    recommendations: SeoRecommendation[];
    serpData: SerpAnalysisResult | null;
  }> {
    try {
      // Run parallel analysis
      const [qualityMetrics, aiDetection, serpData] = await Promise.all([
        analyzeContentQuality(content, '', config.writingStyle, config.targetAudience),
        detectAIContent(content),
        this.fetchSerpData(config.targetKeyword)
      ]);

      // Calculate comprehensive SEO score
      const analysis = this.calculateSeoAnalysis(content, config, qualityMetrics, aiDetection);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(content, config, analysis);

      return {
        analysis,
        recommendations,
        serpData
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  }

  private calculateSeoAnalysis(
    content: string,
    config: SeoOptimizationConfig,
    qualityMetrics: ContentQualityMetrics | null,
    aiDetection: any
  ): SeoAnalysisResults {
    const words = content.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    // Keyword analysis
    const mainKeywordCount = this.countKeywordOccurrences(content, config.targetKeyword);
    const mainKeywordDensity = (mainKeywordCount / wordCount) * 100;
    
    const secondaryDensities = config.secondaryKeywords.map(keyword => {
      const count = this.countKeywordOccurrences(content, keyword);
      return (count / wordCount) * 100;
    });

    // Heading analysis
    const headingStructure = this.analyzeHeadingStructure(content);
    
    // Calculate individual scores
    const keywordScore = this.calculateKeywordScore(mainKeywordDensity, secondaryDensities);
    const readabilityScore = qualityMetrics?.readabilityScore || 50;
    const structureScore = qualityMetrics?.structureScore || 50;
    const aiDetectionScore = aiDetection?.confidenceScore ? (100 - aiDetection.confidenceScore) : 80;
    const competitivenessScore = 70; // Would be calculated from SERP data
    
    // Overall score (weighted average)
    const overallScore = Math.round(
      (keywordScore * 0.25) +
      (readabilityScore * 0.2) +
      (structureScore * 0.2) +
      (competitivenessScore * 0.15) +
      (aiDetectionScore * 0.2)
    );

    return {
      overallScore,
      keywordScore,
      readabilityScore,
      structureScore,
      competitivenessScore,
      aiDetectionScore,
      contentLength: {
        current: wordCount,
        recommended: this.getRecommendedWordCount(config.contentType),
        status: this.getContentLengthStatus(wordCount, config.contentType)
      },
      keywordDensity: {
        main: mainKeywordDensity,
        secondary: secondaryDensities,
        status: this.getKeywordDensityStatus(mainKeywordDensity)
      },
      headingStructure,
      qualityMetrics: qualityMetrics || {
        overallScore: 50,
        readabilityScore: 50,
        engagementScore: 50,
        seoScore: 50,
        structureScore: 50,
        brandVoiceScore: 50,
        recommendations: []
      }
    };
  }

  private async generateRecommendations(
    content: string,
    config: SeoOptimizationConfig,
    analysis: SeoAnalysisResults
  ): Promise<SeoRecommendation[]> {
    const recommendations: SeoRecommendation[] = [];

    // Keyword recommendations
    if (analysis.keywordDensity.status === 'low') {
      recommendations.push({
        id: 'keyword-density-low',
        type: 'major',
        category: 'keywords',
        title: 'Increase target keyword usage',
        description: `Your main keyword "${config.targetKeyword}" appears only ${analysis.keywordDensity.main.toFixed(1)}% of the time. Aim for 1.5-2.5% density.`,
        impact: 'high',
        effort: 'low',
        autoApplicable: true
      });
    }

    // Content length recommendations
    if (analysis.contentLength.status === 'too-short') {
      recommendations.push({
        id: 'content-length-short',
        type: 'major',
        category: 'content',
        title: 'Expand content length',
        description: `Your content is ${analysis.contentLength.current} words. For ${config.contentType}, aim for ${analysis.contentLength.recommended} words.`,
        impact: 'high',
        effort: 'high',
        autoApplicable: true
      });
    }

    // Heading structure recommendations
    if (!analysis.headingStructure.hasProperStructure) {
      recommendations.push({
        id: 'heading-structure',
        type: 'major',
        category: 'structure',
        title: 'Improve heading structure',
        description: 'Add proper heading hierarchy (H1, H2, H3) to improve content structure and SEO.',
        impact: 'medium',
        effort: 'medium',
        autoApplicable: true
      });
    }

    // AI-generated recommendations
    const aiRecommendations = await this.generateAIRecommendations(content, config, analysis);
    recommendations.push(...aiRecommendations);

    return recommendations.sort((a, b) => {
      const typeOrder = { critical: 3, major: 2, minor: 1 };
      return typeOrder[b.type] - typeOrder[a.type];
    });
  }

  private async generateAIRecommendations(
    content: string,
    config: SeoOptimizationConfig,
    analysis: SeoAnalysisResults
  ): Promise<SeoRecommendation[]> {
    try {
      const response = await sendChatRequest(this.provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content optimizer. Analyze content and provide specific, actionable recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this content and provide SEO recommendations:

CONTENT:
${content}

TARGET KEYWORD: ${config.targetKeyword}
SECONDARY KEYWORDS: ${config.secondaryKeywords.join(', ')}
CONTENT TYPE: ${config.contentType}
TARGET AUDIENCE: ${config.targetAudience}

CURRENT SCORES:
- Overall SEO Score: ${analysis.overallScore}/100
- Keyword Score: ${analysis.keywordScore}/100
- Readability Score: ${analysis.readabilityScore}/100

Provide 3-5 specific recommendations in JSON format:
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "critical|major|minor",
      "category": "keywords|structure|readability|content|technical",
      "title": "Short title",
      "description": "Detailed description of the issue and solution",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "autoApplicable": true|false
    }
  ]
}`
          }
        ],
        temperature: 0.3,
        maxTokens: 1500
      });

      if (response?.choices?.[0]?.message?.content) {
        const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed.recommendations || [];
        }
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    }

    return [];
  }

  private async fetchSerpData(keyword: string): Promise<SerpAnalysisResult | null> {
    try {
      return await analyzeSerpData(keyword, []);
    } catch (error) {
      console.error('Error fetching SERP data:', error);
      return null;
    }
  }

  private countKeywordOccurrences(content: string, keyword: string): number {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (content.match(regex) || []).length;
  }

  private analyzeHeadingStructure(content: string) {
    const h1Count = (content.match(/^# /gm) || []).length;
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    
    return {
      h1Count,
      h2Count,
      h3Count,
      hasProperStructure: h1Count === 1 && h2Count >= 2
    };
  }

  private calculateKeywordScore(mainDensity: number, secondaryDensities: number[]): number {
    const idealMainDensity = 2.0;
    const idealSecondaryDensity = 1.0;
    
    const mainScore = Math.max(0, 100 - Math.abs(mainDensity - idealMainDensity) * 20);
    const secondaryScore = secondaryDensities.length > 0 
      ? secondaryDensities.reduce((acc, density) => 
          acc + Math.max(0, 100 - Math.abs(density - idealSecondaryDensity) * 15), 0) / secondaryDensities.length
      : 50;
    
    return Math.round((mainScore * 0.7) + (secondaryScore * 0.3));
  }

  private getRecommendedWordCount(contentType: string): number {
    const recommendations = {
      'article': 1500,
      'blog': 1200,
      'landing-page': 800,
      'product-page': 600
    };
    return recommendations[contentType] || 1200;
  }

  private getContentLengthStatus(wordCount: number, contentType: string): 'too-short' | 'optimal' | 'too-long' {
    const recommended = this.getRecommendedWordCount(contentType);
    const minThreshold = recommended * 0.7;
    const maxThreshold = recommended * 1.5;
    
    if (wordCount < minThreshold) return 'too-short';
    if (wordCount > maxThreshold) return 'too-long';
    return 'optimal';
  }

  private getKeywordDensityStatus(density: number): 'low' | 'optimal' | 'high' {
    if (density < 1.5) return 'low';
    if (density > 2.5) return 'high';
    return 'optimal';
  }

  async applyRecommendation(content: string, recommendation: SeoRecommendation): Promise<string> {
    if (!recommendation.autoApplicable) {
      return content;
    }

    try {
      const response = await sendChatRequest(this.provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert content editor. Apply the specific SEO recommendation to improve the content while maintaining its quality and readability.'
          },
          {
            role: 'user',
            content: `Apply this SEO recommendation to the content:

RECOMMENDATION: ${recommendation.title}
DESCRIPTION: ${recommendation.description}

ORIGINAL CONTENT:
${content}

Return the improved content with the recommendation applied. Maintain the original structure and meaning while making the specified improvements.`
          }
        ],
        temperature: 0.4,
        maxTokens: 3000
      });

      return response?.choices?.[0]?.message?.content || content;
    } catch (error) {
      console.error('Error applying recommendation:', error);
      return content;
    }
  }
}

export const seoOptimizationService = new SeoOptimizationService();
