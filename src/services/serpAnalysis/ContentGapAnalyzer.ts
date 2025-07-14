
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface ContentGap {
  id: string;
  topic: string;
  description: string;
  opportunity: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume: number;
  competitionLevel: number;
  contentType: 'blog' | 'guide' | 'tutorial' | 'comparison' | 'faq' | 'resource';
  keywords: string[];
  competitorWeakness: string;
  actionItems: string[];
  potentialTraffic: number;
  timeToRank: string;
}

export interface CompetitorAnalysis {
  url: string;
  title: string;
  wordCount: number;
  strengths: string[];
  weaknesses: string[];
  contentQuality: number;
  technicalScore: number;
  missingTopics: string[];
  opportunities: string[];
}

export interface GapAnalysisResult {
  gaps: ContentGap[];
  competitorAnalysis: CompetitorAnalysis[];
  overallOpportunity: {
    score: number;
    summary: string;
    quickWins: string[];
    longTermStrategy: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export class ContentGapAnalyzer {
  /**
   * Perform comprehensive content gap analysis
   */
  static async analyzeContentGaps(
    keyword: string,
    competitorData: any[],
    yourContent: string[],
    provider: AiProvider = 'openai'
  ): Promise<GapAnalysisResult> {
    try {
      console.log(`🔍 Starting comprehensive content gap analysis for: ${keyword}`);
      
      // Analyze competitors first
      const competitorAnalysis = await this.analyzeCompetitors(competitorData, keyword, provider);
      
      // Identify content gaps
      const gaps = await this.identifyContentGaps(
        keyword, 
        competitorData, 
        yourContent, 
        competitorAnalysis, 
        provider
      );
      
      // Generate strategic recommendations
      const recommendations = await this.generateRecommendations(gaps, competitorAnalysis, provider);
      
      // Calculate overall opportunity
      const overallOpportunity = this.calculateOverallOpportunity(gaps, competitorAnalysis);
      
      return {
        gaps,
        competitorAnalysis,
        overallOpportunity,
        recommendations
      };
    } catch (error) {
      console.error('Error in content gap analysis:', error);
      return this.createFallbackAnalysis(keyword, competitorData);
    }
  }

  /**
   * Analyze competitor content in detail
   */
  private static async analyzeCompetitors(
    competitorData: any[],
    keyword: string,
    provider: AiProvider
  ): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = [];
    
    for (const competitor of competitorData.slice(0, 5)) {
      try {
        const analysis = await this.analyzeSingleCompetitor(competitor, keyword, provider);
        analyses.push(analysis);
      } catch (error) {
        console.error('Error analyzing competitor:', error);
        analyses.push(this.createFallbackCompetitorAnalysis(competitor));
      }
    }
    
    return analyses;
  }

  private static async analyzeSingleCompetitor(
    competitor: any,
    keyword: string,
    provider: AiProvider
  ): Promise<CompetitorAnalysis> {
    const prompt = this.createCompetitorAnalysisPrompt(competitor, keyword);
    
    const response = await sendChatRequest(provider, {
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist analyzing competitor content for strengths, weaknesses, and opportunities. Focus on actionable insights.'
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
      throw new Error('No response from competitor analysis');
    }

    return this.parseCompetitorAnalysis(response.choices[0].message.content, competitor);
  }

  /**
   * Identify specific content gaps and opportunities
   */
  private static async identifyContentGaps(
    keyword: string,
    competitorData: any[],
    yourContent: string[],
    competitorAnalysis: CompetitorAnalysis[],
    provider: AiProvider
  ): Promise<ContentGap[]> {
    const prompt = this.createGapIdentificationPrompt(
      keyword, 
      competitorData, 
      yourContent, 
      competitorAnalysis
    );
    
    const response = await sendChatRequest(provider, {
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content strategist specializing in competitive gap analysis. Identify specific, actionable content opportunities that competitors are missing or handling poorly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      maxTokens: 3000
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No response from gap identification');
    }

    return this.parseContentGaps(response.choices[0].message.content);
  }

  /**
   * Generate strategic recommendations
   */
  private static async generateRecommendations(
    gaps: ContentGap[],
    competitorAnalysis: CompetitorAnalysis[],
    provider: AiProvider
  ): Promise<{ immediate: string[]; shortTerm: string[]; longTerm: string[] }> {
    const prompt = this.createRecommendationsPrompt(gaps, competitorAnalysis);
    
    const response = await sendChatRequest(provider, {
      messages: [
        {
          role: 'system',
          content: 'You are a strategic content consultant. Create actionable, prioritized recommendations based on content gap analysis and competitive intelligence.'
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
      return {
        immediate: ['Analyze competitor content more thoroughly'],
        shortTerm: ['Create content addressing identified gaps'],
        longTerm: ['Develop comprehensive content strategy']
      };
    }

    return this.parseRecommendations(response.choices[0].message.content);
  }

  private static createCompetitorAnalysisPrompt(competitor: any, keyword: string): string {
    return `Analyze this competitor content for "${keyword}":

COMPETITOR DATA:
Title: ${competitor.title || 'Unknown'}
URL: ${competitor.link || competitor.url || 'Unknown'}
Snippet: ${competitor.snippet || 'No snippet available'}

Analyze for:
1. STRENGTHS: What are they doing well?
2. WEAKNESSES: What are they missing or doing poorly?
3. CONTENT QUALITY: Overall assessment (1-100)
4. TECHNICAL SCORE: Technical SEO elements (1-100)
5. MISSING TOPICS: What important subtopics are they not covering?
6. OPPORTUNITIES: How can we do better?

Response format:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "contentQuality": 75,
  "technicalScore": 80,
  "missingTopics": ["topic1", "topic2"],
  "opportunities": ["opportunity1", "opportunity2"]
}`;
  }

  private static createGapIdentificationPrompt(
    keyword: string,
    competitorData: any[],
    yourContent: string[],
    competitorAnalysis: CompetitorAnalysis[]
  ): string {
    const competitorSummary = competitorData.slice(0, 3).map((comp, i) => 
      `Competitor ${i + 1}: ${comp.title}\nWeaknesses: ${competitorAnalysis[i]?.weaknesses.join(', ') || 'Unknown'}\n`
    ).join('\n');

    return `Identify content gaps for "${keyword}" based on competitive analysis:

COMPETITOR SUMMARY:
${competitorSummary}

YOUR CURRENT CONTENT:
${yourContent.length > 0 ? yourContent.join('\n') : 'No existing content'}

Identify gaps where you can:
1. Address topics competitors are missing entirely
2. Improve on topics competitors cover poorly
3. Target different content formats competitors aren't using
4. Address different search intents or funnel stages

For each gap, provide:
- Specific topic/opportunity
- Why it's an opportunity (competitor weakness)
- Priority level and difficulty
- Estimated search volume and competition
- Recommended content type
- Action items to capitalize

Response format:
{
  "gaps": [
    {
      "topic": "Specific topic name",
      "description": "Detailed description",
      "opportunity": "Why this is an opportunity",
      "priority": "high",
      "difficulty": "medium",
      "searchVolume": 1000,
      "competitionLevel": 45,
      "contentType": "guide",
      "keywords": ["keyword1", "keyword2"],
      "competitorWeakness": "What competitors are missing",
      "actionItems": ["action1", "action2"],
      "potentialTraffic": 500,
      "timeToRank": "3-6 months"
    }
  ]
}`;
  }

  private static createRecommendationsPrompt(
    gaps: ContentGap[],
    competitorAnalysis: CompetitorAnalysis[]
  ): string {
    const gapSummary = gaps.slice(0, 5).map(gap => 
      `${gap.topic} (${gap.priority} priority, ${gap.difficulty} difficulty)`
    ).join('\n');

    return `Create strategic recommendations based on this content gap analysis:

TOP GAPS IDENTIFIED:
${gapSummary}

COMPETITOR WEAKNESSES:
${competitorAnalysis.slice(0, 3).map(comp => 
  `${comp.url}: ${comp.weaknesses.join(', ')}`
).join('\n')}

Create prioritized recommendations in three timeframes:

1. IMMEDIATE (0-30 days): Quick wins and easy opportunities
2. SHORT-TERM (1-3 months): Medium effort, high impact opportunities  
3. LONG-TERM (3-12 months): Strategic initiatives and major content projects

Response format:
{
  "immediate": ["recommendation1", "recommendation2"],
  "shortTerm": ["recommendation1", "recommendation2"],
  "longTerm": ["recommendation1", "recommendation2"]
}`;
  }

  private static parseCompetitorAnalysis(response: string, competitor: any): CompetitorAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        url: competitor.link || competitor.url || 'Unknown',
        title: competitor.title || 'Unknown Title',
        wordCount: this.estimateWordCount(competitor.snippet || ''),
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        contentQuality: parsed.contentQuality || 50,
        technicalScore: parsed.technicalScore || 50,
        missingTopics: parsed.missingTopics || [],
        opportunities: parsed.opportunities || []
      };
    } catch (error) {
      console.error('Error parsing competitor analysis:', error);
      return this.createFallbackCompetitorAnalysis(competitor);
    }
  }

  private static parseContentGaps(response: string): ContentGap[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.gaps?.map((gap: any, index: number) => ({
        id: `gap-${index + 1}`,
        topic: gap.topic || 'Unknown Topic',
        description: gap.description || 'No description',
        opportunity: gap.opportunity || 'Content opportunity',
        priority: gap.priority || 'medium',
        difficulty: gap.difficulty || 'medium',
        searchVolume: gap.searchVolume || 0,
        competitionLevel: gap.competitionLevel || 50,
        contentType: gap.contentType || 'blog',
        keywords: gap.keywords || [],
        competitorWeakness: gap.competitorWeakness || 'Unknown weakness',
        actionItems: gap.actionItems || [],
        potentialTraffic: gap.potentialTraffic || 0,
        timeToRank: gap.timeToRank || '3-6 months'
      })) || [];
    } catch (error) {
      console.error('Error parsing content gaps:', error);
      return [];
    }
  }

  private static parseRecommendations(response: string): { immediate: string[]; shortTerm: string[]; longTerm: string[] } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        immediate: parsed.immediate || [],
        shortTerm: parsed.shortTerm || [],
        longTerm: parsed.longTerm || []
      };
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return {
        immediate: ['Analyze competitor content gaps'],
        shortTerm: ['Create content addressing identified opportunities'],
        longTerm: ['Develop comprehensive content strategy']
      };
    }
  }

  private static calculateOverallOpportunity(
    gaps: ContentGap[],
    competitorAnalysis: CompetitorAnalysis[]
  ): { score: number; summary: string; quickWins: string[]; longTermStrategy: string[] } {
    // Calculate opportunity score based on gaps and competitor weaknesses
    const highPriorityGaps = gaps.filter(gap => gap.priority === 'critical' || gap.priority === 'high');
    const totalPotentialTraffic = gaps.reduce((sum, gap) => sum + gap.potentialTraffic, 0);
    const avgCompetitorQuality = competitorAnalysis.reduce((sum, comp) => sum + comp.contentQuality, 0) / competitorAnalysis.length;
    
    let score = 50; // Base score
    score += highPriorityGaps.length * 10; // High priority gaps boost score
    score += Math.min(30, totalPotentialTraffic / 100); // Traffic potential
    score += Math.max(0, 80 - avgCompetitorQuality) / 2; // Competitor weakness opportunity
    
    const finalScore = Math.min(100, Math.max(0, score));
    
    return {
      score: finalScore,
      summary: finalScore > 75 ? 'Excellent opportunity with multiple high-impact gaps' :
               finalScore > 50 ? 'Good opportunity with several actionable gaps' :
               'Moderate opportunity, focus on specific weaknesses',
      quickWins: gaps.filter(gap => gap.difficulty === 'easy' && gap.priority !== 'low').map(gap => gap.topic),
      longTermStrategy: gaps.filter(gap => gap.priority === 'critical' || gap.priority === 'high').map(gap => gap.topic)
    };
  }

  private static estimateWordCount(snippet: string): number {
    return snippet ? snippet.split(' ').length * 15 : 500; // Rough estimate
  }

  private static createFallbackCompetitorAnalysis(competitor: any): CompetitorAnalysis {
    return {
      url: competitor.link || competitor.url || 'Unknown',
      title: competitor.title || 'Unknown Title',
      wordCount: 800,
      strengths: ['Established content'],
      weaknesses: ['Limited depth', 'Missing recent updates'],
      contentQuality: 60,
      technicalScore: 70,
      missingTopics: ['Advanced strategies', 'Recent developments'],
      opportunities: ['More comprehensive coverage', 'Better user experience']
    };
  }

  private static createFallbackAnalysis(keyword: string, competitorData: any[]): GapAnalysisResult {
    const fallbackGaps: ContentGap[] = [
      {
        id: 'gap-1',
        topic: `Advanced ${keyword} strategies`,
        description: 'Competitors lack comprehensive advanced content',
        opportunity: 'Create in-depth advanced guide',
        priority: 'high',
        difficulty: 'medium',
        searchVolume: 500,
        competitionLevel: 45,
        contentType: 'guide',
        keywords: [keyword, `advanced ${keyword}`],
        competitorWeakness: 'Shallow coverage of advanced topics',
        actionItems: ['Research advanced techniques', 'Interview experts'],
        potentialTraffic: 300,
        timeToRank: '3-6 months'
      }
    ];

    const fallbackCompetitorAnalysis: CompetitorAnalysis[] = competitorData.slice(0, 3).map((comp, i) => ({
      url: comp.link || comp.url || `competitor-${i + 1}`,
      title: comp.title || `Competitor ${i + 1}`,
      wordCount: 800,
      strengths: ['Established presence'],
      weaknesses: ['Limited depth'],
      contentQuality: 60,
      technicalScore: 70,
      missingTopics: ['Advanced topics'],
      opportunities: ['Better coverage']
    }));

    return {
      gaps: fallbackGaps,
      competitorAnalysis: fallbackCompetitorAnalysis,
      overallOpportunity: {
        score: 65,
        summary: 'Moderate opportunity identified',
        quickWins: ['Advanced strategies'],
        longTermStrategy: ['Comprehensive content hub']
      },
      recommendations: {
        immediate: ['Research competitor gaps'],
        shortTerm: ['Create targeted content'],
        longTerm: ['Build content authority']
      }
    };
  }
}
