
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface IntentAnalysisResult {
  keyword: string;
  primaryIntent: SearchIntent;
  secondaryIntent?: SearchIntent;
  confidence: number;
  userJourneyStage: 'awareness' | 'consideration' | 'decision' | 'retention';
  contentType: ContentTypeRecommendation;
  optimizationTips: string[];
}

export interface ContentTypeRecommendation {
  primaryType: 'blog-post' | 'landing-page' | 'product-page' | 'comparison' | 'tutorial' | 'faq';
  format: 'long-form' | 'short-form' | 'listicle' | 'how-to' | 'video-script';
  cta: 'learn-more' | 'sign-up' | 'buy-now' | 'compare' | 'download' | 'contact';
}

export type SearchIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';

export interface IntentPatterns {
  informational: string[];
  navigational: string[];
  commercial: string[];
  transactional: string[];
}

/**
 * Advanced search intent analyzer using AI and pattern matching
 */
export class SearchIntentAnalyzer {
  private static instance: SearchIntentAnalyzer;
  
  private intentPatterns: IntentPatterns = {
    informational: [
      'how to', 'what is', 'why', 'when', 'where', 'guide', 'tutorial', 'tips',
      'learn', 'understand', 'explain', 'definition', 'meaning', 'examples'
    ],
    navigational: [
      'login', 'sign in', 'website', 'official', 'homepage', 'contact',
      'support', 'customer service', 'phone number', 'address'
    ],
    commercial: [
      'best', 'top', 'review', 'compare', 'vs', 'alternative', 'options',
      'recommendation', 'pros and cons', 'which', 'should I', 'better'
    ],
    transactional: [
      'buy', 'purchase', 'order', 'price', 'cost', 'cheap', 'discount',
      'deal', 'sale', 'coupon', 'free trial', 'subscription', 'hire'
    ]
  };

  static getInstance(): SearchIntentAnalyzer {
    if (!SearchIntentAnalyzer.instance) {
      SearchIntentAnalyzer.instance = new SearchIntentAnalyzer();
    }
    return SearchIntentAnalyzer.instance;
  }

  /**
   * Analyze search intent for a single keyword
   */
  async analyzeIntent(
    keyword: string,
    context?: string,
    provider: AiProvider = 'openai'
  ): Promise<IntentAnalysisResult> {
    try {
      // First try pattern matching for quick results
      const patternResult = this.analyzeWithPatterns(keyword);
      
      // Enhance with AI analysis for better accuracy
      const aiResult = await this.analyzeWithAI(keyword, context, provider);
      
      // Combine results
      return this.combineAnalysisResults(keyword, patternResult, aiResult);
      
    } catch (error) {
      console.error('Error analyzing search intent:', error);
      // Fallback to pattern matching only
      return this.analyzeWithPatterns(keyword);
    }
  }

