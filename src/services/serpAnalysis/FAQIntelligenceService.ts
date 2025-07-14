
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface FAQCluster {
  id: string;
  mainTopic: string;
  questions: EnhancedQuestion[];
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  funnelStage: 'awareness' | 'consideration' | 'decision';
  priority: 'high' | 'medium' | 'low';
  featuredSnippetOpportunity: number; // 0-100 score
  searchVolume: number;
  difficulty: number;
}

export interface EnhancedQuestion {
  question: string;
  variations: string[];
  intent: string;
  funnelStage: string;
  searchVolume?: number;
  difficulty?: number;
  featuredSnippetChance: number;
  relatedKeywords: string[];
  competitorAnswers: CompetitorAnswer[];
  optimizationScore: number;
}

export interface CompetitorAnswer {
  url: string;
  snippet: string;
  wordCount: number;
  structure: 'paragraph' | 'list' | 'table';
  hasSchema: boolean;
}

export class FAQIntelligenceService {
  /**
   * Cluster FAQ questions using ML-powered analysis
   */
  static async clusterQuestions(
    questions: string[],
    keyword: string,
    provider: AiProvider = 'openai'
  ): Promise<FAQCluster[]> {
    if (questions.length === 0) return [];

    try {
      const prompt = this.createClusteringPrompt(questions, keyword);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content strategist specializing in FAQ analysis and search intent classification. Analyze questions to create intelligent clusters based on topic, intent, and funnel stage.'
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
        throw new Error('No response from FAQ clustering analysis');
      }

      return this.parseFAQClusters(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in FAQ clustering:', error);
      return this.createFallbackClusters(questions, keyword);
    }
  }

  /**
   * Analyze individual questions for optimization opportunities
   */
  static async analyzeQuestions(
    questions: string[],
    competitorData: any[],
    provider: AiProvider = 'openai'
  ): Promise<EnhancedQuestion[]> {
    if (questions.length === 0) return [];

    try {
      const prompt = this.createQuestionAnalysisPrompt(questions, competitorData);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing FAQ questions for SEO optimization, featured snippet opportunities, and competitive analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        maxTokens: 4000
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from question analysis');
      }

      return this.parseEnhancedQuestions(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in question analysis:', error);
      return questions.map(q => this.createFallbackQuestion(q));
    }
  }

  /**
   * Score featured snippet opportunities
   */
  static scoreFeaturedSnippetOpportunity(question: string, competitorAnswers: CompetitorAnswer[]): number {
    let score = 50; // Base score

    // Check if current featured snippet exists
    const hasCurrentSnippet = competitorAnswers.some(answer => 
      answer.snippet && answer.snippet.length > 50
    );
    
    if (!hasCurrentSnippet) score += 30;

    // Analyze question structure for snippet-friendly formats
    if (question.toLowerCase().includes('how to') || 
        question.toLowerCase().includes('what is') ||
        question.toLowerCase().includes('steps to')) {
      score += 20;
    }

    // Check competitor answer quality
    const avgWordCount = competitorAnswers.reduce((sum, a) => sum + a.wordCount, 0) / competitorAnswers.length;
    if (avgWordCount < 100) score += 15; // Opportunity for better answers

    return Math.min(100, Math.max(0, score));
  }

  private static createClusteringPrompt(questions: string[], keyword: string): string {
    return `Analyze these FAQ questions for "${keyword}" and create intelligent clusters:

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Create clusters based on:
1. Topic similarity and semantic relationships
2. Search intent (informational, commercial, transactional, navigational)
3. Funnel stage (awareness, consideration, decision)
4. Featured snippet optimization potential

For each cluster, provide:
- Main topic/theme
- Questions in the cluster
- Primary intent and funnel stage
- Priority level (high/medium/low)
- Featured snippet opportunity score (0-100)

Response format:
{
  "clusters": [
    {
      "id": "cluster-1",
      "mainTopic": "Topic name",
      "questions": ["question1", "question2"],
      "intent": "informational",
      "funnelStage": "awareness",
      "priority": "high",
      "featuredSnippetOpportunity": 85,
      "searchVolume": 1000,
      "difficulty": 45
    }
  ]
}`;
  }

