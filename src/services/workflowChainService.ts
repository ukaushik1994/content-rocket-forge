import { supabase } from '@/integrations/supabase/client';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  completed: boolean;
  data?: any;
}

export interface WorkflowChain {
  id: string;
  userId: string;
  title: string;
  type: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  currentStepIndex: number;
  steps: WorkflowStep[];
  context: any;
  startedAt: Date;
  completedAt?: Date;
}

interface WorkflowTemplate {
  id: string;
  title: string;
  type: string;
  steps: Omit<WorkflowStep, 'completed' | 'data'>[];
  defaultContext?: any;
}

export class WorkflowChainService {
  private static templates: WorkflowTemplate[] = [
    {
      id: 'serp-keyword-analysis',
      title: 'SERP Keyword Analysis',
      type: 'serp_analysis',
      steps: [
        {
          id: 'keyword-research',
          title: 'Keyword Research',
          description: 'Identify primary and related keywords for analysis',
          estimatedTime: 5
        },
        {
          id: 'competitor-analysis',
          title: 'Competitor Analysis', 
          description: 'Analyze top-ranking competitors and their strategies',
          estimatedTime: 10
        },
        {
          id: 'content-gap-analysis',
          title: 'Content Gap Analysis',
          description: 'Identify content opportunities and gaps',
          estimatedTime: 8
        },
        {
          id: 'optimization-recommendations',
          title: 'Optimization Recommendations',
          description: 'Generate actionable optimization suggestions',
          estimatedTime: 7
        }
      ]
    },
    {
      id: 'content-optimization',
      title: 'Content Optimization Workflow',
      type: 'content_optimization',
      steps: [
        {
          id: 'content-audit',
          title: 'Content Audit',
          description: 'Analyze existing content performance and structure',
          estimatedTime: 12
        },
        {
          id: 'seo-optimization',
          title: 'SEO Optimization',
          description: 'Optimize content for target keywords and search intent',
          estimatedTime: 15
        },
        {
          id: 'readability-enhancement',
          title: 'Readability Enhancement',
          description: 'Improve content readability and user engagement',
          estimatedTime: 10
        },
        {
          id: 'final-review',
          title: 'Final Review & Publishing',
          description: 'Review optimized content and prepare for publication',
          estimatedTime: 8
        }
      ]
    }
  ];

  static async createWorkflowFromTemplate(
    userId: string, 
    templateId: string, 
    customData?: any
  ): Promise<WorkflowChain> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const workflow: WorkflowChain = {
      id: crypto.randomUUID(),
      userId,
      title: template.title,
      type: template.type,
      status: 'active',
      currentStepIndex: 0,
      steps: template.steps.map(step => ({
        ...step,
        completed: false
      })),
      context: { ...template.defaultContext, ...customData },
      startedAt: new Date()
    };

    await this.saveWorkflow(userId, workflow);
    
    // 🚀 PHASE 1 FIX: Trigger workflow execution via edge function
    try {
      const { data, error } = await supabase.functions.invoke('intelligent-workflow-executor', {
        body: {
          workflowId: workflow.id,
          inputContext: workflow.context,
          executionName: `${workflow.title} - ${new Date().toLocaleString()}`
        }
      });
      
      if (error) {
        console.error('❌ Failed to trigger workflow execution:', error);
      } else {
        console.log('✅ Workflow execution triggered:', data);
      }
    } catch (execError) {
      console.error('❌ Error triggering workflow execution:', execError);
    }
    
    return workflow;
  }

  static async saveWorkflow(userId: string, workflow: WorkflowChain): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflows')
        .upsert({
          id: workflow.id,
          user_id: userId,
          title: workflow.title,
          type: workflow.type,
          status: workflow.status,
          current_step_index: workflow.currentStepIndex,
          steps: workflow.steps as any,
          context: workflow.context as any,
          started_at: workflow.startedAt.toISOString(),
          completed_at: workflow.completedAt?.toISOString()
        });

      if (error) {
        console.error('Error saving workflow:', error);
        throw new Error(`Failed to save workflow: ${error.message}`);
      }

      console.log('✅ Workflow saved successfully');
    } catch (error) {
      console.error('Error in saveWorkflow:', error);
      throw error;
    }
  }

  static async getUserWorkflows(userId: string): Promise<WorkflowChain[]> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflows:', error);
        throw new Error(`Failed to fetch workflows: ${error.message}`);
      }

      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        type: row.type,
        status: row.status as 'active' | 'paused' | 'completed' | 'cancelled',
        currentStepIndex: row.current_step_index,
        steps: (row.steps as unknown) as WorkflowStep[],
        context: row.context,
        startedAt: new Date(row.started_at),
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined
      }));
    } catch (error) {
      console.error('Error in getUserWorkflows:', error);
      return [];
    }
  }

  static async getWorkflow(userId: string, workflowId: string): Promise<WorkflowChain | null> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching workflow:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        type: data.type,
        status: data.status as 'active' | 'paused' | 'completed' | 'cancelled',
        currentStepIndex: data.current_step_index,
        steps: (data.steps as unknown) as WorkflowStep[],
        context: data.context,
        startedAt: new Date(data.started_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined
      };
    } catch (error) {
      console.error('Error in getWorkflow:', error);
      return null;
    }
  }

  static async advanceWorkflow(userId: string, workflowId: string, stepData?: any): Promise<WorkflowChain | null> {
    const workflow = await this.getWorkflow(userId, workflowId);
    if (!workflow) return null;

    // Mark current step as completed
    if (workflow.currentStepIndex < workflow.steps.length) {
      workflow.steps[workflow.currentStepIndex].completed = true;
      workflow.steps[workflow.currentStepIndex].data = stepData;
    }

    // Advance to next step
    workflow.currentStepIndex++;

    // Check if workflow is completed
    if (workflow.currentStepIndex >= workflow.steps.length) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
    }

    await this.saveWorkflow(userId, workflow);
    return workflow;
  }

  static async deleteWorkflow(userId: string, workflowId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting workflow:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWorkflow:', error);
      return false;
    }
  }

  static getTemplates(): WorkflowTemplate[] {
    return this.templates;
  }
}