  /**
   * Batch analyze multiple keywords
   */
  async batchAnalyzeIntent(
    keywords: string[],
    context?: string,
    provider: AiProvider = 'openai'
  ): Promise<IntentAnalysisResult[]> {
    if (keywords.length === 0) return [];

    try {
      const prompt = this.createBatchAnalysisPrompt(keywords, context);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO analyst specializing in search intent classification. 
            Analyze keywords and classify their search intent with high accuracy.
            Always respond with valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        maxTokens: 2500
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from intent analysis');
      }

      return this.parseBatchAnalysisResponse(response.choices[0].message.content, keywords);
      
    } catch (error) {
      console.error('Error in batch intent analysis:', error);
      // Fallback to individual pattern analysis
      return keywords.map(keyword => this.analyzeWithPatterns(keyword));
    }
  }

  /**
   * Get content recommendations based on intent
   */
  getContentRecommendations(intent: SearchIntent, userJourneyStage: string): ContentTypeRecommendation {
    const recommendations: Record<SearchIntent, ContentTypeRecommendation> = {
      informational: {
        primaryType: 'blog-post',
        format: 'long-form',
        cta: 'learn-more'
      },
      navigational: {
        primaryType: 'landing-page',
        format: 'short-form',
        cta: 'contact'
      },
      commercial: {
        primaryType: 'comparison',
        format: 'listicle',
        cta: 'compare'
      },
      transactional: {
        primaryType: 'product-page',
        format: 'short-form',
        cta: 'buy-now'
      }
    };

    return recommendations[intent];
  }

  /**
   * Get optimization tips based on intent
   */
  getOptimizationTips(intent: SearchIntent, keyword: string): string[] {
    const tipsByIntent: Record<SearchIntent, string[]> = {
      informational: [
        'Focus on comprehensive, educational content',
        'Use clear headings and structure',
        'Include related questions and answers',
        'Optimize for featured snippets',
        'Add internal links to related topics'
      ],
      navigational: [
        'Ensure clear brand messaging',
        'Optimize page loading speed',
        'Include contact information prominently',
        'Use schema markup for organization info',
        'Maintain consistent NAP (Name, Address, Phone)'
      ],
      commercial: [
        'Include comparison tables and pros/cons',
        'Add customer reviews and testimonials',
        'Use clear product images and descriptions',
        'Include pricing information',
        'Add trust signals and certifications'
      ],
      transactional: [
        'Optimize for conversion with clear CTAs',
        'Include product specifications and pricing',
        'Add customer reviews and ratings',
        'Ensure secure checkout process',
        'Use urgency and scarcity tactics appropriately'
      ]
    };

    return tipsByIntent[intent] || [];
  }

  private analyzeWithPatterns(keyword: string): IntentAnalysisResult {
    const lowerKeyword = keyword.toLowerCase();
    let primaryIntent: SearchIntent = 'informational';
    let confidence = 0.6;

    // Calculate scores for each intent
    const scores = {
      informational: this.calculatePatternScore(lowerKeyword, this.intentPatterns.informational),
      navigational: this.calculatePatternScore(lowerKeyword, this.intentPatterns.navigational),
      commercial: this.calculatePatternScore(lowerKeyword, this.intentPatterns.commercial),
      transactional: this.calculatePatternScore(lowerKeyword, this.intentPatterns.transactional)
    };

    // Find highest scoring intent
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      primaryIntent = Object.keys(scores).find(
        intent => scores[intent as SearchIntent] === maxScore
      ) as SearchIntent;
      confidence = Math.min(0.9, 0.6 + (maxScore * 0.3));
    }

    const userJourneyStage = this.determineUserJourneyStage(primaryIntent);
    const contentType = this.getContentRecommendations(primaryIntent, userJourneyStage);
    const optimizationTips = this.getOptimizationTips(primaryIntent, keyword);

    return {
      keyword,
      primaryIntent,
      confidence,
      userJourneyStage,
      contentType,
      optimizationTips
    };
  }

  private calculatePatternScore(keyword: string, patterns: string[]): number {
    let score = 0;
    for (const pattern of patterns) {
      if (keyword.includes(pattern)) {
        score += 1;
      }
    }
    return score / patterns.length;
  }

  private determineUserJourneyStage(intent: SearchIntent): 'awareness' | 'consideration' | 'decision' | 'retention' {
    const stageMap: Record<SearchIntent, 'awareness' | 'consideration' | 'decision' | 'retention'> = {
      informational: 'awareness',
      navigational: 'decision',
      commercial: 'consideration',
      transactional: 'decision'
    };
    
    return stageMap[intent];
  }

  private async analyzeWithAI(
    keyword: string,
    context?: string,
    provider: AiProvider = 'openai'
  ): Promise<Partial<IntentAnalysisResult>> {
    const prompt = this.createIntentAnalysisPrompt(keyword, context);
    
    const response = await sendChatRequest(provider, {
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing search intent. Classify keywords accurately into informational, navigational, commercial, or transactional intent. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      maxTokens: 500
    });

    if (!response?.choices?.[0]?.message?.content) {
      return {};
    }

    return this.parseAIIntentResponse(response.choices[0].message.content);
  }

  private createIntentAnalysisPrompt(keyword: string, context?: string): string {
    return `Analyze the search intent for this keyword: "${keyword}"
    ${context ? `Context: ${context}` : ''}

    Classify into one of these intents:
    - informational: seeking information, learning, how-to
    - navigational: looking for a specific website or brand
    - commercial: researching before buying, comparing options
    - transactional: ready to buy, purchase intent

    Return JSON:
    {
      "intent": "informational|navigational|commercial|transactional",
      "confidence": 0.85,
      "reasoning": "explanation of classification"
    }`;
  }

  private createBatchAnalysisPrompt(keywords: string[], context?: string): string {
    return `Analyze search intent for these keywords:
    ${keywords.map((kw, i) => `${i + 1}. ${kw}`).join('\n')}
    
    ${context ? `Context: ${context}` : ''}

    For each keyword, classify intent and provide confidence score.

    Return JSON:
    {
      "results": [
        {
          "keyword": "keyword1",
          "intent": "informational|navigational|commercial|transactional",
          "confidence": 0.85,
          "userJourneyStage": "awareness|consideration|decision|retention"
        }
      ]
    }`;
  }

  private parseAIIntentResponse(response: string): Partial<IntentAnalysisResult> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          primaryIntent: parsed.intent,
          confidence: parsed.confidence || 0.7
        };
      }
    } catch (error) {
      console.error('Error parsing AI intent response:', error);
    }
    return {};
  }

  private parseBatchAnalysisResponse(response: string, keywords: string[]): IntentAnalysisResult[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const results = parsed.results || [];
        
        return results.map((result: any, index: number) => {
          const keyword = result.keyword || keywords[index];
          const primaryIntent = result.intent || 'informational';
          const confidence = result.confidence || 0.7;
          const userJourneyStage = result.userJourneyStage || this.determineUserJourneyStage(primaryIntent);
          
          return {
            keyword,
            primaryIntent,
            confidence,
            userJourneyStage,
            contentType: this.getContentRecommendations(primaryIntent, userJourneyStage),
            optimizationTips: this.getOptimizationTips(primaryIntent, keyword)
          };
        });
      }
    } catch (error) {
      console.error('Error parsing batch analysis response:', error);
    }
    
    // Fallback to pattern analysis
    return keywords.map(keyword => this.analyzeWithPatterns(keyword));
  }

  private combineAnalysisResults(
    keyword: string,
    patternResult: IntentAnalysisResult,
    aiResult: Partial<IntentAnalysisResult>
  ): IntentAnalysisResult {
    return {
      keyword,
      primaryIntent: aiResult.primaryIntent || patternResult.primaryIntent,
      confidence: Math.max(patternResult.confidence, aiResult.confidence || 0),
      userJourneyStage: patternResult.userJourneyStage,
      contentType: patternResult.contentType,
      optimizationTips: patternResult.optimizationTips
    };
  }
}

export const searchIntentAnalyzer = SearchIntentAnalyzer.getInstance();
