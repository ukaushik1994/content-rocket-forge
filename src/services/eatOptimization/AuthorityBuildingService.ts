
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface AuthoritySuggestion {
  type: 'citation' | 'expert_quote' | 'case_study' | 'statistic' | 'research' | 'credential';
  title: string;
  description: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  sources?: string[];
}

export interface CitationRecommendation {
  domain: string;
  title: string;
  relevance: number;
  authority: 'high' | 'medium' | 'low';
  type: 'research' | 'industry_report' | 'government' | 'academic' | 'news';
  reason: string;
}

export interface ExpertQuoteOpportunity {
  section: string;
  quoteType: 'opinion' | 'statistic' | 'prediction' | 'case_study';
  suggestedExperts: string[];
  reasoning: string;
  implementation: string;
}

export interface AuthorityBuildingPlan {
  overallStrategy: string;
  priorityActions: AuthoritySuggestion[];
  citationRecommendations: CitationRecommendation[];
  expertQuoteOpportunities: ExpertQuoteOpportunity[];
  credentialHighlights: string[];
  implementationTimeline: {
    immediate: AuthoritySuggestion[];
    shortTerm: AuthoritySuggestion[];
    longTerm: AuthoritySuggestion[];
  };
}

export class AuthorityBuildingService {
  /**
   * Generate comprehensive authority building recommendations
   */
  static async generateAuthorityPlan(
    content: string,
    topic: string,
    targetAudience: string,
    existingCredentials?: string[],
    provider: AiProvider = 'openai'
  ): Promise<AuthorityBuildingPlan> {
    try {
      const planPrompt = this.createAuthorityPlanPrompt(content, topic, targetAudience, existingCredentials);
      
      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: `You are an authority building strategist specializing in creating credible, trustworthy content. Analyze content and provide specific, actionable recommendations to build topical authority. Focus on practical implementation.`
          },
          {
            role: 'user',
            content: planPrompt
          }
        ],
        temperature: 0.3,
        maxTokens: 2500
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No authority building response received');
      }

      return this.parseAuthorityPlan(response.choices[0].message.content);
    } catch (error) {
      console.error('Authority building plan error:', error);
      return this.getDefaultAuthorityPlan();
    }
  }

  /**
   * Get specific citation recommendations for content
   */
  static async getCitationRecommendations(
    content: string,
    topic: string,
    provider: AiProvider = 'openai'
  ): Promise<CitationRecommendation[]> {
    try {
      const citationPrompt = `Analyze this content and recommend specific authoritative sources to cite:

CONTENT: ${content.substring(0, 1500)}
TOPIC: ${topic}

Provide 5-8 high-authority sources that would strengthen this content's credibility. Focus on:
- Government sources (.gov)
- Academic institutions (.edu)
- Industry leaders and research organizations
- Peer-reviewed publications
- Authoritative news sources

Format as JSON array of citation recommendations.`;

      const response = await sendChatRequest(provider, {
        messages: [
          {
            role: 'system',
            content: 'You are a research specialist. Recommend authoritative sources for content citations. Return only JSON.'
          },
          {
            role: 'user',
            content: citationPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 1500
      });

      if (!response?.choices?.[0]?.message?.content) {
        return [];
      }

      const parsed = JSON.parse(response.choices[0].message.content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Citation recommendations error:', error);
      return [];
    }
  }

  private static createAuthorityPlanPrompt(
    content: string,
    topic: string,
    targetAudience: string,
    existingCredentials?: string[]
  ): string {
    return `Create a comprehensive authority building plan for this content:

CONTENT ANALYSIS:
Topic: ${topic}
Target Audience: ${targetAudience}
Content: ${content.substring(0, 1500)}${content.length > 1500 ? '...' : ''}
Existing Credentials: ${existingCredentials?.join(', ') || 'None provided'}

AUTHORITY BUILDING REQUIREMENTS:

1. OVERALL STRATEGY:
   - Strategic approach to building topical authority
   - Key areas for credibility enhancement
   - Competitive positioning

2. PRIORITY ACTIONS:
   - Immediate improvements (high impact, low effort)
   - Medium-term enhancements
   - Long-term authority building

3. CITATION RECOMMENDATIONS:
   - Specific authoritative sources to reference
   - Government, academic, and industry sources
   - Research studies and reports

4. EXPERT QUOTE OPPORTUNITIES:
   - Where to add expert opinions
   - Types of experts to quote
   - Implementation strategies

5. CREDENTIAL HIGHLIGHTS:
   - How to better showcase existing credentials
   - Authority signals to emphasize
   - Trust-building elements

Respond in JSON format:
{
  "overallStrategy": "Strategic approach description",
  "priorityActions": [
    {
      "type": "citation",
      "title": "Add industry research citations",
      "description": "Reference latest industry reports",
      "implementation": "Add 3-4 citations in methodology section",
      "priority": "high",
      "effort": "low",
      "impact": "high",
      "sources": ["example-source.com"]
    }
  ],
  "citationRecommendations": [
    {
      "domain": "example.gov",
      "title": "Government Research Report",
      "relevance": 95,
      "authority": "high",
      "type": "government",
      "reason": "Official statistics support claims"
    }
  ],
  "expertQuoteOpportunities": [
    {
      "section": "Introduction",
      "quoteType": "opinion",
      "suggestedExperts": ["Industry Leader Name"],
      "reasoning": "Expert perspective adds credibility",
      "implementation": "Add quote in second paragraph"
    }
  ],
  "credentialHighlights": ["Emphasize industry experience", "Highlight certifications"],
  "implementationTimeline": {
    "immediate": [],
    "shortTerm": [],
    "longTerm": []
  }
}`;
  }

  private static parseAuthorityPlan(planText: string): AuthorityBuildingPlan {
    try {
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in authority plan response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        overallStrategy: parsed.overallStrategy || 'Build authority through expert content and credible sources',
        priorityActions: Array.isArray(parsed.priorityActions) ? parsed.priorityActions.map((action: any) => ({
          type: ['citation', 'expert_quote', 'case_study', 'statistic', 'research', 'credential'].includes(action.type) 
            ? action.type : 'citation',
          title: action.title || 'Authority improvement',
          description: action.description || '',
          implementation: action.implementation || '',
          priority: ['low', 'medium', 'high'].includes(action.priority) ? action.priority : 'medium',
          effort: ['low', 'medium', 'high'].includes(action.effort) ? action.effort : 'medium',
          impact: ['low', 'medium', 'high'].includes(action.impact) ? action.impact : 'medium',
          sources: Array.isArray(action.sources) ? action.sources : []
        })) : [],
        citationRecommendations: Array.isArray(parsed.citationRecommendations) ? parsed.citationRecommendations : [],
        expertQuoteOpportunities: Array.isArray(parsed.expertQuoteOpportunities) ? parsed.expertQuoteOpportunities : [],
        credentialHighlights: Array.isArray(parsed.credentialHighlights) ? parsed.credentialHighlights : [],
        implementationTimeline: {
          immediate: Array.isArray(parsed.implementationTimeline?.immediate) ? parsed.implementationTimeline.immediate : [],
          shortTerm: Array.isArray(parsed.implementationTimeline?.shortTerm) ? parsed.implementationTimeline.shortTerm : [],
          longTerm: Array.isArray(parsed.implementationTimeline?.longTerm) ? parsed.implementationTimeline.longTerm : []
        }
      };
    } catch (error) {
      console.error('Error parsing authority plan:', error);
      return this.getDefaultAuthorityPlan();
    }
  }

  private static getDefaultAuthorityPlan(): AuthorityBuildingPlan {
    return {
      overallStrategy: 'Build authority through expert content, credible sources, and trust signals',
      priorityActions: [
        {
          type: 'citation',
          title: 'Add authoritative citations',
          description: 'Include references to government and academic sources',
          implementation: 'Add 3-5 citations throughout content',
          priority: 'high',
          effort: 'low',
          impact: 'high'
        }
      ],
      citationRecommendations: [],
      expertQuoteOpportunities: [],
      credentialHighlights: ['Add author bio', 'Display relevant credentials'],
      implementationTimeline: {
        immediate: [],
        shortTerm: [],
        longTerm: []
      }
    };
  }
}
