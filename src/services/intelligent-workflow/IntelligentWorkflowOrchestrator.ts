import { supabase } from '@/integrations/supabase/client';
import { WorkflowStep, WorkflowChain } from '../workflowChainService';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { SmartTaskDecomposer, TaskBreakdown } from './SmartTaskDecomposer';
import { SolutionAwareWorkflowEngine } from './SolutionAwareWorkflowEngine';

export interface IntelligentWorkflowStep extends WorkflowStep {
  category?: string; // Add category for solution alignment
  aiCapabilities?: {
    requiresAI: boolean;
    aiProvider?: string;
    aiModel?: string;
    contextRequired?: string[];
    solutionIntegration?: string[];
  };
  dependencies?: string[];
  conditions?: {
    type: 'success' | 'data_threshold' | 'user_approval';
    value?: any;
  }[];
  parallelExecution?: boolean;
  adaptivePrompts?: {
    context: string;
    dynamicPrompt: string;
  }[];
}

export interface IntelligentWorkflow extends Omit<WorkflowChain, 'steps' | 'status'> {
  steps: IntelligentWorkflowStep[];
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  intelligenceLevel: 'basic' | 'advanced' | 'expert';
  solutionIntegration: {
    primarySolutions: string[];
    secondarySolutions: string[];
    crossSolutionActions: string[];
  };
  adaptiveContext: {
    learningData: any;
    userPreferences: any;
    pastPerformance: any;
  };
  orchestrationRules: {
    autoAdvance: boolean;
    rollbackOnFailure: boolean;
    parallelProcessing: boolean;
    contextualAdaptation: boolean;
  };
}

export interface WorkflowExecutionContext {
  userId: string;
  availableSolutions: Solution[];
  userContext: any;
  businessContext: any;
  previousWorkflows: IntelligentWorkflow[];
}

export class IntelligentWorkflowOrchestrator {
  private static activeWorkflows = new Map<string, IntelligentWorkflow>();
  private static executionHistory = new Map<string, any[]>();

  /**
   * Create an intelligent workflow with AI-driven task decomposition
   */
  static async createIntelligentWorkflow(
    request: string,
    context: WorkflowExecutionContext,
    options: {
      intelligenceLevel?: 'basic' | 'advanced' | 'expert';
      autoExecute?: boolean;
      solutionFocus?: string[];
    } = {}
  ): Promise<IntelligentWorkflow> {
    console.log('🧠 Creating intelligent workflow for:', request);

    // Step 1: Use AI to decompose the complex request into tasks
    const taskBreakdown = await SmartTaskDecomposer.decomposeRequest(
      request,
      context,
      options.intelligenceLevel || 'advanced'
    );

    // Step 2: Create solution-aware workflow steps
    const intelligentSteps = await this.generateIntelligentSteps(
      taskBreakdown,
      context,
      options.solutionFocus
    );

    // Step 3: Build the intelligent workflow structure
    const workflow: IntelligentWorkflow = {
      id: crypto.randomUUID(),
      userId: context.userId,
      title: taskBreakdown.workflowTitle,
      type: 'intelligent_workflow',
      status: 'active',
      currentStepIndex: 0,
      steps: intelligentSteps,
      context: {
        originalRequest: request,
        decomposition: taskBreakdown,
        userContext: context.userContext,
        businessContext: context.businessContext
      },
      startedAt: new Date(),
      intelligenceLevel: options.intelligenceLevel || 'advanced',
      solutionIntegration: {
        primarySolutions: taskBreakdown.solutionsRequired,
        secondarySolutions: taskBreakdown.solutionsOptional || [],
        crossSolutionActions: taskBreakdown.crossSolutionOpportunities || []
      },
      adaptiveContext: {
        learningData: await this.gatherLearningData(context.userId),
        userPreferences: context.userContext.preferences || {},
        pastPerformance: await this.getWorkflowPerformanceHistory(context.userId)
      },
      orchestrationRules: {
        autoAdvance: options.intelligenceLevel === 'expert',
        rollbackOnFailure: true,
        parallelProcessing: intelligentSteps.some(s => s.parallelExecution),
        contextualAdaptation: options.intelligenceLevel !== 'basic'
      }
    };

    // Step 4: Store workflow in database
    await this.saveIntelligentWorkflow(workflow);

    // Step 5: Store in memory for execution
    this.activeWorkflows.set(workflow.id, workflow);

    // Step 6: Auto-execute if requested
    if (options.autoExecute !== false) {
      this.executeIntelligentWorkflow(workflow.id);
    }

    console.log('✅ Intelligent workflow created:', workflow.id);
    return workflow;
  }

