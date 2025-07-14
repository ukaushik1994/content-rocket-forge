
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface SerpFeatureOpportunity {
  id: string;
  featureType: 'featured_snippet' | 'people_also_ask' | 'image_pack' | 'video' | 'local_pack' | 'shopping' | 'news';
  opportunity: string;
  difficulty: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  optimizationSteps: string[];
  contentFormat: string;
  schemaRecommendation?: string;
  currentHolder?: string;
  weaknesses?: string[];
  keywords: string[];
  estimatedTraffic: number;
}

export interface PAAOptimization {
  question: string;
  currentAnswer?: string;
  currentSource?: string;
  improvementOpportunity: string;
  optimizedFormat: 'paragraph' | 'list' | 'table';
  contentLength: string;
  keywords: string[];
  relatedQuestions: string[];
}

export interface StructuredDataRecommendation {
  schemaType: string;
  priority: 'high' | 'medium' | 'low';
  implementation: string;
  benefits: string[];
  markup: string;
}

export class SerpFeatureAnalyzer {
  /**
   * Analyze SERP features for optimization opportunities
   */
  static async analyzeFeatures(
    keyword: string,
    serpData: any,
    provider: AiProvider = 'openai'
  ): Promise<SerpFeatureOpportunity[]> {
    try {
      console.log(`🎯 Analyzing SERP features for: ${keyword}`);
      
      const prompt = this.createFeatureAnalysisPrompt(keyword, serpData);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO specialist focusing on SERP feature optimization. Analyze current SERP features and identify specific optimization opportunities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 3000
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from SERP feature analysis');
      }

      return this.parseFeatureOpportunities(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in SERP feature analysis:', error);
      return this.createFallbackOpportunities(keyword);
    }
  }

  /**
   * Optimize People Also Ask questions
   */
  static async optimizePAA(
    paaQuestions: string[],
    keyword: string,
    competitorData: any[],
    provider: AiProvider = 'openai'
  ): Promise<PAAOptimization[]> {
    if (paaQuestions.length === 0) return [];

    try {
      const prompt = this.createPAAOptimizationPrompt(paaQuestions, keyword, competitorData);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert at optimizing content for People Also Ask (PAA) questions and featured snippets. Focus on specific, actionable optimization strategies.'
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
        throw new Error('No response from PAA optimization');
      }

      return this.parsePAAOptimizations(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in PAA optimization:', error);
      return paaQuestions.map(q => this.createFallbackPAAOptimization(q));
    }
  }

  /**
   * Generate structured data recommendations
   */
  static async generateStructuredDataRecommendations(
    keyword: string,
    contentType: string,
    businessType?: string,
    provider: AiProvider = 'openai'
  ): Promise<StructuredDataRecommendation[]> {
    try {
      const prompt = this.createStructuredDataPrompt(keyword, contentType, businessType);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert in structured data and schema markup. Provide specific, implementable schema recommendations for better SERP visibility.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        maxTokens: 2000
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from structured data analysis');
      }

      return this.parseStructuredDataRecommendations(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in structured data recommendations:', error);
      return this.createFallbackStructuredData(contentType);
    }
  }

  private static createFeatureAnalysisPrompt(keyword: string, serpData: any): string {
    const features = [];
    if (serpData.featuredSnippets?.length > 0) {
      features.push(`Featured Snippets: ${serpData.featuredSnippets.length} found`);
    }
    if (serpData.peopleAlsoAsk?.length > 0) {
      features.push(`People Also Ask: ${serpData.peopleAlsoAsk.length} questions`);
    }
    if (serpData.multimedia?.images?.length > 0) {
      features.push(`Image Pack: ${serpData.multimedia.images.length} images`);
    }

    return `Analyze SERP features for "${keyword}" and identify optimization opportunities:

CURRENT SERP FEATURES:
${features.join('\n')}

FEATURED SNIPPETS:
${serpData.featuredSnippets?.map((snippet: any, i: number) => 
  `${i + 1}. Type: ${snippet.type}, Source: ${snippet.source}`
).join('\n') || 'None found'}

PEOPLE ALSO ASK:
${serpData.peopleAlsoAsk?.map((q: any, i: number) => 
  `${i + 1}. ${q.question}`
).join('\n') || 'None found'}

For each feature, analyze:
1. Current state and holder
2. Optimization opportunity (difficulty/impact)
3. Specific steps to optimize
4. Content format recommendations
5. Schema markup suggestions
6. Keywords to target
7. Estimated traffic potential

Response format:
{
  "opportunities": [
    {
      "featureType": "featured_snippet",
      "opportunity": "Target definition snippet for main keyword",
      "difficulty": "medium",
      "impact": "high",
      "optimizationSteps": ["step1", "step2"],
      "contentFormat": "Definition paragraph with bullet points",
      "schemaRecommendation": "FAQ Schema",
      "currentHolder": "example.com",
      "weaknesses": ["outdated info", "poor formatting"],
      "keywords": ["keyword1", "keyword2"],
      "estimatedTraffic": 500
    }
  ]
}`;
  }

