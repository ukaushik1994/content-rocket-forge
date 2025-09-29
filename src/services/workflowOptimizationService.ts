import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';

export interface WorkflowSuggestion {
  contentType: string;
  suggestedStages: WorkflowStage[];
  estimatedDuration: {
    total: number; // in hours
    perStage: Record<string, number>;
  };
  priorityScore: number;
  assignmentRecommendations: AssignmentRecommendation[];
  deadlineSuggestion: {
    date: string;
    confidence: number;
    reasoning: string;
  };
}

export interface WorkflowStage {
  name: string;
  description: string;
  order: number;
  estimatedHours: number;
  requiredSkills: string[];
  dependencies: string[];
  optional: boolean;
}

export interface AssignmentRecommendation {
  stage: string;
  recommendedRole: string;
  reasoning: string;
  alternativeRoles: string[];
}

export interface ContentComplexityAnalysis {
  overallComplexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  factors: {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }[];
  estimatedEffort: number; // hours
}

class WorkflowOptimizationService {
  /**
   * Generate optimized workflow suggestions based on content requirements
   */
  async suggestWorkflow(
    contentType: string,
    keywords: string[],
    targetWordCount: number,
    requirements: string[] = []
  ): Promise<WorkflowSuggestion> {
    try {
      // Analyze complexity
      const complexity = await this.analyzeComplexity(contentType, keywords, targetWordCount, requirements);

      const prompt = this.buildWorkflowPrompt(contentType, keywords, targetWordCount, requirements, complexity);

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'strategy',
        temperature: 0.4,
      });

