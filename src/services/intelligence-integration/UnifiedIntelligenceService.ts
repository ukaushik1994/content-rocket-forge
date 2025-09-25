import { supabase } from '@/integrations/supabase/client';
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

class UnifiedIntelligenceService {
  private insights: SystemInsight[] = [];
  private patterns: CrossSystemPattern[] = [];

  /**
   * Initialize unified intelligence system
   */
  async initialize(userId: string): Promise<void> {
    try {
      await this.loadSystemData(userId);
      await this.analyzeSystemPatterns(userId);
      await this.generateUnifiedInsights(userId);
    } catch (error) {
      console.error('Failed to initialize unified intelligence:', error);
      toast.error('Failed to initialize intelligence system');
    }
  }

  /**
   * Load data from all systems
   */
  private async loadSystemData(userId: string): Promise<Record<string, any[]>> {
    const [
      contentItems,
      abTests,
      workflows,
      serpData,
      strategies
    ] = await Promise.all([
      this.loadContentData(userId),
      this.loadABTestData(userId),
      this.loadWorkflowData(userId),
      this.loadSerpData(userId),
      this.loadStrategyData(userId)
    ]);

    return {
      content: contentItems,
      ab_testing: abTests,
      workflows: workflows,
      serp: serpData,
      strategies: strategies
    };
  }

  /**
   * Load content system data
   */
  private async loadContentData(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading content data:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Load A/B testing data
   */
  private async loadABTestData(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading A/B test data:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Load workflow data
   */
  private async loadWorkflowData(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('intelligent_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading workflow data:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Load SERP data
   */
  private async loadSerpData(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('raw_serp_data')
      .select('*')
      .eq('user_id', userId)
      .order('cached_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading SERP data:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Load strategy data
   */
  private async loadStrategyData(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ai_strategies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading strategy data:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Analyze patterns across all systems
   */
  private async analyzeSystemPatterns(userId: string): Promise<void> {
    try {
      const systemData = await this.loadSystemData(userId);
      
      const prompt = `
        Analyze cross-system patterns from this comprehensive data:
        
        Content System: ${JSON.stringify(systemData.content?.slice(0, 10) || [])}
        A/B Testing: ${JSON.stringify(systemData.ab_testing?.slice(0, 5) || [])}
        Workflows: ${JSON.stringify(systemData.workflows?.slice(0, 10) || [])}
        SERP Data: ${JSON.stringify(systemData.serp?.slice(0, 10) || [])}
        Strategies: ${JSON.stringify(systemData.strategies?.slice(0, 5) || [])}
        
        Identify:
        1. Cross-system success patterns
        2. Performance correlations between systems
        3. User behavior patterns across platforms
        4. Optimization opportunities
        5. Resource allocation insights
        
        Return a JSON array of patterns with structure:
        {
          "pattern_type": "workflow|performance|user_behavior|content_success",
          "systems_involved": ["system1", "system2"],
          "frequency": number,
          "success_rate": number,
          "impact_score": number,
          "description": "pattern description",
          "recommendations": ["rec1", "rec2"],
          "data_points": [relevant data]
        }
      `;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.3,
        max_tokens: 2000
      });

      if (response?.content) {
        const patterns = this.parseAIResponse(response.content);
        this.patterns = patterns.map((pattern: any, index: number) => ({
          id: `pattern-${Date.now()}-${index}`,
          ...pattern
        }));
      }
    } catch (error) {
      console.error('Error analyzing system patterns:', error);
    }
  }

  /**
   * Generate unified insights across all systems
   */
  private async generateUnifiedInsights(userId: string): Promise<void> {
    try {
      const systemData = await this.loadSystemData(userId);
      const patterns = this.patterns;

      const prompt = `
        Generate unified intelligence insights from:
        
        System Patterns: ${JSON.stringify(patterns)}
        Recent Performance Data:
        - Content: ${systemData.content?.length || 0} items
        - A/B Tests: ${systemData.ab_testing?.length || 0} tests
        - Workflows: ${systemData.workflows?.length || 0} workflows
        - SERP Queries: ${systemData.serp?.length || 0} queries
        - Strategies: ${systemData.strategies?.length || 0} strategies
        
        Generate actionable insights focusing on:
        1. Cross-system optimization opportunities
        2. Performance anomalies requiring attention
        3. Resource reallocation recommendations
        4. Workflow automation opportunities
        5. Strategic priority adjustments
        
        Return JSON array of insights:
        {
          "system": "content|ab_testing|workflow|serp|strategy",
          "type": "performance|optimization|pattern|anomaly",
          "title": "insight title",
          "description": "detailed description",
          "impact": "low|medium|high|critical",
          "confidence": number (0-1),
          "recommendations": ["action1", "action2"],
          "expires_in_hours": number
        }
      `;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.4,
        max_tokens: 2500
      });

      if (response?.content) {
        const insights = this.parseAIResponse(response.content);
        this.insights = insights.map((insight: any, index: number) => ({
          id: `insight-${Date.now()}-${index}`,
          ...insight,
          data: {},
          created_at: new Date(),
          expires_at: insight.expires_in_hours ? 
            new Date(Date.now() + insight.expires_in_hours * 60 * 60 * 1000) : 
            undefined
        }));
      }
    } catch (error) {
      console.error('Error generating unified insights:', error);
    }
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
        
        Current System Insights: ${JSON.stringify(this.insights.slice(0, 5))}
        Known Patterns: ${JSON.stringify(this.patterns.slice(0, 3))}
        
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
   * Parse AI response
   */
  private parseAIResponse(content: string): any[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: try to parse the entire content
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
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

export const unifiedIntelligenceService = new UnifiedIntelligenceService();