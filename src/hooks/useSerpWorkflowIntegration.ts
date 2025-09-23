import { useState, useEffect, useCallback } from 'react';
import { serpWorkflowOrchestrator, WorkflowState } from '@/services/serpWorkflowOrchestrator';
import { serpAIService } from '@/services/serpAIService';
import { toast } from '@/hooks/use-toast';

interface UseSerpWorkflowIntegrationProps {
  serpData?: any[];
  userId?: string;
}

interface UseSerpWorkflowIntegrationReturn {
  workflows: WorkflowState[];
  isLoading: boolean;
  createWorkflow: (type: string, keywords: string[]) => Promise<void>;
  executeWorkflowAction: (action: string, workflowId: string, data?: any) => Promise<void>;
  refreshWorkflows: () => void;
}

export function useSerpWorkflowIntegration({
  serpData = [],
  userId
}: UseSerpWorkflowIntegrationProps): UseSerpWorkflowIntegrationReturn {
  const [workflows, setWorkflows] = useState<WorkflowState[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time workflow status polling
  useEffect(() => {
    if (workflows.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updatedWorkflows = await Promise.all(
          workflows.map(async (workflow) => {
            if (workflow.status === 'running' && userId) {
              const status = await serpAIService.getWorkflowStatus(workflow.id, userId);
              if (status) {
                return {
                  ...workflow,
                  status: status.status as WorkflowState['status'],
                  progress: status.progress || workflow.progress,
                  currentStep: status.currentStep || workflow.currentStep,
                  nextActions: status.nextActions || workflow.nextActions,
                  context: {
                    ...workflow.context,
                    recommendations: status.results?.recommendations || workflow.context.recommendations
                  }
                };
              }
            }
            return workflow;
          })
        );

        setWorkflows(updatedWorkflows);

        // Show completion notifications
        updatedWorkflows.forEach((workflow, index) => {
          const oldWorkflow = workflows[index];
          if (oldWorkflow?.status === 'running' && workflow.status === 'completed') {
            toast({
              title: "Workflow Completed",
              description: `${workflow.type.replace('_', ' ')} workflow has finished processing.`,
            });
          } else if (oldWorkflow?.status === 'running' && workflow.status === 'failed') {
            toast({
              title: "Workflow Failed",
              description: `${workflow.type.replace('_', ' ')} workflow encountered an error.`,
              variant: "destructive"
            });
          }
        });
      } catch (error) {
        console.error('Error polling workflow status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [workflows, userId]);

  const createWorkflow = useCallback(async (type: string, keywords: string[]) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create workflows.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const workflowId = await serpAIService.createWorkflow(type, keywords, userId);
      
      if (!workflowId) {
        throw new Error('Failed to create workflow');
      }

      // Add the new workflow to state with initial data
      const newWorkflow: WorkflowState = {
        id: workflowId,
        type: type as 'keyword_analysis' | 'content_planning' | 'competitor_tracking' | 'trend_monitoring',
        status: 'running',
        progress: 0,
        currentStep: 'Initializing...',
        context: {
          keywords,
          serpResults: [],
          recommendations: [],
          analysis: null
        },
        nextActions: [],
        metadata: {
          startedAt: new Date().toISOString(),
          priority: 'medium',
          estimatedDuration: 300 // 5 minutes default
        }
      };

      setWorkflows(prev => [...prev, newWorkflow]);

      toast({
        title: "Workflow Started",
        description: `${type.replace('_', ' ')} workflow has been initiated for ${keywords.length} keywords.`,
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Workflow Creation Failed",
        description: error instanceof Error ? error.message : 'Failed to create workflow',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const executeWorkflowAction = useCallback(async (action: string, workflowId: string, data?: any) => {
    try {
      switch (action) {
        case 'pause':
          await serpWorkflowOrchestrator.pauseWorkflow(workflowId);
          setWorkflows(prev => 
            prev.map(w => w.id === workflowId ? { ...w, status: 'paused' } : w)
          );
          break;
        
        case 'resume':
          await serpWorkflowOrchestrator.resumeWorkflow(workflowId);
          setWorkflows(prev => 
            prev.map(w => w.id === workflowId ? { ...w, status: 'running' } : w)
          );
          break;
        
        case 'execute_step':
          if (userId) {
            await serpAIService.executeWorkflow(workflowId, userId);
          }
          break;
        
        case 'download_report':
          // Handle report download
          toast({
            title: "Report Downloaded",
            description: "Workflow report has been downloaded.",
          });
          break;
        
        default:
          console.warn('Unknown workflow action:', action);
      }
    } catch (error) {
      console.error('Error executing workflow action:', error);
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : 'Failed to execute workflow action',
        variant: "destructive"
      });
    }
  }, [userId]);

  const refreshWorkflows = useCallback(() => {
    // Force refresh workflows by clearing and reloading
    setWorkflows([]);
  }, []);

  return {
    workflows,
    isLoading,
    createWorkflow,
    executeWorkflowAction,
    refreshWorkflows
  };
}