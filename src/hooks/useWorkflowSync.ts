import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowState {
  id: string;
  userId: string;
  userName: string;
  conversationId: string;
  currentStep: string;
  progress: number;
  context: Record<string, any>;
  lastUpdated: Date;
}

interface WorkflowUpdate {
  type: 'progress' | 'step_change' | 'context_update' | 'completion';
  userId: string;
  userName: string;
  step?: string;
  progress?: number;
  context?: Record<string, any>;
  timestamp: Date;
}

export const useWorkflowSync = (conversationId?: string) => {
  const [teamWorkflowStates, setTeamWorkflowStates] = useState<WorkflowState[]>([]);
  const [workflowUpdates, setWorkflowUpdates] = useState<WorkflowUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Sync workflow progress across team
  const syncWorkflowProgress = useCallback(async (
    currentStep: string, 
    progress: number, 
    context?: Record<string, any>
  ) => {
    if (!user || !conversationId) return;

    try {
      const workflowState = {
        user_id: user.id,
        conversation_id: conversationId,
        current_step: currentStep,
        progress: Math.min(100, Math.max(0, progress)),
        context: context || {},
        user_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
        updated_at: new Date().toISOString()
      };

      // Update database - use any to avoid type issues during migration
      const { error } = await (supabase as any)
        .from('workflow_sync_states')
        .upsert(workflowState);

      if (error) throw error;

      // Broadcast to team members
      const channel = supabase.channel(`workflow:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'workflow_progress_update',
        payload: {
          type: 'progress',
          userId: user.id,
          userName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
          step: currentStep,
          progress,
          context,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error syncing workflow progress:', error);
    }
  }, [user, conversationId]);

  // Update workflow context
  const updateWorkflowContext = useCallback(async (context: Record<string, any>) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await (supabase as any)
        .from('workflow_sync_states')
        .update({ 
          context,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);

      if (error) throw error;

      // Broadcast context update
      const channel = supabase.channel(`workflow:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'workflow_context_update',
        payload: {
          type: 'context_update',
          userId: user.id,
          userName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
          context,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error updating workflow context:', error);
    }
  }, [user, conversationId]);

  // Complete workflow step
  const completeWorkflowStep = useCallback(async (step: string, results?: Record<string, any>) => {
    if (!user || !conversationId) return;

    try {
      await syncWorkflowProgress(step, 100, results);
      
      toast({
        title: "Step Completed",
        description: `Workflow step "${step}" completed and shared with team`,
        duration: 3000,
      });

      // Broadcast completion to team
      const channel = supabase.channel(`workflow:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'workflow_step_completed',
        payload: {
          type: 'completion',
          userId: user.id,
          userName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
          step,
          results,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error completing workflow step:', error);
    }
  }, [user, conversationId, syncWorkflowProgress, toast]);

  // Setup real-time workflow sync
  const setupWorkflowSync = useCallback(() => {
    if (!conversationId || channelRef.current) return;

    const channel = supabase.channel(`workflow-sync:${conversationId}`)
      .on('broadcast', { event: 'workflow_progress_update' }, (payload: { payload: WorkflowUpdate }) => {
        const update = payload.payload;
        if (update.userId !== user?.id) {
          setWorkflowUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
          
          toast({
            title: "Team Progress Update",
            description: `${update.userName} updated workflow progress to ${update.progress}%`,
            duration: 2000,
          });
        }
      })
      .on('broadcast', { event: 'workflow_context_update' }, (payload: { payload: WorkflowUpdate }) => {
        const update = payload.payload;
        if (update.userId !== user?.id) {
          setWorkflowUpdates(prev => [update, ...prev.slice(0, 49)]);
          
          toast({
            title: "Context Updated",
            description: `${update.userName} updated workflow context`,
            duration: 2000,
          });
        }
      })
      .on('broadcast', { event: 'workflow_step_completed' }, (payload: { payload: WorkflowUpdate }) => {
        const update = payload.payload;
        if (update.userId !== user?.id) {
          setWorkflowUpdates(prev => [update, ...prev.slice(0, 49)]);
          
          toast({
            title: "Step Completed",
            description: `${update.userName} completed workflow step: ${update.step}`,
            duration: 3000,
          });
        }
      })
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',  
          table: 'workflow_sync_states',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: any) => {
          const workflowState = payload.new as any;
          
          if (workflowState && workflowState.user_id !== user?.id) {
            setTeamWorkflowStates(prev => {
              const filtered = prev.filter(ws => ws.userId !== workflowState.user_id);
              return [...filtered, {
                id: workflowState.id,
                userId: workflowState.user_id,
                userName: workflowState.user_name || 'Anonymous',
                conversationId: workflowState.conversation_id,
                currentStep: workflowState.current_step,
                progress: workflowState.progress,
                context: workflowState.context || {},
                lastUpdated: new Date(workflowState.updated_at)
              }];
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    setIsConnected(true);
  }, [conversationId, user, toast]);

  // Load existing workflow states
  const loadTeamWorkflowStates = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('workflow_sync_states')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const states: WorkflowState[] = (data || []).map((state: any) => ({
        id: state.id,
        userId: state.user_id,
        userName: state.user_name || 'Anonymous',
        conversationId: state.conversation_id,
        currentStep: state.current_step,
        progress: state.progress,
        context: state.context || {},
        lastUpdated: new Date(state.updated_at)
      }));

      setTeamWorkflowStates(states);

    } catch (error) {
      console.error('Error loading team workflow states:', error);
    }
  }, [conversationId]);

  // Cleanup
  useEffect(() => {
    if (conversationId) {
      setupWorkflowSync();
      loadTeamWorkflowStates();
      
      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          setIsConnected(false);
        }
      };
    }
  }, [conversationId, setupWorkflowSync, loadTeamWorkflowStates]);

  return {
    // State
    teamWorkflowStates,
    workflowUpdates,
    isConnected,

    // Actions  
    syncWorkflowProgress,
    updateWorkflowContext,
    completeWorkflowStep,

    // Utils
    activeTeamMembers: teamWorkflowStates.length,
    recentUpdates: workflowUpdates.slice(0, 10),
    averageProgress: teamWorkflowStates.length > 0 
      ? teamWorkflowStates.reduce((sum, state) => sum + state.progress, 0) / teamWorkflowStates.length 
      : 0
  };
};