      const suggestion = this.parseWorkflowResponse(response.content, contentType, complexity);
      return suggestion;
    } catch (error) {
      console.error('Workflow suggestion failed:', error);
      throw error;
    }
  }

  /**
   * Calculate priority score for content based on various factors
   */
  async calculatePriorityScore(
    keyword: string,
    contentType: string,
    searchVolume?: number,
    competitionLevel?: string
  ): Promise<number> {
    try {
      // Fetch any existing strategy data
      const { data: strategyData } = await supabase
        .from('ai_strategy_proposals')
        .select('*')
        .ilike('topic', `%${keyword}%`)
        .order('estimated_impressions', { ascending: false })
        .limit(1)
        .single();

      let baseScore = 50;

      // Adjust based on search volume
      if (searchVolume) {
        if (searchVolume > 10000) baseScore += 30;
        else if (searchVolume > 1000) baseScore += 20;
        else if (searchVolume > 100) baseScore += 10;
      }

      // Adjust based on competition
      if (competitionLevel) {
        if (competitionLevel === 'low') baseScore += 20;
        else if (competitionLevel === 'medium') baseScore += 10;
        else if (competitionLevel === 'high') baseScore -= 10;
        else if (competitionLevel === 'very-high') baseScore -= 20;
      }

      // Adjust based on content type
      if (contentType === 'blog') baseScore += 5;
      else if (contentType === 'script') baseScore += 10;

      // Adjust based on strategy impressions
      if (strategyData && strategyData.estimated_impressions) {
        baseScore += Math.min(20, Math.floor(strategyData.estimated_impressions / 1000));
      }

      return Math.max(0, Math.min(100, baseScore));
    } catch (error) {
      console.error('Priority score calculation failed:', error);
      return 50;
    }
  }

  /**
   * Predict deadline based on content complexity and requirements
   */
  async predictDeadline(
    contentType: string,
    complexity: ContentComplexityAnalysis,
    teamCapacity: number = 1
  ): Promise<WorkflowSuggestion['deadlineSuggestion']> {
    try {
      const totalHours = complexity.estimatedEffort;
      const workingHoursPerDay = 6; // Assuming 6 productive hours per day
      const daysRequired = Math.ceil(totalHours / (workingHoursPerDay * teamCapacity));

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysRequired);

      // Add buffer for reviews and revisions (20%)
      const bufferedDate = new Date(targetDate);
      bufferedDate.setDate(bufferedDate.getDate() + Math.ceil(daysRequired * 0.2));

      let confidence = 70;
      if (complexity.overallComplexity === 'simple') confidence = 85;
      else if (complexity.overallComplexity === 'very-complex') confidence = 50;

      return {
        date: bufferedDate.toISOString(),
        confidence,
        reasoning: `Based on ${totalHours}h estimated effort with ${teamCapacity} team member(s). Includes 20% buffer for reviews.`,
      };
    } catch (error) {
      console.error('Deadline prediction failed:', error);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return {
        date: defaultDate.toISOString(),
        confidence: 50,
        reasoning: 'Default 7-day deadline applied',
      };
    }
  }

  /**
   * Analyze content complexity
   */
  private async analyzeComplexity(
    contentType: string,
    keywords: string[],
    targetWordCount: number,
    requirements: string[]
  ): Promise<ContentComplexityAnalysis> {
    const factors: ContentComplexityAnalysis['factors'] = [];
    let totalImpactScore = 0;

    // Word count impact
    if (targetWordCount > 3000) {
      factors.push({
        factor: 'Long-form content',
        impact: 'high',
        description: `${targetWordCount} words requires extensive research and writing`,
      });
      totalImpactScore += 3;
    } else if (targetWordCount > 1500) {
      factors.push({
        factor: 'Medium-length content',
        impact: 'medium',
        description: `${targetWordCount} words requires moderate effort`,
      });
      totalImpactScore += 2;
    } else {
      factors.push({
        factor: 'Short-form content',
        impact: 'low',
        description: `${targetWordCount} words is relatively quick to produce`,
      });
      totalImpactScore += 1;
    }

    // Content type impact
    if (contentType === 'script' || contentType === 'carousel') {
      factors.push({
        factor: 'Specialized format',
        impact: 'medium',
        description: `${contentType} requires specific formatting and structure`,
      });
      totalImpactScore += 2;
    }

    // Keywords complexity
    if (keywords.length > 5) {
      factors.push({
        factor: 'Multiple target keywords',
        impact: 'medium',
        description: `Optimizing for ${keywords.length} keywords increases complexity`,
      });
      totalImpactScore += 2;
    }

    // Requirements complexity
    if (requirements.length > 3) {
      factors.push({
        factor: 'Multiple requirements',
        impact: 'high',
        description: `${requirements.length} specific requirements need attention`,
      });
      totalImpactScore += 3;
    }

    // Determine overall complexity
    let overallComplexity: ContentComplexityAnalysis['overallComplexity'];
    if (totalImpactScore <= 3) overallComplexity = 'simple';
    else if (totalImpactScore <= 6) overallComplexity = 'moderate';
    else if (totalImpactScore <= 9) overallComplexity = 'complex';
    else overallComplexity = 'very-complex';

    // Estimate effort
    let baseHours = 2;
    if (overallComplexity === 'moderate') baseHours = 4;
    else if (overallComplexity === 'complex') baseHours = 8;
    else if (overallComplexity === 'very-complex') baseHours = 16;

    return {
      overallComplexity,
      factors,
      estimatedEffort: baseHours,
    };
  }

  private buildWorkflowPrompt(
    contentType: string,
    keywords: string[],
    targetWordCount: number,
    requirements: string[],
    complexity: ContentComplexityAnalysis
  ): string {
    return `
Design an optimized content creation workflow for this project.

Content Type: ${contentType}
Keywords: ${keywords.join(', ')}
Target Word Count: ${targetWordCount}
Requirements: ${requirements.join(', ') || 'None specified'}
Complexity: ${complexity.overallComplexity} (${complexity.estimatedEffort} hours estimated)

Create a detailed workflow with:
1. Suggested workflow stages (Research, Outline, Draft, Edit, Review, etc.)
2. Estimated hours per stage
3. Required skills for each stage
4. Stage dependencies
5. Role assignment recommendations (Writer, Editor, SEO Specialist, etc.)

Return ONLY valid JSON:
{
  "suggestedStages": [
    {
      "name": "string",
      "description": "string",
      "order": number,
      "estimatedHours": number,
      "requiredSkills": ["string"],
      "dependencies": ["string"],
      "optional": boolean
    }
  ],
  "assignmentRecommendations": [
    {
      "stage": "string",
      "recommendedRole": "string",
      "reasoning": "string",
      "alternativeRoles": ["string"]
    }
  ]
}
    `.trim();
  }

  private parseWorkflowResponse(
    response: string,
    contentType: string,
    complexity: ContentComplexityAnalysis
  ): WorkflowSuggestion {
    const data = this.extractJson(response);

    const suggestedStages = data?.suggestedStages || this.getDefaultStages(contentType);
    const totalHours = suggestedStages.reduce((sum: number, stage: WorkflowStage) => sum + stage.estimatedHours, 0);
    const perStage: Record<string, number> = {};
    suggestedStages.forEach((stage: WorkflowStage) => {
      perStage[stage.name] = stage.estimatedHours;
    });

    return {
      contentType,
      suggestedStages,
      estimatedDuration: {
        total: totalHours,
        perStage,
      },
      priorityScore: 50,
      assignmentRecommendations: data?.assignmentRecommendations || [],
      deadlineSuggestion: {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 70,
        reasoning: 'Default 7-day timeline',
      },
    };
  }

  private getDefaultStages(contentType: string): WorkflowStage[] {
    return [
      {
        name: 'Research & Planning',
        description: 'Gather information and plan content structure',
        order: 1,
        estimatedHours: 2,
        requiredSkills: ['research', 'planning'],
        dependencies: [],
        optional: false,
      },
      {
        name: 'Content Creation',
        description: 'Write and format the content',
        order: 2,
        estimatedHours: 4,
        requiredSkills: ['writing', 'content-creation'],
        dependencies: ['Research & Planning'],
        optional: false,
      },
      {
        name: 'SEO Optimization',
        description: 'Optimize for search engines',
        order: 3,
        estimatedHours: 1,
        requiredSkills: ['seo', 'keyword-optimization'],
        dependencies: ['Content Creation'],
        optional: false,
      },
      {
        name: 'Review & Edit',
        description: 'Review and edit for quality',
        order: 4,
        estimatedHours: 1,
        requiredSkills: ['editing', 'proofreading'],
        dependencies: ['SEO Optimization'],
        optional: false,
      },
    ];
  }

  private extractJson(text: string): Record<string, any> | null {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as Record<string, any>;
      }
      return JSON.parse(text) as Record<string, any>;
    } catch (error) {
      console.error('Failed to parse workflow JSON:', error);
      return null;
    }
  }
}

export const workflowOptimizationService = new WorkflowOptimizationService();
