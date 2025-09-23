import { supabase } from '@/integrations/supabase/client';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  data?: any;
  estimatedTime?: number;
}

export interface WorkflowChain {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'failed';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  steps: Omit<WorkflowStep, 'completed'>[];
}

export class WorkflowChainService {
  private static readonly WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
      id: 'keyword-research-to-content',
      name: 'Keyword Research to Content Strategy',
      description: 'Complete workflow from keyword analysis to content creation plan',
      estimatedTime: 15,
      steps: [
        { id: 'keyword-analysis', name: 'Keyword Analysis', description: 'Analyze target keywords and competition', estimatedTime: 3 },
        { id: 'competitor-research', name: 'Competitor Research', description: 'Research top competitors and their strategies', estimatedTime: 4 },
        { id: 'content-gaps', name: 'Content Gap Analysis', description: 'Identify content opportunities', estimatedTime: 3 },
        { id: 'content-strategy', name: 'Content Strategy', description: 'Create comprehensive content plan', estimatedTime: 5 }
      ]
    },
    {
      id: 'serp-competitive-analysis',
      name: 'SERP Competitive Analysis',
      description: 'Deep dive into SERP competitors and opportunities',
      estimatedTime: 10,
      steps: [
        { id: 'serp-extraction', name: 'SERP Data Extraction', description: 'Extract and process SERP data', estimatedTime: 2 },
        { id: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyze competitor performance', estimatedTime: 4 },
        { id: 'opportunity-mapping', name: 'Opportunity Mapping', description: 'Map optimization opportunities', estimatedTime: 4 }
      ]
    }
  ];

  static getTemplates(): WorkflowTemplate[] {
    return this.WORKFLOW_TEMPLATES;
  }

  static async createWorkflowFromTemplate(
    userId: string, 
    templateId: string, 
    customData?: any
  ): Promise<WorkflowChain> {
    const template = this.WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Workflow template ${templateId} not found`);
    }

    const workflow: WorkflowChain = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      steps: template.steps.map(step => ({ ...step, completed: false })),
      currentStepIndex: 0,
      startedAt: new Date(),
      status: 'active'
    };

    // Save to database
    await this.saveWorkflow(userId, workflow);
    return workflow;
  }

  static async saveWorkflow(userId: string, workflow: WorkflowChain): Promise<void> {
    try {
      // Store in localStorage for now since we don't have the workflow table
      localStorage.setItem(`workflow_${workflow.id}`, JSON.stringify(workflow));
      localStorage.setItem(`user_workflows_${userId}`, JSON.stringify(
        [...(this.getUserWorkflowsFromStorage(userId)), workflow.id]
      ));
    } catch (error) {
      console.error('Workflow save error:', error);
    }
  }

  private static getUserWorkflowsFromStorage(userId: string): string[] {
    try {
      const stored = localStorage.getItem(`user_workflows_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static async getWorkflow(userId: string, workflowId: string): Promise<WorkflowChain | null> {
    try {
      const stored = localStorage.getItem(`workflow_${workflowId}`);
      if (stored) {
        const workflow = JSON.parse(stored);
        // Convert date strings back to Date objects
        workflow.startedAt = new Date(workflow.startedAt);
        if (workflow.completedAt) {
          workflow.completedAt = new Date(workflow.completedAt);
        }
        return workflow;
      }
      return null;
    } catch (error) {
      console.error('Error fetching workflow:', error);
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

  static async getUserWorkflows(userId: string): Promise<WorkflowChain[]> {
    try {
      const workflowIds = this.getUserWorkflowsFromStorage(userId);
      const workflows: WorkflowChain[] = [];
      
      for (const workflowId of workflowIds) {
        const workflow = await this.getWorkflow(userId, workflowId);
        if (workflow) {
          workflows.push(workflow);
        }
      }
      
      return workflows.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }
}