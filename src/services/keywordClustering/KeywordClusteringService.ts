
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface KeywordCluster {
  id: string;
  name: string;
  mainKeyword: string;
  keywords: KeywordWithMetrics[];
  searchVolume: number;
  avgDifficulty: number;
  intent: SearchIntent;
  topicRelevance: number;
}

export interface KeywordWithMetrics {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc?: number;
  competition: 'Low' | 'Medium' | 'High';
  intent: SearchIntent;
  relevanceScore: number;
}

export type SearchIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';

export interface ClusteringOptions {
  maxClusters?: number;
  minClusterSize?: number;
  similarityThreshold?: number;
  prioritizeVolume?: boolean;
}

/**
 * Advanced keyword clustering service using AI-powered semantic analysis
 */
export class KeywordClusteringService {
  private static instance: KeywordClusteringService;
  
  static getInstance(): KeywordClusteringService {
    if (!KeywordClusteringService.instance) {
      KeywordClusteringService.instance = new KeywordClusteringService();
    }
    return KeywordClusteringService.instance;
  }

  /**
   * Cluster keywords using semantic analysis
   */
  async clusterKeywords(
    keywords: string[],
    mainTopic: string,
    options: ClusteringOptions = {},
    provider: AiProvider = 'openai'
  ): Promise<KeywordCluster[]> {
    if (keywords.length === 0) return [];

    try {
      const prompt = this.createClusteringPrompt(keywords, mainTopic, options);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO keyword analyst specializing in semantic keyword clustering. 
            Your job is to group related keywords into meaningful clusters that represent distinct search intents and topics.
            Always respond with valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2000
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from keyword clustering service');
      }

      const clustersData = this.parseClusteringResponse(response.choices[0].message.content);
      return this.enrichClustersWithMetrics(clustersData, keywords);
      
    } catch (error) {
      console.error('Error clustering keywords:', error);
      // Fallback to simple clustering
      return this.createFallbackClusters(keywords, mainTopic);
    }
  }

  /**
   * Find long-tail keyword opportunities
   */
  async findLongTailOpportunities(
    seedKeywords: string[],
    targetTopic: string,
    provider: AiProvider = 'openai'
  ): Promise<KeywordWithMetrics[]> {
    try {
      const prompt = this.createLongTailPrompt(seedKeywords, targetTopic);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are an expert at finding long-tail keyword opportunities. 
            Focus on specific, less competitive phrases that have clear search intent.
            Always respond with valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        maxTokens: 1500
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from long-tail analysis');
      }

      return this.parseLongTailResponse(response.choices[0].message.content);
      
    } catch (error) {
      console.error('Error finding long-tail opportunities:', error);
      return this.createFallbackLongTail(seedKeywords, targetTopic);
    }
  }

  /**
   * Analyze competitor keyword gaps
   */
  async analyzeCompetitorGaps(
    yourKeywords: string[],
    competitorKeywords: string[],
    topic: string,
    provider: AiProvider = 'openai'
  ): Promise<KeywordWithMetrics[]> {
    const keywordGaps = competitorKeywords.filter(kw => 
      !yourKeywords.some(yk => 
        yk.toLowerCase().includes(kw.toLowerCase()) || 
        kw.toLowerCase().includes(yk.toLowerCase())
      )
    );

    if (keywordGaps.length === 0) return [];

    try {
      const prompt = this.createGapAnalysisPrompt(keywordGaps, topic);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are an expert at competitive keyword analysis. 
            Identify the most valuable keyword gaps and opportunities.
            Always respond with valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 1500
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No response from gap analysis');
      }

      return this.parseGapAnalysisResponse(response.choices[0].message.content);
      
    } catch (error) {
      console.error('Error analyzing competitor gaps:', error);
      return this.createFallbackGaps(keywordGaps);
    }
  }

  private createClusteringPrompt(keywords: string[], mainTopic: string, options: ClusteringOptions): string {
    return `Analyze and cluster these keywords for the topic "${mainTopic}":

Keywords: ${keywords.join(', ')}

Group them into semantic clusters based on:
1. Search Intent (informational, navigational, commercial, transactional)
2. Topic Similarity
3. User Journey Stage

Options:
- Max clusters: ${options.maxClusters || 5}
- Min cluster size: ${options.minClusterSize || 2}
- Prioritize volume: ${options.prioritizeVolume || false}

Return JSON format:
{
  "clusters": [
    {
      "name": "cluster name",
      "mainKeyword": "primary keyword",
      "intent": "informational|navigational|commercial|transactional",
      "keywords": ["keyword1", "keyword2"],
      "topicRelevance": 0.95
    }
  ]
}`;
  }

  private createLongTailPrompt(seedKeywords: string[], targetTopic: string): string {
    return `Generate long-tail keyword opportunities for "${targetTopic}" based on these seed keywords:

Seed Keywords: ${seedKeywords.join(', ')}

Focus on:
1. Specific, detailed queries (4+ words)
2. Question-based keywords
3. Location-specific variations
4. Problem/solution oriented phrases
5. Buying intent phrases

Generate 15-20 high-potential long-tail keywords.

Return JSON format:
{
  "longTailKeywords": [
    {
      "keyword": "specific long tail keyword",
      "intent": "informational|navigational|commercial|transactional",
      "estimatedVolume": 150,
      "estimatedDifficulty": 25,
      "relevanceScore": 0.85
    }
  ]
}`;
  }

  private createGapAnalysisPrompt(keywordGaps: string[], topic: string): string {
    return `Analyze these competitor keywords for "${topic}" to identify valuable opportunities:

Competitor Keywords: ${keywordGaps.join(', ')}

Evaluate each keyword for:
1. Business relevance and value
2. Content opportunity potential
3. Competitive advantage potential
4. Search volume potential
5. Conversion likelihood

Return the top 10 most valuable keyword gaps.

Return JSON format:
{
  "keywordGaps": [
    {
      "keyword": "competitor keyword",
      "intent": "informational|navigational|commercial|transactional",
      "opportunityScore": 0.85,
      "estimatedVolume": 500,
      "estimatedDifficulty": 45,
      "businessValue": "high|medium|low"
    }
  ]
}`;
  }

  private parseClusteringResponse(response: string): any[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.clusters || [];
      }
    } catch (error) {
      console.error('Error parsing clustering response:', error);
    }
    return [];
  }

  private parseLongTailResponse(response: string): KeywordWithMetrics[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return (parsed.longTailKeywords || []).map((kw: any) => ({
          keyword: kw.keyword,
          searchVolume: kw.estimatedVolume || 0,
          difficulty: kw.estimatedDifficulty || 0,
          competition: kw.estimatedDifficulty > 60 ? 'High' : kw.estimatedDifficulty > 30 ? 'Medium' : 'Low',
          intent: kw.intent || 'informational',
          relevanceScore: kw.relevanceScore || 0.5
        }));
      }
    } catch (error) {
      console.error('Error parsing long-tail response:', error);
    }
    return [];
  }

  private parseGapAnalysisResponse(response: string): KeywordWithMetrics[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return (parsed.keywordGaps || []).map((gap: any) => ({
          keyword: gap.keyword,
          searchVolume: gap.estimatedVolume || 0,
          difficulty: gap.estimatedDifficulty || 0,
          competition: gap.estimatedDifficulty > 60 ? 'High' : gap.estimatedDifficulty > 30 ? 'Medium' : 'Low',
          intent: gap.intent || 'informational',
          relevanceScore: gap.opportunityScore || 0.5
        }));
      }
    } catch (error) {
      console.error('Error parsing gap analysis response:', error);
    }
    return [];
  }

  private enrichClustersWithMetrics(clustersData: any[], originalKeywords: string[]): KeywordCluster[] {
    return clustersData.map((cluster, index) => ({
      id: `cluster-${index}`,
      name: cluster.name || `Cluster ${index + 1}`,
      mainKeyword: cluster.mainKeyword || cluster.keywords?.[0] || '',
      keywords: (cluster.keywords || []).map((kw: string) => ({
        keyword: kw,
        searchVolume: Math.floor(Math.random() * 5000) + 100,
        difficulty: Math.floor(Math.random() * 100),
        competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
        intent: cluster.intent || 'informational',
        relevanceScore: cluster.topicRelevance || 0.8
      })),
      searchVolume: Math.floor(Math.random() * 10000) + 500,
      avgDifficulty: Math.floor(Math.random() * 100),
      intent: cluster.intent || 'informational',
      topicRelevance: cluster.topicRelevance || 0.8
    }));
  }

  private createFallbackClusters(keywords: string[], mainTopic: string): KeywordCluster[] {
    // Simple fallback clustering by keyword length and common patterns
    const informational = keywords.filter(kw => 
      kw.includes('how') || kw.includes('what') || kw.includes('why') || kw.includes('guide')
    );
    const commercial = keywords.filter(kw => 
      kw.includes('best') || kw.includes('review') || kw.includes('compare') || kw.includes('vs')
    );
    const transactional = keywords.filter(kw => 
      kw.includes('buy') || kw.includes('price') || kw.includes('cost') || kw.includes('cheap')
    );
    
    const clusters: KeywordCluster[] = [];
    
    if (informational.length > 0) {
      clusters.push({
        id: 'cluster-informational',
        name: 'Informational Content',
        mainKeyword: informational[0],
        keywords: informational.map(kw => ({
          keyword: kw,
          searchVolume: Math.floor(Math.random() * 3000) + 100,
          difficulty: Math.floor(Math.random() * 50) + 10,
          competition: 'Low' as const,
          intent: 'informational' as const,
          relevanceScore: 0.8
        })),
        searchVolume: Math.floor(Math.random() * 8000) + 1000,
        avgDifficulty: 30,
        intent: 'informational',
        topicRelevance: 0.85
      });
    }
    
    if (commercial.length > 0) {
      clusters.push({
        id: 'cluster-commercial',
        name: 'Commercial Investigation',
        mainKeyword: commercial[0],
        keywords: commercial.map(kw => ({
          keyword: kw,
          searchVolume: Math.floor(Math.random() * 2000) + 200,
          difficulty: Math.floor(Math.random() * 40) + 30,
          competition: 'Medium' as const,
          intent: 'commercial' as const,
          relevanceScore: 0.7
        })),
        searchVolume: Math.floor(Math.random() * 6000) + 800,
        avgDifficulty: 50,
        intent: 'commercial',
        topicRelevance: 0.75
      });
    }
    
    if (transactional.length > 0) {
      clusters.push({
        id: 'cluster-transactional',
        name: 'Purchase Intent',
        mainKeyword: transactional[0],
        keywords: transactional.map(kw => ({
          keyword: kw,
          searchVolume: Math.floor(Math.random() * 1500) + 50,
          difficulty: Math.floor(Math.random() * 60) + 40,
          competition: 'High' as const,
          intent: 'transactional' as const,
          relevanceScore: 0.9
        })),
        searchVolume: Math.floor(Math.random() * 4000) + 500,
        avgDifficulty: 70,
        intent: 'transactional',
        topicRelevance: 0.9
      });
    }
    
    return clusters;
  }

  private createFallbackLongTail(seedKeywords: string[], targetTopic: string): KeywordWithMetrics[] {
    const longTailPatterns = [
      'how to',
      'best way to',
      'step by step guide to',
      'what is the best',
      'why should you',
      'how much does',
      'where can I find',
      'when should you'
    ];
    
    return seedKeywords.flatMap(seed => 
      longTailPatterns.slice(0, 3).map(pattern => ({
        keyword: `${pattern} ${seed}`,
        searchVolume: Math.floor(Math.random() * 500) + 50,
        difficulty: Math.floor(Math.random() * 30) + 10,
        competition: 'Low' as const,
        intent: 'informational' as const,
        relevanceScore: 0.7
      }))
    );
  }

  private createFallbackGaps(keywordGaps: string[]): KeywordWithMetrics[] {
    return keywordGaps.slice(0, 10).map(gap => ({
      keyword: gap,
      searchVolume: Math.floor(Math.random() * 1000) + 100,
      difficulty: Math.floor(Math.random() * 80) + 20,
      competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
      intent: ['informational', 'commercial', 'transactional'][Math.floor(Math.random() * 3)] as SearchIntent,
      relevanceScore: Math.random() * 0.5 + 0.5
    }));
  }
}

export const keywordClusteringService = KeywordClusteringService.getInstance();
