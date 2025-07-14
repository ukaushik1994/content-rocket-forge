
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface EATScore {
  overall: number; // 0-100
  expertise: number;
  authority: number;
  trustworthiness: number;
}

export interface ExpertiseAnalysis {
  score: number;
  indicators: string[];
  recommendations: string[];
  expertiseLevel: 'novice' | 'intermediate' | 'advanced' | 'expert';
  subjectMatterDepth: number;
}

export interface AuthorityAnalysis {
  score: number;
  signals: AuthoritySignal[];
  recommendations: string[];
  credibilityGaps: string[];
}

export interface AuthoritySignal {
  type: 'citation' | 'credential' | 'experience' | 'recognition' | 'publication';
  description: string;
  strength: 'weak' | 'moderate' | 'strong';
  present: boolean;
}

export interface TrustworthinessAnalysis {
  score: number;
  trustIndicators: TrustIndicator[];
  recommendations: string[];
  riskFactors: string[];
}

export interface TrustIndicator {
  type: 'transparency' | 'accuracy' | 'security' | 'social_proof' | 'contact_info';
  description: string;
  present: boolean;
  importance: 'low' | 'medium' | 'high';
}

export interface EATAnalysisResult {
  score: EATScore;
  expertise: ExpertiseAnalysis;
  authority: AuthorityAnalysis;
  trustworthiness: TrustworthinessAnalysis;
  overallRecommendations: string[];
  contentGaps: string[];
  competitiveAdvantage: string[];
}