  private static createPAAOptimizationPrompt(
    paaQuestions: string[],
    keyword: string,
    competitorData: any[]
  ): string {
    const competitorSummary = competitorData.slice(0, 3).map((comp, i) => 
      `Competitor ${i + 1}: ${comp.title}\nSnippet: ${comp.snippet || 'No snippet'}\n`
    ).join('\n');

    return `Optimize these People Also Ask questions for "${keyword}":

PAA QUESTIONS:
${paaQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

COMPETITOR CONTEXT:
${competitorSummary}

For each question, provide:
1. Current answer analysis (if available)
2. Improvement opportunity
3. Optimal answer format (paragraph/list/table)
4. Recommended content length
5. Keywords to include
6. Related questions to address

Response format:
{
  "optimizations": [
    {
      "question": "original question",
      "currentAnswer": "current answer if available",
      "currentSource": "source domain",
      "improvementOpportunity": "how to improve",
      "optimizedFormat": "paragraph",
      "contentLength": "50-75 words",
      "keywords": ["keyword1", "keyword2"],
      "relatedQuestions": ["related1", "related2"]
    }
  ]
}`;
  }

  private static createStructuredDataPrompt(
    keyword: string,
    contentType: string,
    businessType?: string
  ): string {
    return `Generate structured data recommendations for "${keyword}" content:

CONTENT TYPE: ${contentType}
BUSINESS TYPE: ${businessType || 'General'}

Recommend appropriate schema markup for:
1. Better SERP visibility
2. Rich snippets eligibility
3. Featured snippet targeting
4. Enhanced search results

For each recommendation, provide:
1. Schema type (FAQ, Article, HowTo, etc.)
2. Priority level
3. Implementation guidance
4. Expected benefits
5. Sample markup

Response format:
{
  "recommendations": [
    {
      "schemaType": "FAQ",
      "priority": "high",
      "implementation": "Add FAQ schema to Q&A sections",
      "benefits": ["Featured snippet eligibility", "PAA optimization"],
      "markup": "sample JSON-LD markup"
    }
  ]
}`;
  }

  private static parseFeatureOpportunities(response: string): SerpFeatureOpportunity[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.opportunities?.map((opp: any, index: number) => ({
        id: `feature-${index + 1}`,
        featureType: opp.featureType || 'featured_snippet',
        opportunity: opp.opportunity || 'Optimization opportunity',
        difficulty: opp.difficulty || 'medium',
        impact: opp.impact || 'medium',
        optimizationSteps: opp.optimizationSteps || [],
        contentFormat: opp.contentFormat || 'Standard format',
        schemaRecommendation: opp.schemaRecommendation,
        currentHolder: opp.currentHolder,
        weaknesses: opp.weaknesses || [],
        keywords: opp.keywords || [],
        estimatedTraffic: opp.estimatedTraffic || 0
      })) || [];
    } catch (error) {
      console.error('Error parsing feature opportunities:', error);
      return [];
    }
  }

  private static parsePAAOptimizations(response: string): PAAOptimization[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.optimizations?.map((opt: any) => ({
        question: opt.question || '',
        currentAnswer: opt.currentAnswer,
        currentSource: opt.currentSource,
        improvementOpportunity: opt.improvementOpportunity || 'Opportunity to improve',
        optimizedFormat: opt.optimizedFormat || 'paragraph',
        contentLength: opt.contentLength || '50-75 words',
        keywords: opt.keywords || [],
        relatedQuestions: opt.relatedQuestions || []
      })) || [];
    } catch (error) {
      console.error('Error parsing PAA optimizations:', error);
      return [];
    }
  }

  private static parseStructuredDataRecommendations(response: string): StructuredDataRecommendation[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.recommendations?.map((rec: any) => ({
        schemaType: rec.schemaType || 'Article',
        priority: rec.priority || 'medium',
        implementation: rec.implementation || 'Add structured data',
        benefits: rec.benefits || [],
        markup: rec.markup || '// Sample markup'
      })) || [];
    } catch (error) {
      console.error('Error parsing structured data recommendations:', error);
      return [];
    }
  }

  private static createFallbackOpportunities(keyword: string): SerpFeatureOpportunity[] {
    return [
      {
        id: 'fallback-1',
        featureType: 'featured_snippet',
        opportunity: `Target featured snippet for "${keyword}" definition`,
        difficulty: 'medium',
        impact: 'high',
        optimizationSteps: [
          'Create clear, concise definition',
          'Use structured formatting',
          'Include relevant keywords'
        ],
        contentFormat: 'Definition paragraph with bullet points',
        keywords: [keyword],
        estimatedTraffic: 200
      }
    ];
  }

  private static createFallbackPAAOptimization(question: string): PAAOptimization {
    return {
      question,
      improvementOpportunity: 'Provide comprehensive answer',
      optimizedFormat: 'paragraph',
      contentLength: '50-75 words',
      keywords: [],
      relatedQuestions: []
    };
  }

  private static createFallbackStructuredData(contentType: string): StructuredDataRecommendation[] {
    return [
      {
        schemaType: 'Article',
        priority: 'high',
        implementation: 'Add Article schema to main content',
        benefits: ['Better search visibility', 'Rich snippets'],
        markup: '// Article schema markup'
      }
    ];
  }
}
