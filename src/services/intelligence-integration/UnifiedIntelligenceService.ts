import AIServiceController from '@/services/aiService/AIServiceController';
import { toast } from 'sonner';

// Unified intelligence interfaces
export interface SystemInsight {
  id: string;
  system: 'content' | 'ab_testing' | 'workflow' | 'serp' | 'strategy';
  type: 'performance' | 'optimization' | 'pattern' | 'anomaly';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: any;
  recommendations: string[];
  created_at: Date;
  expires_at?: Date;
}

export interface CrossSystemPattern {
  id: string;
  pattern_type: 'workflow' | 'performance' | 'user_behavior' | 'content_success';
  systems_involved: string[];
  frequency: number;
  success_rate: number;
  impact_score: number;
  description: string;
  recommendations: string[];
  data_points: any[];
}

export interface UnifiedDecision {
  id: string;
  decision_type: 'content_optimization' | 'workflow_automation' | 'resource_allocation' | 'priority_adjustment';
  confidence: number;
  reasoning: string;
  affected_systems: string[];
  action_plan: string[];
  expected_impact: string;
  metrics_to_track: string[];
}

class UnifiedIntelligenceServiceSimple {
  private insights: SystemInsight[] = [];
  private patterns: CrossSystemPattern[] = [];

  /**
   * Initialize unified intelligence system
   */
  async initialize(userId: string): Promise<void> {
    try {
      await this.generateMockInsights();
      await this.generateMockPatterns();
      toast.success('Intelligence system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize unified intelligence:', error);
      toast.error('Failed to initialize intelligence system');
    }
  }

  /**
   * Generate mock insights for demonstration
   */
  private async generateMockInsights(): Promise<void> {
    this.insights = [
      {
        id: 'insight-1',
        system: 'content',
        type: 'performance',
        title: 'High-Performing Content Identified',
        description: 'Content pieces with "How-to" titles are showing 45% higher engagement rates',
        impact: 'high',
        confidence: 0.87,
        data: { engagement_increase: '45%', content_type: 'how-to' },
        recommendations: [
          'Create more how-to content',
          'Optimize existing titles with how-to format',
          'Analyze successful how-to patterns'
        ],
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'insight-2',
        system: 'ab_testing',
        type: 'optimization',
        title: 'A/B Test Conversion Pattern',
        description: 'Button color tests consistently show blue variants outperforming red by 12%',
        impact: 'medium',
        confidence: 0.92,
        data: { conversion_lift: '12%', winning_color: 'blue' },
        recommendations: [
          'Update default button color to blue',
          'Test blue variations across all campaigns',
          'Document color preference guidelines'
        ],
        created_at: new Date(),
      },
      {
        id: 'insight-3',
        system: 'workflow',
        type: 'pattern',
        title: 'Automation Opportunity Detected',
        description: 'Content approval workflows taking 3x longer than optimal due to manual steps',
        impact: 'critical',
        confidence: 0.78,
        data: { current_time: '3.2 hours', optimal_time: '1.1 hours' },
        recommendations: [
          'Implement automated pre-screening',
          'Add smart routing based on content type',
          'Create approval templates for common scenarios'
        ],
        created_at: new Date(),
      },
      {
        id: 'insight-4',
        system: 'serp',
        type: 'anomaly',
        title: 'Ranking Drop Alert',
        description: 'Key pages dropped 15 positions in the last 7 days - competitor analysis recommended',
        impact: 'high',
        confidence: 0.95,
        data: { position_drop: 15, affected_pages: 8 },
        recommendations: [
          'Conduct immediate competitor content audit',
          'Update affected content with fresh insights',
          'Monitor competitor backlink strategies'
        ],
        created_at: new Date(),
      },
      {
        id: 'insight-5',
        system: 'strategy',
        type: 'optimization',
        title: 'Resource Reallocation Opportunity',
        description: 'AI strategy suggests focusing 60% more resources on video content based on engagement trends',
        impact: 'medium',
        confidence: 0.83,
        data: { suggested_increase: '60%', content_type: 'video' },
        recommendations: [
          'Increase video content production budget',
          'Train team on video optimization techniques',
          'Develop video content templates'
        ],
        created_at: new Date(),
      }
    ];
  }