  private static createQuestionAnalysisPrompt(questions: string[], competitorData: any[]): string {
    const competitorSummary = competitorData.slice(0, 5).map((comp, i) => 
      `Competitor ${i + 1}: ${comp.title || 'Unknown'}\nSnippet: ${comp.snippet || 'No snippet'}\n`
    ).join('\n');

    return `Analyze these questions for SEO optimization opportunities:

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

COMPETITOR CONTEXT:
${competitorSummary}

For each question, analyze:
1. Question variations and related phrasings
2. Search intent and funnel stage
3. Featured snippet optimization potential
4. Related keywords that should be targeted
5. Competitor answer quality and gaps
6. Overall optimization score (0-100)

Response format:
{
  "questions": [
    {
      "question": "original question",
      "variations": ["variation1", "variation2"],
      "intent": "informational",
      "funnelStage": "awareness",
      "featuredSnippetChance": 75,
      "relatedKeywords": ["keyword1", "keyword2"],
      "optimizationScore": 85
    }
  ]
}`;
  }

  private static parseFAQClusters(response: string): FAQCluster[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.clusters?.map((cluster: any) => ({
        id: cluster.id || `cluster-${Math.random().toString(36).substr(2, 9)}`,
        mainTopic: cluster.mainTopic || 'Unnamed Topic',
        questions: cluster.questions?.map((q: string) => this.createFallbackQuestion(q)) || [],
        intent: cluster.intent || 'informational',
        funnelStage: cluster.funnelStage || 'awareness',
        priority: cluster.priority || 'medium',
        featuredSnippetOpportunity: cluster.featuredSnippetOpportunity || 50,
        searchVolume: cluster.searchVolume || 0,
        difficulty: cluster.difficulty || 50
      })) || [];
    } catch (error) {
      console.error('Error parsing FAQ clusters:', error);
      return [];
    }
  }

  private static parseEnhancedQuestions(response: string): EnhancedQuestion[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.questions?.map((q: any) => ({
        question: q.question || '',
        variations: q.variations || [],
        intent: q.intent || 'informational',
        funnelStage: q.funnelStage || 'awareness',
        featuredSnippetChance: q.featuredSnippetChance || 50,
        relatedKeywords: q.relatedKeywords || [],
        competitorAnswers: [],
        optimizationScore: q.optimizationScore || 50
      })) || [];
    } catch (error) {
      console.error('Error parsing enhanced questions:', error);
      return [];
    }
  }

  private static createFallbackClusters(questions: string[], keyword: string): FAQCluster[] {
    // Simple fallback clustering by question type
    const howToQuestions = questions.filter(q => q.toLowerCase().includes('how to'));
    const whatIsQuestions = questions.filter(q => q.toLowerCase().includes('what is'));
    const otherQuestions = questions.filter(q => 
      !q.toLowerCase().includes('how to') && !q.toLowerCase().includes('what is')
    );

    const clusters: FAQCluster[] = [];

    if (howToQuestions.length > 0) {
      clusters.push({
        id: 'how-to-cluster',
        mainTopic: `How to ${keyword}`,
        questions: howToQuestions.map(q => this.createFallbackQuestion(q)),
        intent: 'informational',
        funnelStage: 'consideration',
        priority: 'high',
        featuredSnippetOpportunity: 80,
        searchVolume: 500,
        difficulty: 45
      });
    }

    if (whatIsQuestions.length > 0) {
      clusters.push({
        id: 'what-is-cluster',
        mainTopic: `Understanding ${keyword}`,
        questions: whatIsQuestions.map(q => this.createFallbackQuestion(q)),
        intent: 'informational',
        funnelStage: 'awareness',
        priority: 'medium',
        featuredSnippetOpportunity: 75,
        searchVolume: 300,
        difficulty: 40
      });
    }

    if (otherQuestions.length > 0) {
      clusters.push({
        id: 'general-cluster',
        mainTopic: `${keyword} General Questions`,
        questions: otherQuestions.map(q => this.createFallbackQuestion(q)),
        intent: 'informational',
        funnelStage: 'awareness',
        priority: 'medium',
        featuredSnippetOpportunity: 60,
        searchVolume: 200,
        difficulty: 50
      });
    }

    return clusters;
  }

  private static createFallbackQuestion(question: string): EnhancedQuestion {
    return {
      question,
      variations: [],
      intent: 'informational',
      funnelStage: 'awareness',
      featuredSnippetChance: 50,
      relatedKeywords: [],
      competitorAnswers: [],
      optimizationScore: 50
    };
  }
}