  /**
   * Execute intelligent workflow with AI orchestration
   */
  static async executeIntelligentWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      console.error('Workflow not found:', workflowId);
      return false;
    }

    console.log('🚀 Executing intelligent workflow:', workflow.title);

    try {
      workflow.status = 'active';
      const executionLog: any[] = [];

      // Execute steps based on orchestration rules
      for (let i = workflow.currentStepIndex; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        // Check dependencies
        if (step.dependencies && !this.checkDependencies(step.dependencies, workflow)) {
          console.log(`⏸️ Step ${step.id} waiting for dependencies`);
          break;
        }

        // Check conditions
        if (step.conditions && !this.evaluateConditions(step.conditions, workflow)) {
          console.log(`⏸️ Step ${step.id} conditions not met`);
          break;
        }

        console.log(`▶️ Executing step: ${step.title}`);
        
        // Execute step with AI capabilities
        const stepResult = await this.executeIntelligentStep(step, workflow);
        
        executionLog.push({
          stepId: step.id,
          timestamp: new Date().toISOString(),
          result: stepResult,
          performance: stepResult.performance
        });

        // Update step status
        step.completed = stepResult.success;
        step.data = stepResult.data;

        // Handle step failure
        if (!stepResult.success) {
          if (workflow.orchestrationRules.rollbackOnFailure) {
            await this.rollbackWorkflow(workflow, i);
          }
          workflow.status = 'failed';
          break;
        }

        // Adaptive context update
        if (workflow.orchestrationRules.contextualAdaptation) {
          await this.updateAdaptiveContext(workflow, step, stepResult);
        }

        workflow.currentStepIndex = i + 1;

        // Auto-advance or wait for user
        if (!workflow.orchestrationRules.autoAdvance && step.aiCapabilities?.requiresAI) {
          console.log(`⏸️ Pausing for user review after AI step: ${step.title}`);
          workflow.status = 'paused';
          break;
        }
      }

      // Complete workflow if all steps done
      if (workflow.currentStepIndex >= workflow.steps.length) {
        workflow.status = 'completed';
        workflow.completedAt = new Date();
        console.log('✅ Intelligent workflow completed');
      }

      // Store execution history
      this.executionHistory.set(workflowId, executionLog);

      // Save workflow state
      await this.saveIntelligentWorkflow(workflow);

      return workflow.status === 'completed';

    } catch (error) {
      console.error('Intelligent workflow execution failed:', error);
      workflow.status = 'failed';
      await this.saveIntelligentWorkflow(workflow);
      return false;
    }
  }

  /**
   * Generate intelligent steps from task breakdown
   */
  private static async generateIntelligentSteps(
    taskBreakdown: TaskBreakdown,
    context: WorkflowExecutionContext,
    solutionFocus?: string[]
  ): Promise<IntelligentWorkflowStep[]> {
    const steps: IntelligentWorkflowStep[] = [];

    for (const task of taskBreakdown.tasks) {
      const step: IntelligentWorkflowStep = {
        id: `step_${steps.length + 1}_${task.id}`,
        title: task.title,
        description: task.description,
        estimatedTime: task.estimatedDuration,
        completed: false,
        aiCapabilities: {
          requiresAI: task.requiresAI,
          aiProvider: task.aiProvider,
          aiModel: task.aiModel,
          contextRequired: task.contextRequired,
          solutionIntegration: task.solutionIntegration
        },
        dependencies: task.dependencies,
        conditions: task.conditions?.map(c => ({
          type: c.type as 'success' | 'data_threshold' | 'user_approval',
          value: c.value
        })),
        parallelExecution: task.canRunParallel,
        adaptivePrompts: task.adaptivePromptTemplates?.map(apt => ({
          context: apt.context,
          dynamicPrompt: apt.template
        }))
      };

      steps.push(step);
    }

    // Add solution-aware enhancements
    return SolutionAwareWorkflowEngine.enhanceStepsWithSolutionIntegration(
      steps,
      context.availableSolutions,
      solutionFocus
    );
  }

  /**
   * Execute individual intelligent step
   */
  private static async executeIntelligentStep(
    step: IntelligentWorkflowStep,
    workflow: IntelligentWorkflow
  ): Promise<{
    success: boolean;
    data: any;
    performance: {
      executionTime: number;
      aiTokensUsed?: number;
      solutionsIntegrated: string[];
    };
  }> {
    const startTime = Date.now();
    
    try {
      let result: any = {};
      const solutionsIntegrated: string[] = [];

      // Execute AI capabilities if required
      if (step.aiCapabilities?.requiresAI) {
        result = await this.executeAIStep(step, workflow);
        solutionsIntegrated.push(...(step.aiCapabilities.solutionIntegration || []));
      }

      // Execute solution-specific actions
      if (step.aiCapabilities?.solutionIntegration) {
        const solutionResults = await SolutionAwareWorkflowEngine.executeSolutionActions(
          step.aiCapabilities.solutionIntegration,
          workflow,
          result
        );
        result.solutionResults = solutionResults;
        solutionsIntegrated.push(...step.aiCapabilities.solutionIntegration);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        performance: {
          executionTime,
          aiTokensUsed: result.aiTokensUsed,
          solutionsIntegrated
        }
      };

    } catch (error) {
      console.error(`Step execution failed: ${step.title}`, error);
      return {
        success: false,
        data: { error: error.message },
        performance: {
          executionTime: Date.now() - startTime,
          solutionsIntegrated: []
        }
      };
    }
  }

  /**
   * Execute AI-powered step
   */
  private static async executeAIStep(
    step: IntelligentWorkflowStep,
    workflow: IntelligentWorkflow
  ): Promise<any> {
    // Use Lovable AI Gateway
    try {
      const response = await supabase.functions.invoke('ai-context-manager', {
        body: {
          provider: 'google',
          endpoint: 'chat',
          params: {
            messages: [
              {
                role: 'system',
                content: `You are executing a workflow step: ${step.title}. 
                Description: ${step.description}
                Context: ${JSON.stringify(workflow.context)}
                Solutions available: ${workflow.solutionIntegration.primarySolutions.join(', ')}`
              },
              {
                role: 'user',
                content: `Execute this workflow step and provide structured results.`
              }
            ],
            temperature: 0.7,
            maxTokens: 1000
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return {
        aiResult: response.data,
        aiTokensUsed: response.data.usage?.totalTokens || 0
      };

    } catch (error) {
      console.error('AI step execution failed:', error);
      throw error;
    }
  }

  /**
   * Check step dependencies
   */
  private static checkDependencies(dependencies: string[], workflow: IntelligentWorkflow): boolean {
    for (const depId of dependencies) {
      const depStep = workflow.steps.find(s => s.id === depId);
      if (!depStep || !depStep.completed) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate step conditions
   */
  private static evaluateConditions(
    conditions: { type: 'success' | 'data_threshold' | 'user_approval'; value?: any }[],
    workflow: IntelligentWorkflow
  ): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'success':
          return workflow.currentStepIndex === 0 || 
                 workflow.steps[workflow.currentStepIndex - 1]?.completed;
        case 'data_threshold':
          // Implement data threshold logic
          return true; // Simplified for now
        case 'user_approval':
          // Check if user approval is available in context
          return workflow.context.userApprovals?.[workflow.currentStepIndex] === true;
        default:
          return true;
      }
    });
  }

  /**
   * Rollback workflow steps
   */
  private static async rollbackWorkflow(workflow: IntelligentWorkflow, failedStepIndex: number): Promise<void> {
    console.log(`🔄 Rolling back workflow from step ${failedStepIndex}`);
    
    // Mark subsequent steps as incomplete
    for (let i = failedStepIndex; i < workflow.steps.length; i++) {
      workflow.steps[i].completed = false;
      workflow.steps[i].data = undefined;
    }
    
    workflow.currentStepIndex = Math.max(0, failedStepIndex - 1);
  }

  /**
   * Update adaptive context based on execution results
   */
  private static async updateAdaptiveContext(
    workflow: IntelligentWorkflow,
    step: IntelligentWorkflowStep,
    result: any
  ): Promise<void> {
    if (!workflow.adaptiveContext.learningData) {
      workflow.adaptiveContext.learningData = {};
    }

    // Store step performance data
    workflow.adaptiveContext.learningData[step.id] = {
      executionTime: result.performance.executionTime,
      success: result.success,
      timestamp: new Date().toISOString()
    };

    // Update user preferences based on choices
    if (result.data.userChoices) {
      Object.assign(workflow.adaptiveContext.userPreferences, result.data.userChoices);
    }
  }

  /**
   * Gather learning data for user
   */
  private static async gatherLearningData(userId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('ai_workflow_states')
        .select('workflow_data')
        .eq('user_id', userId)
        .eq('workflow_type', 'intelligent_workflow')
        .order('created_at', { ascending: false })
        .limit(10);

      return data?.map(d => d.workflow_data) || [];
    } catch (error) {
      console.error('Error gathering learning data:', error);
      return [];
    }
  }

  /**
   * Get workflow performance history
   */
  private static async getWorkflowPerformanceHistory(userId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('ai_workflow_states')
        .select('workflow_data, created_at, updated_at')
        .eq('user_id', userId)
        .eq('current_step', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      return data || [];
    } catch (error) {
      console.error('Error getting performance history:', error);
      return [];
    }
  }

  /**
   * Save intelligent workflow to database
   */
  private static async saveIntelligentWorkflow(workflow: IntelligentWorkflow): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_workflow_states')
        .upsert({
          id: workflow.id,
          user_id: workflow.userId,
          workflow_type: 'intelligent_workflow',
          current_step: workflow.status,
          workflow_data: {
            ...workflow,
            startedAt: workflow.startedAt.toISOString(),
            completedAt: workflow.completedAt?.toISOString()
          } as any
        });

      if (error) {
        console.error('Error saving intelligent workflow:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error in saveIntelligentWorkflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  static getWorkflow(workflowId: string): IntelligentWorkflow | null {
    return this.activeWorkflows.get(workflowId) || null;
  }

  /**
   * Get execution history
   */
  static getExecutionHistory(workflowId: string): any[] {
    return this.executionHistory.get(workflowId) || [];
  }

  /**
   * Pause workflow execution
   */
  static pauseWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'active') {
      workflow.status = 'paused';
      this.saveIntelligentWorkflow(workflow);
      return true;
    }
    return false;
  }

  /**
   * Resume workflow execution
   */
  static resumeWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'active';
      this.executeIntelligentWorkflow(workflowId);
      return true;
    }
    return false;
  }
}