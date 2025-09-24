import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/contexts/content-builder/types/solution-types';

export interface TaskBreakdown {
  workflowTitle: string;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  estimatedTotalTime: number; // minutes
  tasks: IntelligentTask[];
  solutionsRequired: string[];
  solutionsOptional?: string[];
  crossSolutionOpportunities?: string[];
  successCriteria: string[];
  riskFactors: string[];
}

export interface IntelligentTask {
  id: string;
  title: string;
  description: string;
  category: 'analysis' | 'content_creation' | 'strategy' | 'execution' | 'review';
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number; // minutes
  requiresAI: boolean;
  aiProvider?: 'google' | 'openai' | 'anthropic';
  aiModel?: string;
  contextRequired: string[];
  solutionIntegration?: string[];
  dependencies?: string[];
  canRunParallel: boolean;
  conditions?: {
    type: string;
    description: string;
    value?: any;
  }[];
  adaptivePromptTemplates?: {
    context: string;
    template: string;
  }[];
  expectedOutputs: string[];
}

export interface WorkflowExecutionContext {
  userId: string;
  availableSolutions: Solution[];
  userContext: any;
  businessContext: any;
  previousWorkflows: any[];
}

export class SmartTaskDecomposer {
  /**
   * Use AI to intelligently decompose a complex request into executable tasks
   */
  static async decomposeRequest(
    request: string,
    context: WorkflowExecutionContext,
    intelligenceLevel: 'basic' | 'advanced' | 'expert' = 'advanced'
  ): Promise<TaskBreakdown> {
    console.log('🔬 Decomposing request:', request);

    try {
      // Step 1: Analyze request using AI
      const analysis = await this.analyzeRequestWithAI(request, context, intelligenceLevel);
      
      // Step 2: Identify solutions that could be integrated
      const solutionAnalysis = await this.analyzeSolutionIntegration(request, context.availableSolutions);
      
      // Step 3: Generate intelligent task breakdown
      const taskBreakdown = await this.generateTaskBreakdown(
        request,
        analysis, 
        solutionAnalysis,
        context,
        intelligenceLevel
      );

      // Step 4: Optimize task order and dependencies
      const optimizedTasks = await this.optimizeTaskExecution(taskBreakdown.tasks, context);

      const finalBreakdown: TaskBreakdown = {
        ...taskBreakdown,
        tasks: optimizedTasks,
        crossSolutionOpportunities: this.identifyCrossSolutionOpportunities(
          optimizedTasks,
          context.availableSolutions
        )
      };

      console.log('✅ Task decomposition complete:', finalBreakdown.workflowTitle);
      return finalBreakdown;

    } catch (error) {
      console.error('Task decomposition failed:', error);
      
      // Fallback to basic decomposition
      return this.createFallbackBreakdown(request, context);
    }
  }

