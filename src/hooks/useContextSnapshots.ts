import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContextSnapshot {
  id: string;
  title: string;
  messages: any[];
  workflow_state: any;
  conversation_type: string;
  created_at: string;
  user_id: string;
}

interface ContextState {
  user_id: string;
  context: any;
  workflow_state: any;
  created_at: string;
  updated_at: string;
}

export const useContextSnapshots = () => {
  const [snapshots, setSnapshots] = useState<ContextSnapshot[]>([]);
  const [contextState, setContextState] = useState<ContextState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Create context snapshot
  const createSnapshot = useCallback(async (conversationId: string, title?: string, data?: any) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-context-manager', {
        body: {
          action: 'create_snapshot',
          conversationId,
          userId: user.id,
          data: {
            title: title || `Snapshot ${new Date().toLocaleDateString()}`,
            conversationType: data?.conversationType || 'regular',
            ...data
          }
        }
      });

      if (error) throw error;

      const newSnapshot = result.snapshot;
      setSnapshots(prev => [newSnapshot, ...prev]);
      
      toast.success('Context snapshot created');
      return newSnapshot;

    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load context snapshot
  const loadSnapshot = useCallback(async (snapshotId: string) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-context-manager', {
        body: {
          action: 'load_snapshot',
          userId: user.id,
          data: { snapshotId }
        }
      });

      if (error) throw error;

      toast.success('Context snapshot loaded');
      return data.snapshot;

    } catch (error) {
      console.error('Error loading snapshot:', error);
      toast.error('Failed to load snapshot');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // List snapshots
  const listSnapshots = useCallback(async (conversationId?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-context-manager', {
        body: {
          action: 'list_snapshots',
          userId: user.id,
          conversationId
        }
      });

      if (error) throw error;

      setSnapshots(data.snapshots || []);

    } catch (error) {
      console.error('Error loading snapshots:', error);
      toast.error('Failed to load snapshots');
    }
  }, [user]);

  // Update context state
  const updateContextState = useCallback(async (context: any, workflowState?: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-context-manager', {
        body: {
          action: 'update_context_state',
          userId: user.id,
          data: {
            context,
            workflowState
          }
        }
      });

      if (error) throw error;

      setContextState(data.contextState);

    } catch (error) {
      console.error('Error updating context state:', error);
      toast.error('Failed to update context state');
    }
  }, [user]);

  // Get context state
  const getContextState = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-context-manager', {
        body: {
          action: 'get_context_state',
          userId: user.id
        }
      });

      if (error) throw error;

      setContextState(data.contextState);
      return data.contextState;

    } catch (error) {
      console.error('Error getting context state:', error);
    }
  }, [user]);

  // Merge contexts
  const mergeContexts = useCallback(async (sourceSnapshotId: string, targetSnapshotId: string, mergeStrategy = 'append') => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-context-manager', {
        body: {
          action: 'merge_contexts',
          userId: user.id,
          data: {
            sourceSnapshotId,
            targetSnapshotId,
            mergeStrategy
          }
        }
      });

      if (error) throw error;

      const mergedSnapshot = data.mergedSnapshot;
      setSnapshots(prev => [mergedSnapshot, ...prev]);
      
      toast.success('Context snapshots merged successfully');
      return mergedSnapshot;

    } catch (error) {
      console.error('Error merging contexts:', error);
      toast.error('Failed to merge contexts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Delete snapshot
  const deleteSnapshot = useCallback(async (snapshotId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_context_snapshots')
        .delete()
        .eq('id', snapshotId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      toast.success('Snapshot deleted');

    } catch (error) {
      console.error('Error deleting snapshot:', error);
      toast.error('Failed to delete snapshot');
    }
  }, [user]);

  // Auto-save context state
  const autoSaveContext = useCallback(async (context: any, workflowState?: any) => {
    if (!user) return;

    try {
      await updateContextState(context, workflowState);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [user, updateContextState]);

  // Initialize
  useEffect(() => {
    if (user) {
      listSnapshots();
      getContextState();
    }
  }, [user, listSnapshots, getContextState]);

  return {
    // State
    snapshots,
    contextState,
    isLoading,

    // Actions
    createSnapshot,
    loadSnapshot,
    listSnapshots,
    updateContextState,
    getContextState,
    mergeContexts,
    deleteSnapshot,
    autoSaveContext,

    // Utils
    hasSnapshots: snapshots.length > 0,
    snapshotCount: snapshots.length,
    hasContextState: !!contextState,
    latestSnapshot: snapshots[0] || null
  };
};