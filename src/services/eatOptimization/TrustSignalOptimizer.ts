
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface TrustSignalRecommendation {
  type: 'transparency' | 'accuracy' | 'security' | 'social_proof' | 'contact_info' | 'credentials' | 'disclosure';
  title: string;
  description: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  trustImpact: number; // 1-10
  currentStatus: 'missing' | 'partial' | 'present';
}

export interface TransparencyAudit {
  score: number; // 0-100
  presentElements: string[];
  missingElements: string[];
  recommendations: string[];
}

export interface AccuracyAudit {
  score: number; // 0-100
  factCheckingOpportunities: string[];
  sourceVerification: string[];
  updateRecommendations: string[];
}

export interface TrustOptimizationPlan {
  overallTrustScore: number;
  transparencyAudit: TransparencyAudit;
  accuracyAudit: AccuracyAudit;
  recommendations: TrustSignalRecommendation[];
  implementationPlan: {
    quickWins: TrustSignalRecommendation[];
    mediumTerm: TrustSignalRecommendation[];
    longTerm: TrustSignalRecommendation[];
  };
  riskMitigation: string[];
}

export class TrustSignalOptimizer {
  /**
   * Comprehensive trust signal analysis and optimization
   */
  static async optimizeTrustSignals(
    content: string,
    websiteInfo?: {
      hasAboutPage?: boolean;
      hasContactInfo?: boolean;
      hasPrivacyPolicy?: boolean;
      hasTermsOfService?: boolean;
      hasSSL?: boolean;
    },
    authorInfo?: {
      name?: string;
      credentials?: string[];
      bio?: string;
    },
    provider: AiProvider = 'openai'
  ): Promise<TrustOptimizationPlan> {
    try {
      const optimizationPrompt = this.createTrustOptimizationPrompt(content, websiteInfo, authorInfo);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are a trust and credibility optimization expert. Analyze content and website elements for trustworthiness according to Google's E-A-T guidelines. Provide specific, actionable recommendations to build user trust and search engine confidence.`
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 2500
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No trust optimization response received');
      }

      return this.parseTrustOptimizationPlan(response.choices[0].message.content);
    } catch (error) {
      console.error('Trust optimization error:', error);
      return this.getDefaultTrustPlan();
    }
  }

  /**
   * Quick trust score assessment
   */
  static async getTrustScore(
    content: string,
    provider: AiProvider = 'openai'
  ): Promise<number> {
    try {
      const fullPlan = await this.optimizeTrustSignals(content, undefined, undefined, provider);
      return fullPlan.overallTrustScore;
    } catch (error) {
      console.error('Trust score error:', error);
      return 50;
    }
  }

  /**
   * Analyze transparency elements
   */
  static async analyzeTransparency(
    content: string,
    provider: AiProvider = 'openai'
  ): Promise<TransparencyAudit> {
    try {
      const transparencyPrompt = `Analyze this content for transparency elements:

CONTENT: ${content.substring(0, 1500)}

Evaluate transparency based on:
- Author disclosure and credentials
- Methodology transparency
- Source attribution
- Conflict of interest disclosure
- Update information
- Editorial standards

Return transparency audit in JSON format.`;

      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are a transparency auditor. Analyze content transparency and return JSON only.'
          },
          {
            role: 'user',
            content: transparencyPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 1000
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No transparency analysis received');
      }

      const parsed = JSON.parse(response.choices[0].message.content);
      return {
        score: Math.max(0, Math.min(100, parsed.score || 50)),
        presentElements: Array.isArray(parsed.presentElements) ? parsed.presentElements : [],
        missingElements: Array.isArray(parsed.missingElements) ? parsed.missingElements : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      console.error('Transparency analysis error:', error);
      return {
        score: 50,
        presentElements: [],
        missingElements: ['Author information', 'Source attribution', 'Methodology disclosure'],
        recommendations: ['Add author bio', 'Include source links', 'Explain methodology']
      };
    }
  }

  private static createTrustOptimizationPrompt(
    content: string,
    websiteInfo?: {
      hasAboutPage?: boolean;
      hasContactInfo?: boolean;
      hasPrivacyPolicy?: boolean;
      hasTermsOfService?: boolean;
      hasSSL?: boolean;
    },
    authorInfo?: {
      name?: string;
      credentials?: string[];
      bio?: string;
    }
  ): string {
    return `Analyze this content and website for trust signals and provide optimization recommendations:

CONTENT ANALYSIS:
Content: ${content.substring(0, 1500)}${content.length > 1500 ? '...' : ''}

WEBSITE INFORMATION:
${websiteInfo ? `
- About Page: ${websiteInfo.hasAboutPage ? 'Present' : 'Missing'}
- Contact Info: ${websiteInfo.hasContactInfo ? 'Present' : 'Missing'}
- Privacy Policy: ${websiteInfo.hasPrivacyPolicy ? 'Present' : 'Missing'}
- Terms of Service: ${websiteInfo.hasTermsOfService ? 'Present' : 'Missing'}
- SSL Certificate: ${websiteInfo.hasSSL ? 'Present' : 'Missing'}
` : 'Website information not provided'}

AUTHOR INFORMATION:
${authorInfo ? `
- Name: ${authorInfo.name || 'Not provided'}
- Credentials: ${authorInfo.credentials?.join(', ') || 'None provided'}
- Bio: ${authorInfo.bio ? 'Present' : 'Missing'}
` : 'Author information not provided'}

TRUST ANALYSIS REQUIREMENTS:

1. TRANSPARENCY AUDIT:
   - Author disclosure and credentials
   - Source attribution and references
   - Methodology transparency
   - Update and review dates
   - Editorial standards

2. ACCURACY AUDIT:
   - Fact-checking opportunities
   - Source verification needs
   - Currency of information
   - Cross-referencing requirements

3. TRUST SIGNAL RECOMMENDATIONS:
   - Social proof elements
   - Security indicators
   - Contact and support information
   - Credibility enhancements
   - Risk mitigation strategies

Return comprehensive trust optimization plan in JSON format:
{
  "overallTrustScore": 75,
  "transparencyAudit": {
    "score": 70,
    "presentElements": ["Source attribution", "Author name"],
    "missingElements": ["Author credentials", "Update dates"],
    "recommendations": ["Add author bio with credentials", "Include last updated date"]
  },
  "accuracyAudit": {
    "score": 80,
    "factCheckingOpportunities": ["Verify statistics in paragraph 3"],
    "sourceVerification": ["Check currency of market data"],
    "updateRecommendations": ["Update 2022 statistics to current year"]
  },
  "recommendations": [
    {
      "type": "transparency",
      "title": "Add author credentials",
      "description": "Display author qualifications and expertise",
      "implementation": "Create author bio box with credentials",
      "priority": "high",
      "effort": "low",
      "trustImpact": 8,
      "currentStatus": "missing"
    }
  ],
  "implementationPlan": {
    "quickWins": [],
    "mediumTerm": [],
    "longTerm": []
  },
  "riskMitigation": ["Add disclaimer for financial advice", "Include conflict of interest disclosure"]
}`;
  }

  private static parseTrustOptimizationPlan(planText: string): TrustOptimizationPlan {
    try {
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in trust optimization response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        overallTrustScore: Math.max(0, Math.min(100, parsed.overallTrustScore || 50)),
        transparencyAudit: {
          score: Math.max(0, Math.min(100, parsed.transparencyAudit?.score || 50)),
          presentElements: Array.isArray(parsed.transparencyAudit?.presentElements) ? parsed.transparencyAudit.presentElements : [],
          missingElements: Array.isArray(parsed.transparencyAudit?.missingElements) ? parsed.transparencyAudit.missingElements : [],
          recommendations: Array.isArray(parsed.transparencyAudit?.recommendations) ? parsed.transparencyAudit.recommendations : []
        },
        accuracyAudit: {
          score: Math.max(0, Math.min(100, parsed.accuracyAudit?.score || 50)),
          factCheckingOpportunities: Array.isArray(parsed.accuracyAudit?.factCheckingOpportunities) ? parsed.accuracyAudit.factCheckingOpportunities : [],
          sourceVerification: Array.isArray(parsed.accuracyAudit?.sourceVerification) ? parsed.accuracyAudit.sourceVerification : [],
          updateRecommendations: Array.isArray(parsed.accuracyAudit?.updateRecommendations) ? parsed.accuracyAudit.updateRecommendations : []
        },
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map((rec: any) => ({
          type: ['transparency', 'accuracy', 'security', 'social_proof', 'contact_info', 'credentials', 'disclosure'].includes(rec.type) 
            ? rec.type : 'transparency',
          title: rec.title || 'Trust improvement',
          description: rec.description || '',
          implementation: rec.implementation || '',
          priority: ['low', 'medium', 'high'].includes(rec.priority) ? rec.priority : 'medium',
          effort: ['low', 'medium', 'high'].includes(rec.effort) ? rec.effort : 'medium',
          trustImpact: Math.max(1, Math.min(10, rec.trustImpact || 5)),
          currentStatus: ['missing', 'partial', 'present'].includes(rec.currentStatus) ? rec.currentStatus : 'missing'
        })) : [],
        implementationPlan: {
          quickWins: Array.isArray(parsed.implementationPlan?.quickWins) ? parsed.implementationPlan.quickWins : [],
          mediumTerm: Array.isArray(parsed.implementationPlan?.mediumTerm) ? parsed.implementationPlan.mediumTerm : [],
          longTerm: Array.isArray(parsed.implementationPlan?.longTerm) ? parsed.implementationPlan.longTerm : []
        },
        riskMitigation: Array.isArray(parsed.riskMitigation) ? parsed.riskMitigation : []
      };
    } catch (error) {
      console.error('Error parsing trust optimization plan:', error);
      return this.getDefaultTrustPlan();
    }
  }

  private static getDefaultTrustPlan(): TrustOptimizationPlan {
    return {
      overallTrustScore: 50,
      transparencyAudit: {
        score: 50,
        presentElements: [],
        missingElements: ['Author information', 'Source attribution', 'Update dates'],
        recommendations: ['Add author bio', 'Include source links', 'Add publication date']
      },
      accuracyAudit: {
        score: 50,
        factCheckingOpportunities: ['Verify all statistics', 'Check source currency'],
        sourceVerification: ['Add authoritative references'],
        updateRecommendations: ['Include last updated date']
      },
      recommendations: [
        {
          type: 'transparency',
          title: 'Add author information',
          description: 'Include author bio with credentials',
          implementation: 'Create author section with qualifications',
          priority: 'high',
          effort: 'low',
          trustImpact: 8,
          currentStatus: 'missing'
        }
      ],
      implementationPlan: {
        quickWins: [],
        mediumTerm: [],
        longTerm: []
      },
      riskMitigation: ['Add appropriate disclaimers', 'Include contact information']
    };
  }
}
