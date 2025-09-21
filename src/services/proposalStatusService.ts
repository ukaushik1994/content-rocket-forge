import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ProposalStatus = 'available' | 'scheduled' | 'in_progress' | 'completed' | 'archived';

export interface ProposalStatusInfo {
  status: ProposalStatus;
  createdAt?: string;
  updatedAt?: string;
  scheduledAt?: string;
  completedAt?: string;
  archivedAt?: string;
  inCalendar: boolean;
  inContentRepository: boolean;
  notes?: string;
}

class ProposalStatusService {
  // Get current status of a proposal with detailed information
  async getProposalStatus(proposalId: string): Promise<ProposalStatusInfo | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get proposal data
      const { data: proposal, error } = await supabase
        .from('ai_strategy_proposals')
        .select('status, scheduled_at, completed_at')
        .eq('id', proposalId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Check if it's in calendar
      const { data: calendarItem } = await supabase
        .from('content_calendar')
        .select('id, status')
        .eq('proposal_id', proposalId)
        .eq('user_id', user.id)
        .maybeSingle();

      // Check if content exists
      const { data: contentItem } = await supabase
        .from('content_items')
        .select('id')
        .eq('user_id', user.id)
        .like('metadata', `%"proposal_id":"${proposalId}"%`)
        .maybeSingle();

      return {
        status: proposal.status as ProposalStatus,
        scheduledAt: proposal.scheduled_at,
        completedAt: proposal.completed_at,
        inCalendar: !!calendarItem,
        inContentRepository: !!contentItem,
        createdAt: null,
        updatedAt: null,
        archivedAt: null,
        notes: null
      };
    } catch (error) {
      console.error('Error getting proposal status:', error);
      return null;
    }
  }

  // Get status for multiple proposals efficiently
  async getBulkProposalStatus(proposalIds: string[]): Promise<Record<string, ProposalStatusInfo>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      // Get all proposal data
      const { data: proposals, error } = await supabase
        .from('ai_strategy_proposals')
        .select('id, status, scheduled_at, completed_at, created_at, updated_at')
        .in('id', proposalIds)
        .eq('user_id', user.id);

      if (error) throw error;

      // Get calendar items
      const { data: calendarItems } = await supabase
        .from('content_calendar')
        .select('id, proposal_id, status')
        .in('proposal_id', proposalIds)
        .eq('user_id', user.id);

      // Get content items (this is more complex due to metadata search)
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, metadata')
        .eq('user_id', user.id);

      // Build status map
      const statusMap: Record<string, ProposalStatusInfo> = {};
      
      for (const proposal of proposals || []) {
        const calendarItem = calendarItems?.find(item => item.proposal_id === proposal.id);
        const contentItem = contentItems?.find(item => 
          item.metadata && JSON.stringify(item.metadata).includes(`"proposal_id":"${proposal.id}"`)
        );

        // Use the database status which is now updated by triggers
        statusMap[proposal.id] = {
          status: proposal.status as ProposalStatus,
          createdAt: proposal.created_at,
          updatedAt: proposal.updated_at,
          scheduledAt: proposal.scheduled_at,
          completedAt: proposal.completed_at,
          archivedAt: null,
          inCalendar: !!calendarItem,
          inContentRepository: !!contentItem,
          notes: null
        };
      }

      return statusMap;
    } catch (error) {
      console.error('Error getting bulk proposal status:', error);
      return {};
    }
  }

  // Update proposal status manually (with validation)
  async updateProposalStatus(proposalId: string, status: ProposalStatus, notes?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = { status };

      // Set appropriate timestamps
      if (status === 'scheduled' && !status.includes('scheduled_at')) {
        updateData.scheduled_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'available') {
        updateData.scheduled_at = null;
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('ai_strategy_proposals')
        .update(updateData)
        .eq('id', proposalId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log(`✅ Proposal status updated to ${status}:`, proposalId);
    } catch (error) {
      console.error('❌ Error updating proposal status:', error);
      throw error;
    }
  }

  // Archive proposals that are completed or no longer relevant
  async archiveProposal(proposalId: string, reason?: string): Promise<void> {
    try {
      await this.updateProposalStatus(proposalId, 'archived', reason);
      toast.success('Proposal archived');
    } catch (error) {
      console.error('Error archiving proposal:', error);
      toast.error('Failed to archive proposal');
    }
  }

  // Restore archived proposal back to available
  async restoreProposal(proposalId: string): Promise<void> {
    try {
      await this.updateProposalStatus(proposalId, 'available', 'Restored from archive');
      toast.success('Proposal restored');
    } catch (error) {
      console.error('Error restoring proposal:', error);
      toast.error('Failed to restore proposal');
    }
  }

  // Get proposals by status for filtering
  async getProposalsByStatus(status: ProposalStatus): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: proposals, error } = await supabase
        .from('ai_strategy_proposals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return proposals || [];
    } catch (error) {
      console.error('Error getting proposals by status:', error);
      return [];
    }
  }

  // Get status counts for dashboard
  async getStatusCounts(): Promise<Record<ProposalStatus, number>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { available: 0, scheduled: 0, in_progress: 0, completed: 0, archived: 0 };

      const { data: proposals, error } = await supabase
        .from('ai_strategy_proposals')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const counts = { available: 0, scheduled: 0, in_progress: 0, completed: 0, archived: 0 };
      
      for (const proposal of proposals || []) {
        counts[proposal.status as ProposalStatus]++;
      }

      return counts;
    } catch (error) {
      console.error('Error getting status counts:', error);
      return { available: 0, scheduled: 0, in_progress: 0, completed: 0, archived: 0 };
    }
  }
}

export const proposalStatusService = new ProposalStatusService();