  /**
   * Analyze request using AI to understand intent and complexity
   */
  private static async analyzeRequestWithAI(
    request: string,
    context: WorkflowExecutionContext,
    intelligenceLevel: string
  ): Promise<{
    intent: string;
    complexity: string;
    domain: string;
    keyEntities: string[];
    suggestedApproach: string;
    estimatedEffort: number;
  }> {
    const systemPrompt = `You are an intelligent workflow analyzer. Analyze the user request and provide structured insights.

Available solutions: ${context.availableSolutions.map(s => `${s.name} (${s.category})`).join(', ')}
Intelligence Level: ${intelligenceLevel}
User Context: ${JSON.stringify(context.userContext)}

Provide analysis in JSON format with:
- intent: Main goal of the request
- complexity: simple/moderate/complex/expert
- domain: Business domain (marketing, analytics, etc.)
- keyEntities: Important entities mentioned
- suggestedApproach: Recommended approach
- estimatedEffort: Time in minutes`;

    try {
      const response = await supabase.functions.invoke('ai-context-manager', {
        body: {
          provider: 'google',
          endpoint: 'chat',
          params: {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Analyze this request: "${request}"` }
            ],
            temperature: 0.3,
            maxTokens: 800
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Parse AI response
      const aiResult = response.data.choices[0].message.content;
      const analysis = JSON.parse(aiResult);
      
      return {
        intent: analysis.intent || 'General task execution',
        complexity: analysis.complexity || 'moderate',
        domain: analysis.domain || 'general',
        keyEntities: analysis.keyEntities || [],
        suggestedApproach: analysis.suggestedApproach || 'Step-by-step execution',
        estimatedEffort: analysis.estimatedEffort || 30
      };

    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Fallback analysis
      return {
        intent: 'Task execution',
        complexity: 'moderate',
        domain: 'general',
        keyEntities: this.extractEntitiesFromText(request),
        suggestedApproach: 'Sequential task execution',
        estimatedEffort: 30
      };
    }
  }

  /**
   * Analyze which solutions should be integrated
   */
  private static async analyzeSolutionIntegration(
    request: string,
    availableSolutions: Solution[]
  ): Promise<{
    primarySolutions: string[];
    secondarySolutions: string[];
    integrationPoints: string[];
  }> {
    const requestLower = request.toLowerCase();
    const primarySolutions: string[] = [];
    const secondarySolutions: string[] = [];
    const integrationPoints: string[] = [];

    for (const solution of availableSolutions) {
      const solutionName = solution.name.toLowerCase();
      const solutionCategory = solution.category?.toLowerCase() || '';
      const solutionDescription = solution.description?.toLowerCase() || '';

      // Check if solution is directly mentioned
      if (requestLower.includes(solutionName)) {
        primarySolutions.push(solution.id);
        continue;
      }

      // Check if solution category is relevant
      if (requestLower.includes(solutionCategory)) {
        secondarySolutions.push(solution.id);
        continue;
      }

      // Check for keyword matches in description
      const keywords = this.extractKeywords(request);
      const hasRelevantKeywords = keywords.some(keyword => 
        solutionDescription.includes(keyword.toLowerCase())
      );

      if (hasRelevantKeywords) {
        secondarySolutions.push(solution.id);
      }

      // Identify integration points (simplified)
      if ((solution as any).technical_specifications?.integrations) {
        integrationPoints.push(...(solution as any).technical_specifications.integrations);
      }
    }

    return {
      primarySolutions,
      secondarySolutions,
      integrationPoints: [...new Set(integrationPoints)]
    };
  }

  /**
   * Generate detailed task breakdown using AI
   */
  private static async generateTaskBreakdown(
    request: string,
    analysis: any,
    solutionAnalysis: any,
    context: WorkflowExecutionContext,
    intelligenceLevel: string
  ): Promise<TaskBreakdown> {
    const systemPrompt = `You are an expert workflow architect. Create a detailed task breakdown for the given request.

Request: ${request}
Analysis: ${JSON.stringify(analysis)}
Primary Solutions: ${solutionAnalysis.primarySolutions}
Secondary Solutions: ${solutionAnalysis.secondarySolutions}
Intelligence Level: ${intelligenceLevel}

Create a JSON response with:
- workflowTitle: Descriptive title
- description: Brief description
- complexity: ${analysis.complexity}
- estimatedTotalTime: Total minutes
- tasks: Array of detailed tasks
- solutionsRequired: Solution IDs needed
- successCriteria: Success measurements
- riskFactors: Potential issues

Each task should include:
- id, title, description, category, priority
- estimatedDuration (minutes)
- requiresAI, aiProvider, aiModel
- contextRequired, solutionIntegration
- dependencies, canRunParallel
- expectedOutputs`;

    try {
      const response = await supabase.functions.invoke('ai-context-manager', {
        body: {
          provider: 'google',
          endpoint: 'chat',
          params: {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: 'Generate the task breakdown.' }
            ],
            temperature: 0.4,
            maxTokens: 1500
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiResult = response.data.choices[0].message.content;
      const breakdown = JSON.parse(aiResult);

      // Enhance tasks with intelligent capabilities
      const enhancedTasks = breakdown.tasks.map((task: any, index: number) => ({
        ...task,
        id: task.id || `task_${index + 1}`,
        category: task.category || 'execution',
        priority: task.priority || 'medium',
        requiresAI: this.shouldUseAI(task, intelligenceLevel),
        aiProvider: task.requiresAI ? (task.aiProvider || 'google') : undefined,
        contextRequired: task.contextRequired || ['user_context'],
        canRunParallel: task.canRunParallel || false,
        adaptivePromptTemplates: this.generateAdaptivePrompts(task, context)
      }));

      return {
        workflowTitle: breakdown.workflowTitle || `Workflow for: ${request.substring(0, 50)}...`,
        description: breakdown.description || analysis.suggestedApproach,
        complexity: breakdown.complexity || analysis.complexity,
        estimatedTotalTime: breakdown.estimatedTotalTime || analysis.estimatedEffort,
        tasks: enhancedTasks,
        solutionsRequired: solutionAnalysis.primarySolutions,
        solutionsOptional: solutionAnalysis.secondarySolutions,
        successCriteria: breakdown.successCriteria || ['Task completion', 'Quality standards met'],
        riskFactors: breakdown.riskFactors || ['Complex dependencies', 'Resource availability']
      };

    } catch (error) {
      console.error('Task breakdown generation failed:', error);
      throw error;
    }
  }

  /**
   * Optimize task execution order and dependencies
   */
  private static async optimizeTaskExecution(
    tasks: IntelligentTask[],
    context: WorkflowExecutionContext
  ): Promise<IntelligentTask[]> {
    // Sort by priority and dependencies
    const sortedTasks = [...tasks].sort((a, b) => {
      // Priority weight
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Dependency weight (tasks with fewer dependencies first)
      const aDeps = a.dependencies?.length || 0;
      const bDeps = b.dependencies?.length || 0;
      
      return aDeps - bDeps;
    });

    // Set up parallel execution opportunities
    const optimizedTasks = sortedTasks.map((task, index) => {
      // Tasks that don't depend on previous tasks can run in parallel
      const canRunParallel = !task.dependencies || 
        task.dependencies.every(depId => 
          sortedTasks.findIndex(t => t.id === depId) < index
        );

      return {
        ...task,
        canRunParallel: canRunParallel && task.category !== 'review'
      };
    });

    return optimizedTasks;
  }

  /**
   * Identify cross-solution opportunities
   */
  private static identifyCrossSolutionOpportunities(
    tasks: IntelligentTask[],
    availableSolutions: Solution[]
  ): string[] {
    const opportunities: string[] = [];
    
    // Look for tasks that could benefit from multiple solutions
    for (const task of tasks) {
      if (task.solutionIntegration && task.solutionIntegration.length > 1) {
        const solutionNames = task.solutionIntegration
          .map(sId => availableSolutions.find(s => s.id === sId)?.name)
          .filter(Boolean);
        
        if (solutionNames.length > 1) {
          opportunities.push(`Integrate ${solutionNames.join(' + ')} for ${task.title}`);
        }
      }
    }

    // Look for complementary solution patterns
    const solutionCategories = new Set(
      availableSolutions.map(s => s.category).filter(Boolean)
    );

    if (solutionCategories.has('Data Analytics') && solutionCategories.has('Business Intelligence')) {
      opportunities.push('Data Analytics → Business Intelligence pipeline');
    }
    
    if (solutionCategories.has('People Analytics') && solutionCategories.has('HR Tech')) {
      opportunities.push('People Analytics + HR Tech integration');
    }

    return opportunities;
  }

  /**
   * Determine if task should use AI
   */
  private static shouldUseAI(task: any, intelligenceLevel: string): boolean {
    const aiCategories = ['analysis', 'content_creation', 'strategy'];
    const isAICategory = aiCategories.includes(task.category);
    
    const aiKeywords = ['analyze', 'generate', 'create', 'optimize', 'suggest', 'recommend'];
    const hasAIKeywords = aiKeywords.some(keyword => 
      task.title.toLowerCase().includes(keyword) || 
      task.description.toLowerCase().includes(keyword)
    );

    if (intelligenceLevel === 'expert') return isAICategory || hasAIKeywords;
    if (intelligenceLevel === 'advanced') return isAICategory;
    return hasAIKeywords && task.category === 'content_creation';
  }

  /**
   * Generate adaptive prompts for tasks
   */
  private static generateAdaptivePrompts(
    task: any,
    context: WorkflowExecutionContext
  ): { context: string; template: string }[] {
    const prompts: { context: string; template: string }[] = [];

    if (task.category === 'analysis') {
      prompts.push({
        context: 'data_analysis',
        template: `Analyze the provided data for ${task.title}. Focus on key insights and actionable recommendations. Available solutions: {{availableSolutions}}`
      });
    }

    if (task.category === 'content_creation') {
      prompts.push({
        context: 'content_generation',
        template: `Create high-quality content for ${task.title}. Consider the user's context: {{userContext}} and integrate these solutions: {{solutionIntegration}}`
      });
    }

    if (task.category === 'strategy') {
      prompts.push({
        context: 'strategic_planning',
        template: `Develop strategic recommendations for ${task.title}. Consider business context: {{businessContext}} and solution capabilities.`
      });
    }

    return prompts;
  }

  /**
   * Extract entities from text using simple NLP
   */
  private static extractEntitiesFromText(text: string): string[] {
    // Simple entity extraction - in production, use more sophisticated NLP
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10); // Top 10 relevant words
  }

  /**
   * Extract keywords from request
   */
  private static extractKeywords(text: string): string[] {
    const businessKeywords = [
      'analytics', 'data', 'content', 'marketing', 'strategy', 'optimization',
      'performance', 'insights', 'reporting', 'automation', 'integration',
      'analysis', 'dashboard', 'metrics', 'kpi', 'roi', 'conversion'
    ];

    const textLower = text.toLowerCase();
    return businessKeywords.filter(keyword => textLower.includes(keyword));
  }

  /**
   * Create fallback breakdown when AI fails
   */
  private static createFallbackBreakdown(
    request: string,
    context: WorkflowExecutionContext
  ): TaskBreakdown {
    const basicTasks: IntelligentTask[] = [
      {
        id: 'task_1',
        title: 'Initial Analysis',
        description: 'Analyze the request and gather requirements',
        category: 'analysis',
        priority: 'high',
        estimatedDuration: 10,
        requiresAI: true,
        contextRequired: ['user_context'],
        canRunParallel: false,
        expectedOutputs: ['Requirements document', 'Analysis summary']
      },
      {
        id: 'task_2', 
        title: 'Execute Main Task',
        description: 'Execute the primary task based on analysis',
        category: 'execution',
        priority: 'high',
        estimatedDuration: 20,
        requiresAI: false,
        contextRequired: ['task_1_output'],
        dependencies: ['task_1'],
        canRunParallel: false,
        expectedOutputs: ['Task results', 'Status report']
      },
      {
        id: 'task_3',
        title: 'Review and Finalize',
        description: 'Review results and provide final recommendations',
        category: 'review',
        priority: 'medium',
        estimatedDuration: 10,
        requiresAI: true,
        contextRequired: ['task_2_output'],
        dependencies: ['task_2'],
        canRunParallel: false,
        expectedOutputs: ['Final report', 'Recommendations']
      }
    ];

    return {
      workflowTitle: `Basic Workflow: ${request.substring(0, 50)}`,
      description: 'Fallback workflow with basic task structure',
      complexity: 'simple',
      estimatedTotalTime: 40,
      tasks: basicTasks,
      solutionsRequired: [],
      successCriteria: ['All tasks completed successfully'],
      riskFactors: ['Limited AI analysis', 'Basic task structure']
    };
  }
}