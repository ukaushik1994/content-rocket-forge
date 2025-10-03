import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntelligentWorkflow {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  workflow_type: 'custom' | 'template' | 'ai_generated';
  category: string;
  status: 'draft' | 'active' | 'archived' | 'template';
  workflow_data: any;
  solution_integrations?: string[];
  template_metadata?: any;
  success_metrics?: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  execution_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current_step: number;
    total_steps: number;
    completed_steps: number[];
  };
  input_context?: any;
  output_results?: any;
  error_details?: any;
  performance_metrics?: any;
  ai_provider?: string;
  ai_model?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: string;
  template_data: any;
  required_solutions?: string[];
  tags?: string[];
  use_count: number;
  success_rate: number;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useWorkflowData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user workflows
  const {
    data: workflows = [],
    isLoading: workflowsLoading,
    error: workflowsError
  } = useQuery({
    queryKey: ['intelligent-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intelligent_workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as IntelligentWorkflow[];
    }
  });

  // Fetch workflow executions
  const {
    data: executions = [],
    isLoading: executionsLoading,
    error: executionsError
  } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to recent executions

      if (error) throw error;
      return data as WorkflowExecution[];
    }
  });

  // Fetch workflow templates
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError
  } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_public', true)
        .order('use_count', { ascending: false });

      if (error) throw error;
      return data as WorkflowTemplate[];
    }
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: Omit<IntelligentWorkflow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('intelligent_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligent-workflows'] });
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    }
  });

  // 🚀 PHASE 1 FIX: Create AND execute workflow in one action
  const createAndExecuteWorkflowMutation = useMutation({
    mutationFn: async ({
      workflowData,
      inputContext,
      executionName
    }: {
      workflowData: Omit<IntelligentWorkflow, 'id' | 'created_at' | 'updated_at'>;
      inputContext?: any;
      executionName?: string;
    }) => {
      // Step 1: Create workflow
      const { data: workflow, error: createError } = await supabase
        .from('intelligent_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (createError) throw createError;

      // Step 2: Immediately execute it
      const { data: execution, error: execError } = await supabase.functions.invoke('intelligent-workflow-executor', {
        body: {
          workflowId: workflow.id,
          inputContext: inputContext || {},
          executionName: executionName || `${workflow.title} - ${new Date().toLocaleString()}`
        }
      });

      if (execError) throw execError;

      return { workflow, execution };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intelligent-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      toast({
        title: "Workflow Started",
        description: `${data.workflow.title} is now executing`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create and execute workflow",
        variant: "destructive",
      });
    }
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async ({
      workflowId,
      templateId,
      customWorkflow,
      inputContext,
      executionName
    }: {
      workflowId?: string;
      templateId?: string;
      customWorkflow?: any;
      inputContext?: any;
      executionName?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('intelligent-workflow-executor', {
        body: {
          workflowId,
          templateId,
          customWorkflow,
          inputContext,
          executionName
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      toast({
        title: "Workflow Executed",
        description: `Execution completed with ID: ${data.executionId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message || "Workflow execution failed",
        variant: "destructive",
      });
    }
  });

  // Update workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: Partial<IntelligentWorkflow>;
    }) => {
      const { data, error } = await supabase
        .from('intelligent_workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligent-workflows'] });
      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workflow",
        variant: "destructive",
      });
    }
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('intelligent_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligent-workflows'] });
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workflow",
        variant: "destructive",
      });
    }
  });

  // Real-time subscriptions for executions
  useEffect(() => {
    const channel = supabase
      .channel('workflow-executions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    // Data
    workflows,
    executions,
    templates,

    // Loading states
    isLoading: workflowsLoading || executionsLoading || templatesLoading,
    workflowsLoading,
    executionsLoading,
    templatesLoading,

    // Errors
    error: workflowsError || executionsError || templatesError,

    // Mutations
    createWorkflow: createWorkflowMutation.mutate,
    isCreating: createWorkflowMutation.isPending,

    executeWorkflow: executeWorkflowMutation.mutate,
    isExecuting: executeWorkflowMutation.isPending,

    // 🚀 PHASE 1: New combined mutation
    createAndExecuteWorkflow: createAndExecuteWorkflowMutation.mutate,
    isCreatingAndExecuting: createAndExecuteWorkflowMutation.isPending,

    updateWorkflow: updateWorkflowMutation.mutate,
    isUpdating: updateWorkflowMutation.isPending,

    deleteWorkflow: deleteWorkflowMutation.mutate,
    isDeleting: deleteWorkflowMutation.isPending,

    // Helper functions
    getWorkflowById: (id: string) => workflows.find(w => w.id === id),
    getExecutionsByWorkflowId: (workflowId: string) => 
      executions.filter(e => e.workflow_id === workflowId),
    getTemplatesByCategory: (category: string) => 
      templates.filter(t => t.category === category)
  };
}

export function useWorkflowExecution(executionId?: string) {
  const { data: execution, isLoading, error } = useQuery({
    queryKey: ['workflow-execution', executionId],
    queryFn: async () => {
      if (!executionId) return null;
      
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          intelligent_workflows (
            title,
            description,
            workflow_data
          )
        `)
        .eq('id', executionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!executionId,
    refetchInterval: (data) => {
      // Refetch every 2 seconds if execution is running
      return (data as any)?.status === 'running' ? 2000 : false;
    }
  });

  return {
    execution,
    isLoading,
    error
  };
}