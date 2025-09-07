import { useState, useEffect, useCallback } from 'react';
import { proposalLifecycleService, ProposalContext, ProposalLifecycleStatus } from '@/services/proposalLifecycleService';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { toast } from 'sonner';

interface ProposalIntegrationState {
  proposalContexts: Record<string, ProposalContext>;
  loading: boolean;
  error: string | null;
}

interface ProposalAction {
  id: string;
  label: string;
  icon: string;
  handler: () => Promise<void>;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export const useProposalIntegration = (proposalIds: string[] = []) => {
  const [state, setState] = useState<ProposalIntegrationState>({
    proposalContexts: {},
    loading: false,
    error: null
  });

  const { refreshData } = useContentStrategy();

  // Load proposal contexts
  const loadProposalContexts = useCallback(async () => {
    if (proposalIds.length === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const contexts: Record<string, ProposalContext> = {};
      
      for (const proposalId of proposalIds) {
        const context = await proposalLifecycleService.getProposalContext(proposalId);
        if (context) {
          contexts[proposalId] = context;
        }
      }

      setState(prev => ({
        ...prev,
        proposalContexts: contexts,
        loading: false
      }));

    } catch (error) {
      console.error('Error loading proposal contexts:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load proposal contexts',
        loading: false
      }));
    }
  }, [proposalIds]);

  // Get available actions for a proposal
  const getProposalActions = useCallback((proposalId: string): ProposalAction[] => {
    const context = state.proposalContexts[proposalId];
    if (!context) return [];

    const crossTabActions = proposalLifecycleService.getCrossTabActions(context);
    const actions: ProposalAction[] = [];

    // Schedule to Calendar action
    if (crossTabActions.canScheduleToCalendar) {
      actions.push({
        id: 'schedule-calendar',
        label: 'Schedule to Calendar',
        icon: 'calendar',
        handler: async () => {
          await handleProposalAction(proposalId, 'schedule_to_calendar');
        }
      });
    }

    // Add to Pipeline action
    if (crossTabActions.canAddToPipeline) {
      actions.push({
        id: 'add-pipeline',
        label: 'Add to Pipeline',
        icon: 'plus',
        handler: async () => {
          await handleProposalAction(proposalId, 'add_to_pipeline');
        }
      });
    }

    // Generate Content action
    if (crossTabActions.canGenerateContent) {
      actions.push({
        id: 'generate-content',
        label: 'Generate Content',
        icon: 'edit',
        handler: async () => {
          await handleProposalAction(proposalId, 'generate_content');
        },
        variant: 'default'
      });
    }

    // Mark Complete action
    if (crossTabActions.canMarkComplete) {
      actions.push({
        id: 'mark-complete',
        label: 'Mark Complete',
        icon: 'check',
        handler: async () => {
          await handleProposalAction(proposalId, 'mark_complete');
        },
        variant: 'outline'
      });
    }

    // Archive action
    if (crossTabActions.canArchive) {
      actions.push({
        id: 'archive',
        label: 'Archive',
        icon: 'archive',
        handler: async () => {
          await handleProposalAction(proposalId, 'archive');
        },
        variant: 'destructive'
      });
    }

    return actions;
  }, [state.proposalContexts]);

  // Handle proposal actions
  const handleProposalAction = useCallback(async (proposalId: string, action: string, data?: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      await proposalLifecycleService.syncProposalAcrossTabs(proposalId, action, data);
      
      // Refresh all data to show updates
      await refreshData();
      await loadProposalContexts();

      toast.success(`Action completed successfully`);

    } catch (error) {
      console.error('Error handling proposal action:', error);
      toast.error('Failed to complete action');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [refreshData, loadProposalContexts]);

  // Update proposal status
  const updateProposalStatus = useCallback(async (
    proposalId: string, 
    status: ProposalLifecycleStatus, 
    options?: {
      pipelineStage?: string;
      calendarStatus?: string;
      progress?: number;
      notes?: string;
    }
  ) => {
    try {
      await proposalLifecycleService.updateProposalStatus({
        proposalId,
        status,
        pipelineStage: options?.pipelineStage,
        calendarStatus: options?.calendarStatus,
        progress: options?.progress,
        notes: options?.notes,
        updatedBy: 'user'
      });

      await refreshData();
      await loadProposalContexts();

      toast.success('Proposal status updated');

    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error('Failed to update proposal status');
    }
  }, [refreshData, loadProposalContexts]);

  // Get proposal lifecycle status
  const getProposalStatus = useCallback((proposalId: string): ProposalLifecycleStatus | null => {
    const context = state.proposalContexts[proposalId];
    return context?.lifecycle_status || null;
  }, [state.proposalContexts]);

  // Get proposal completion percentage
  const getCompletionPercentage = useCallback((proposalId: string): number => {
    const context = state.proposalContexts[proposalId];
    return context?.completion_percentage || 0;
  }, [state.proposalContexts]);

  // Check if proposal exists in specific tab
  const isInPipeline = useCallback((proposalId: string): boolean => {
    const context = state.proposalContexts[proposalId];
    return !!context?.pipeline_item;
  }, [state.proposalContexts]);

  const isInCalendar = useCallback((proposalId: string): boolean => {
    const context = state.proposalContexts[proposalId];
    return !!context?.calendar_item;
  }, [state.proposalContexts]);

  // Navigation helpers
  const navigateToProposalInTab = useCallback((proposalId: string, tab: 'pipeline' | 'calendar') => {
    const currentHash = window.location.hash;
    const newHash = `#${tab}`;
    
    if (currentHash !== newHash) {
      window.location.hash = newHash;
    }

    // Scroll to proposal item after navigation
    setTimeout(() => {
      const element = document.querySelector(`[data-proposal-id="${proposalId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }, []);

  // Load contexts on mount and when proposalIds change
  useEffect(() => {
    loadProposalContexts();
  }, [loadProposalContexts]);

  return {
    // State
    proposalContexts: state.proposalContexts,
    loading: state.loading,
    error: state.error,

    // Actions
    getProposalActions,
    handleProposalAction,
    updateProposalStatus,
    loadProposalContexts,

    // Status helpers
    getProposalStatus,
    getCompletionPercentage,
    isInPipeline,
    isInCalendar,

    // Navigation
    navigateToProposalInTab
  };
};