  /**
   * Generate mock patterns for demonstration
   */
  private async generateMockPatterns(): Promise<void> {
    this.patterns = [
      {
        id: 'pattern-1',
        pattern_type: 'content_success',
        systems_involved: ['content', 'serp', 'ab_testing'],
        frequency: 85,
        success_rate: 0.91,
        impact_score: 8.7,
        description: 'Content published on Tuesdays with SEO optimization shows 91% success rate in A/B tests',
        recommendations: [
          'Schedule high-priority content for Tuesday publication',
          'Standardize SEO optimization checklist',
          'Create Tuesday publication workflow template'
        ],
        data_points: [
          { day: 'Tuesday', success_rate: 0.91 },
          { seo_optimized: true, conversion_rate: 0.23 }
        ]
      },
      {
        id: 'pattern-2',
        pattern_type: 'workflow',
        systems_involved: ['workflow', 'content', 'strategy'],
        frequency: 67,
        success_rate: 0.84,
        impact_score: 7.2,
        description: 'Automated workflows with AI-generated outlines complete 40% faster with higher quality scores',
        recommendations: [
          'Expand AI outline generation to all content types',
          'Create quality scoring automation',
          'Implement smart workflow routing'
        ],
        data_points: [
          { completion_time_reduction: '40%', quality_improvement: '23%' }
        ]
      },
      {
        id: 'pattern-3',
        pattern_type: 'performance',
        systems_involved: ['ab_testing', 'serp', 'strategy'],
        frequency: 43,
        success_rate: 0.76,
        impact_score: 6.8,
        description: 'Pages optimized through A/B testing show 2.3x better SERP performance when aligned with AI strategy recommendations',
        recommendations: [
          'Integrate SERP data into A/B test design',
          'Align all tests with AI strategy insights',
          'Create performance prediction models'
        ],
        data_points: [
          { serp_improvement: '2.3x', strategy_alignment: true }
        ]
      }
    ];
  }

  /**
   * Make unified AI decision
   */
  async makeUnifiedDecision(context: {
    decision_type: string;
    available_data: any;
    user_goals: string[];
    constraints: string[];
  }): Promise<UnifiedDecision | null> {
    try {
      const prompt = `
        Make a unified AI decision for:
        
        Decision Type: ${context.decision_type}
        Available Data: ${JSON.stringify(context.available_data)}
        User Goals: ${JSON.stringify(context.user_goals)}
        Constraints: ${JSON.stringify(context.constraints)}
        
        Current System Insights: ${JSON.stringify(this.insights.slice(0, 3))}
        Known Patterns: ${JSON.stringify(this.patterns.slice(0, 2))}
        
        Provide a comprehensive decision with:
        1. Confidence level (0-1)
        2. Clear reasoning
        3. Systems that will be affected
        4. Step-by-step action plan
        5. Expected impact
        6. Key metrics to track
        
        Return JSON:
        {
          "decision_type": "${context.decision_type}",
          "confidence": number,
          "reasoning": "detailed reasoning",
          "affected_systems": ["system1", "system2"],
          "action_plan": ["step1", "step2"],
          "expected_impact": "impact description",
          "metrics_to_track": ["metric1", "metric2"]
        }
      `;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.2,
        max_tokens: 1500
      });

      if (response?.content) {
        const decisionData = this.parseAISingleResponse(response.content);
        if (decisionData) {
          return {
            id: `decision-${Date.now()}`,
            decision_type: decisionData.decision_type || context.decision_type,
            confidence: decisionData.confidence || 0.5,
            reasoning: decisionData.reasoning || 'AI analysis completed',
            affected_systems: decisionData.affected_systems || [],
            action_plan: decisionData.action_plan || [],
            expected_impact: decisionData.expected_impact || 'Impact analysis pending',
            metrics_to_track: decisionData.metrics_to_track || []
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error making unified decision:', error);
      return null;
    }
  }

  /**
   * Get current system insights
   */
  getSystemInsights(): SystemInsight[] {
    // Filter out expired insights
    const now = new Date();
    return this.insights.filter(insight => 
      !insight.expires_at || insight.expires_at > now
    );
  }

  /**
   * Get cross-system patterns
   */
  getCrossSystemPatterns(): CrossSystemPattern[] {
    return this.patterns;
  }

  /**
   * Get insights by system
   */
  getInsightsBySystem(system: string): SystemInsight[] {
    return this.getSystemInsights().filter(insight => insight.system === system);
  }

  /**
   * Get high-impact insights
   */
  getHighImpactInsights(): SystemInsight[] {
    return this.getSystemInsights()
      .filter(insight => ['high', 'critical'].includes(insight.impact))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Parse AI single response object
   */
  private parseAISingleResponse(content: string): any | null {
    try {
      // Try to extract JSON object from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: try to parse the entire content
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing AI single response:', error);
      return null;
    }
  }

  /**
   * Save insights to localStorage (temporary solution)
   */
  async saveInsights(userId: string): Promise<void> {
    try {
      const insights = this.getSystemInsights();
      localStorage.setItem(
        `unified_insights_${userId}`, 
        JSON.stringify(insights)
      );
    } catch (error) {
      console.error('Error in saveInsights:', error);
    }
  }

  /**
   * Load saved insights from localStorage
   */
  async loadSavedInsights(userId: string): Promise<void> {
    try {
      const saved = localStorage.getItem(`unified_insights_${userId}`);
      if (saved) {
        const insights = JSON.parse(saved);
        this.insights = insights.map((item: any) => ({
          ...item,
          created_at: new Date(item.created_at),
          expires_at: item.expires_at ? new Date(item.expires_at) : undefined
        }));
      }
    } catch (error) {
      console.error('Error in loadSavedInsights:', error);
    }
  }
}

export const unifiedIntelligenceService = new UnifiedIntelligenceServiceSimple();