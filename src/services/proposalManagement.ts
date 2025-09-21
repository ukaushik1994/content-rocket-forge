import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProposalScheduleData {
  proposal_id: string;
  title: string;
  description?: string;
  primary_keyword: string;
  related_keywords?: string[];
  content_suggestions?: string[];
  priority_tag?: string;
  estimated_impressions?: number;
  serp_data?: any;
}

class ProposalManagementService {
  // Remove proposal from pipeline when scheduled to calendar
  async removeProposalFromPipeline(proposalId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Remove from content_pipeline if it exists there
      const { error } = await supabase
        .from('content_pipeline')
        .delete()
        .eq('user_id', user.id)
        .like('metadata', `%${proposalId}%`);

      if (error) throw error;
      console.log('✅ Proposal removed from pipeline:', proposalId);
    } catch (error) {
      console.error('❌ Error removing proposal from pipeline:', error);
      throw error;
    }
  }

  // Schedule proposal to calendar with enhanced status management
  async scheduleProposalToCalendar(
    proposalData: ProposalScheduleData,
    scheduledDate: string,
    priority: string = 'medium',
    estimatedHours: number = 2
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create calendar item with proposal_id link for automatic status updates
      const calendarItemData = {
        user_id: user.id,
        title: proposalData.title,
        content_type: 'blog',
        status: 'planning',
        scheduled_date: scheduledDate,
        priority: priority,
        estimated_hours: estimatedHours,
        tags: [proposalData.primary_keyword, ...(proposalData.related_keywords?.slice(0, 2) || [])],
        proposal_id: proposalData.proposal_id, // New: Direct link for automatic status updates
        notes: JSON.stringify({
          source_proposal_id: proposalData.proposal_id,
          tracking_status: 'scheduled',
          proposal_data: proposalData,
          scheduled_at: new Date().toISOString()
        })
      };

      const { data: calendarItem, error } = await supabase
        .from('content_calendar')
        .insert([calendarItemData])
        .select()
        .single();

      if (error) throw error;

      // Remove from pipeline if it was there
      await this.removeProposalFromPipeline(proposalData.proposal_id);

      console.log('✅ Proposal scheduled to calendar:', proposalData.proposal_id);
      return calendarItem.id;
    } catch (error) {
      console.error('❌ Error scheduling proposal to calendar:', error);
      throw error;
    }
  }

  // Check for overdue calendar items and restore proposals (enhanced with notifications)
  async checkAndRestoreOverdueProposals(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find overdue calendar items that haven't been started
      const { data: overdueItems, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id)
        .lt('scheduled_date', today.toISOString())
        .eq('status', 'planning');

      if (error) throw error;

      let restoredCount = 0;
      const restoredProposals: any[] = [];

      for (const item of overdueItems || []) {
        try {
          const proposalId = item.proposal_id;
          const notes = item.notes ? JSON.parse(item.notes) : {};
          const proposalData = notes.proposal_data;
          
          if (proposalId) {
            // Check if content was actually created
            const contentExists = await this.checkContentExistsForProposal(
              proposalId, 
              proposalData?.title || item.title,
              proposalData?.primary_keyword
            );

            if (!contentExists) {
              // Delete the overdue calendar item (this will automatically restore proposal status via trigger)
              await supabase
                .from('content_calendar')
                .delete()
                .eq('id', item.id);

              restoredCount++;
              restoredProposals.push({
                id: proposalId,
                title: proposalData?.title || item.title,
                scheduled_date: item.scheduled_date
              });
            }
          }
        } catch (parseError) {
          console.error('Error processing overdue item:', parseError);
        }
      }

      // Send notification if proposals were restored
      if (restoredCount > 0) {
        await this.notifyProposalsRestored(user.id, restoredProposals);
        toast.info(`📋 Restored ${restoredCount} overdue proposal${restoredCount > 1 ? 's' : ''} back to available`);
      }
    } catch (error) {
      console.error('❌ Error checking overdue proposals:', error);
    }
  }

  // Restore proposal back to pipeline
  async restoreProposalToPipeline(proposalData: ProposalScheduleData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const pipelineItemData = {
        user_id: user.id,
        title: proposalData.title,
        description: proposalData.description || '',
        status: 'idea',
        priority: proposalData.priority_tag || 'medium',
        tags: [proposalData.primary_keyword, ...(proposalData.related_keywords?.slice(0, 2) || [])],
        metadata: {
          source_proposal_id: proposalData.proposal_id,
          restored_from_overdue: true,
          restored_at: new Date().toISOString(),
          proposal_data: proposalData
        }
      };

      const { error } = await supabase
        .from('content_pipeline')
        .insert([pipelineItemData]);

      if (error) throw error;
      console.log('✅ Proposal restored to pipeline:', proposalData.proposal_id);
    } catch (error) {
      console.error('❌ Error restoring proposal to pipeline:', error);
      throw error;
    }
  }

  // Enhanced content existence check with status marking
  async checkContentExistsForProposal(
    proposalId: string, 
    title?: string, 
    keyword?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check by proposal ID in metadata
      const { data: byProposalId } = await supabase
        .from('content_items')
        .select('id, metadata')
        .eq('user_id', user.id)
        .like('metadata', `%${proposalId}%`)
        .limit(1);

      if (byProposalId && byProposalId.length > 0) {
        // Mark proposal as completed since content exists
        await this.markProposalAsCompleted(proposalId);
        return true;
      }

      // Fallback checks by title and keyword
      if (title) {
        const { data: byTitle } = await supabase
          .from('content_items')
          .select('id')
          .eq('user_id', user.id)
          .ilike('title', `%${title.slice(0, 20)}%`)
          .limit(1);

        if (byTitle && byTitle.length > 0) {
          await this.markProposalAsCompleted(proposalId);
          return true;
        }
      }

      if (keyword) {
        const { data: byKeyword } = await supabase
          .from('content_items')
          .select('id')
          .eq('user_id', user.id)
          .like('metadata', `%${keyword}%`)
          .limit(1);

        if (byKeyword && byKeyword.length > 0) {
          await this.markProposalAsCompleted(proposalId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking content existence:', error);
      return false;
    }
  }

  // Mark proposal as completed when content is created
  async markProposalAsCompleted(proposalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_strategy_proposals')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) throw error;
      console.log('✅ Proposal marked as completed:', proposalId);
    } catch (error) {
      console.error('❌ Error marking proposal as completed:', error);
    }
  }

  // Get calendar items with proposal data for content generation
  async getCalendarItemsWithProposals(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: calendarItems, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return (calendarItems || []).map(item => {
        try {
          const notes = item.notes ? JSON.parse(item.notes) : {};
          return {
            ...item,
            hasProposalData: !!notes.proposal_data,
            proposalData: notes.proposal_data || null
          };
        } catch (e) {
          return {
            ...item,
            hasProposalData: false,
            proposalData: null
          };
        }
      });
    } catch (error) {
      console.error('❌ Error fetching calendar items with proposals:', error);
      return [];
    }
  }

  // Send notification when proposals are restored from overdue calendar items
  private async notifyProposalsRestored(userId: string, restoredProposals: any[]): Promise<void> {
    try {
      const { createNotificationHelper } = await import('@/utils/notificationHelpers');
      const notificationHelper = createNotificationHelper(userId);
      
      await notificationHelper.notifyProposalsRestored(restoredProposals);
    } catch (error) {
      console.error('Failed to send proposal restoration notification:', error);
    }
  }

  // Postpone calendar item to new date
  async postponeCalendarItem(calendarItemId: string, newDate: string): Promise<void> {
    const { calendarActionsService } = await import('@/services/calendarActionsService');
    return calendarActionsService.postponeCalendarItem(calendarItemId, newDate);
  }

  // Remove calendar item and restore proposal
  async removeCalendarItemAndRestoreProposal(calendarItemId: string): Promise<void> {
    const { calendarActionsService } = await import('@/services/calendarActionsService');
    return calendarActionsService.removeCalendarItemAndRestoreProposal(calendarItemId);
  }
}

export const proposalManagement = new ProposalManagementService();