export class EATAnalyzer {
  /**
   * Comprehensive E-A-T analysis of content
   */
  static async analyzeContent(
    content: string,
    title: string,
    topic: string,
    authorInfo?: {
      name?: string;
      credentials?: string[];
      bio?: string;
    },
    provider: AiProvider = 'openai'
  ): Promise<EATAnalysisResult> {
    try {
      const analysisPrompt = this.createEATAnalysisPrompt(content, title, topic, authorInfo);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are an expert E-A-T (Expertise, Authority, Trustworthiness) analyst specializing in Google's Quality Rater Guidelines. Analyze content for E-A-T signals and provide detailed, actionable recommendations. Return analysis in JSON format only.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 3000
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No E-A-T analysis response received');
      }

      return this.parseEATAnalysis(response.choices[0].message.content);
    } catch (error) {
      console.error('E-A-T Analysis error:', error);
      return this.getDefaultEATAnalysis();
    }
  }

  /**
   * Quick E-A-T score calculation
   */
  static async getQuickEATScore(
    content: string,
    topic: string,
    provider: AiProvider = 'openai'
  ): Promise<EATScore> {
    try {
      const fullAnalysis = await this.analyzeContent(content, '', topic, undefined, provider);
      return fullAnalysis.score;
    } catch (error) {
      console.error('Quick E-A-T score error:', error);
      return {
        overall: 50,
        expertise: 50,
        authority: 50,
        trustworthiness: 50
      };
    }
  }

  private static createEATAnalysisPrompt(
    content: string,
    title: string,
    topic: string,
    authorInfo?: {
      name?: string;
      credentials?: string[];
      bio?: string;
    }
  ): string {
    const wordCount = content.split(/\s+/).length;
    
    return `Analyze this content for E-A-T (Expertise, Authority, Trustworthiness) compliance according to Google's Quality Rater Guidelines.

CONTENT TO ANALYZE:
Title: ${title}
Topic: ${topic}
Content: ${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}
Word Count: ${wordCount}
${authorInfo ? `Author: ${authorInfo.name || 'Unknown'}
Credentials: ${authorInfo.credentials?.join(', ') || 'None provided'}
Bio: ${authorInfo.bio || 'None provided'}` : ''}

ANALYSIS CRITERIA:

1. EXPERTISE ANALYSIS (0-100):
   - Subject matter depth and accuracy
   - Technical terminology usage
   - Demonstration of specialized knowledge
   - Practical insights and unique perspectives
   - Educational value and comprehensiveness

2. AUTHORITY ANALYSIS (0-100):
   - Author credentials and qualifications
   - Citations and references to authoritative sources
   - Recognition and industry standing
   - Publication history and expertise demonstration
   - Backlink-worthy content quality

3. TRUSTWORTHINESS ANALYSIS (0-100):
   - Factual accuracy and fact-checking
   - Transparency and disclosure
   - Contact and about information
   - Social proof and testimonials
   - Security and privacy considerations

4. CONTENT GAPS:
   - Missing expertise demonstrations
   - Authority building opportunities
   - Trust signal improvements needed

Respond ONLY in this JSON format:
{
  "score": {
    "overall": 85,
    "expertise": 80,
    "authority": 85,
    "trustworthiness": 90
  },
  "expertise": {
    "score": 80,
    "indicators": ["Technical depth demonstrated", "Industry terminology used correctly"],
    "recommendations": ["Add more specific examples", "Include case studies"],
    "expertiseLevel": "advanced",
    "subjectMatterDepth": 75
  },
  "authority": {
    "score": 85,
    "signals": [
      {
        "type": "citation",
        "description": "References to authoritative sources",
        "strength": "strong",
        "present": true
      }
    ],
    "recommendations": ["Add expert quotes", "Include industry statistics"],
    "credibilityGaps": ["Missing author bio", "No credentials displayed"]
  },
  "trustworthiness": {
    "score": 90,
    "trustIndicators": [
      {
        "type": "accuracy",
        "description": "Information appears factually accurate",
        "present": true,
        "importance": "high"
      }
    ],
    "recommendations": ["Add publication date", "Include fact-checking sources"],
    "riskFactors": ["No contact information provided"]
  },
  "overallRecommendations": ["Enhance author credibility", "Add more authoritative sources"],
  "contentGaps": ["Missing expert perspectives", "Lacks real-world examples"],
  "competitiveAdvantage": ["High technical accuracy", "Comprehensive coverage"]
}`;
  }

  private static parseEATAnalysis(analysisText: string): EATAnalysisResult {
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in E-A-T analysis response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        score: {
          overall: Math.max(0, Math.min(100, parsed.score?.overall || 50)),
          expertise: Math.max(0, Math.min(100, parsed.score?.expertise || 50)),
          authority: Math.max(0, Math.min(100, parsed.score?.authority || 50)),
          trustworthiness: Math.max(0, Math.min(100, parsed.score?.trustworthiness || 50))
        },
        expertise: {
          score: Math.max(0, Math.min(100, parsed.expertise?.score || 50)),
          indicators: Array.isArray(parsed.expertise?.indicators) ? parsed.expertise.indicators : [],
          recommendations: Array.isArray(parsed.expertise?.recommendations) ? parsed.expertise.recommendations : [],
          expertiseLevel: ['novice', 'intermediate', 'advanced', 'expert'].includes(parsed.expertise?.expertiseLevel) 
            ? parsed.expertise.expertiseLevel : 'intermediate',
          subjectMatterDepth: Math.max(0, Math.min(100, parsed.expertise?.subjectMatterDepth || 50))
        },
        authority: {
          score: Math.max(0, Math.min(100, parsed.authority?.score || 50)),
          signals: Array.isArray(parsed.authority?.signals) ? parsed.authority.signals.map((signal: any) => ({
            type: ['citation', 'credential', 'experience', 'recognition', 'publication'].includes(signal.type) 
              ? signal.type : 'citation',
            description: signal.description || '',
            strength: ['weak', 'moderate', 'strong'].includes(signal.strength) ? signal.strength : 'moderate',
            present: Boolean(signal.present)
          })) : [],
          recommendations: Array.isArray(parsed.authority?.recommendations) ? parsed.authority.recommendations : [],
          credibilityGaps: Array.isArray(parsed.authority?.credibilityGaps) ? parsed.authority.credibilityGaps : []
        },
        trustworthiness: {
          score: Math.max(0, Math.min(100, parsed.trustworthiness?.score || 50)),
          trustIndicators: Array.isArray(parsed.trustworthiness?.trustIndicators) ? parsed.trustworthiness.trustIndicators.map((indicator: any) => ({
            type: ['transparency', 'accuracy', 'security', 'social_proof', 'contact_info'].includes(indicator.type) 
              ? indicator.type : 'accuracy',
            description: indicator.description || '',
            present: Boolean(indicator.present),
            importance: ['low', 'medium', 'high'].includes(indicator.importance) ? indicator.importance : 'medium'
          })) : [],
          recommendations: Array.isArray(parsed.trustworthiness?.recommendations) ? parsed.trustworthiness.recommendations : [],
          riskFactors: Array.isArray(parsed.trustworthiness?.riskFactors) ? parsed.trustworthiness.riskFactors : []
        },
        overallRecommendations: Array.isArray(parsed.overallRecommendations) ? parsed.overallRecommendations : [],
        contentGaps: Array.isArray(parsed.contentGaps) ? parsed.contentGaps : [],
        competitiveAdvantage: Array.isArray(parsed.competitiveAdvantage) ? parsed.competitiveAdvantage : []
      };
    } catch (error) {
      console.error('Error parsing E-A-T analysis:', error);
      return this.getDefaultEATAnalysis();
    }
  }

  private static getDefaultEATAnalysis(): EATAnalysisResult {
    return {
      score: {
        overall: 50,
        expertise: 50,
        authority: 50,
        trustworthiness: 50
      },
      expertise: {
        score: 50,
        indicators: [],
        recommendations: ['Add more technical depth', 'Include specific examples'],
        expertiseLevel: 'intermediate',
        subjectMatterDepth: 50
      },
      authority: {
        score: 50,
        signals: [],
        recommendations: ['Add authoritative citations', 'Include expert opinions'],
        credibilityGaps: ['Missing author information', 'No credentials provided']
      },
      trustworthiness: {
        score: 50,
        trustIndicators: [],
        recommendations: ['Add fact-checking sources', 'Include transparency information'],
        riskFactors: ['Limited verification information']
      },
      overallRecommendations: ['Enhance expertise demonstration', 'Build authority signals', 'Improve trustworthiness'],
      contentGaps: ['Missing expert perspectives', 'Lacks authoritative backing'],
      competitiveAdvantage: []
    };
  }
}
