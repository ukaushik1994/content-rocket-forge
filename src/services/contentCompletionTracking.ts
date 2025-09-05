import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContentCompletionStatus {
  proposal_id: string;
  calendar_item_id?: string;
  content_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'published';
  completed_at?: string;
  created_content_url?: string;
}

class ContentCompletionTrackingService {
  // Track when a proposal is scheduled to calendar by updating the calendar item with proposal metadata
  async markProposalScheduled(proposalId: string, calendarItemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_calendar')
        .update({
          notes: JSON.stringify({ source_proposal_id: proposalId, tracking_status: 'scheduled' })
        })
        .eq('id', calendarItemId);

      if (error) throw error;
      console.log('✅ Proposal marked as scheduled:', proposalId);
    } catch (error) {
      console.error('❌ Error marking proposal as scheduled:', error);
      throw error;
    }
  }

  // Track when content creation begins
  async markContentInProgress(proposalId: string, contentId?: string): Promise<void> {
    try {
      // Find calendar items related to this proposal
      const { data: calendarItems, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*')
        .like('notes', `%${proposalId}%`);

      if (fetchError) throw fetchError;

      // Update calendar items to mark as in progress
      for (const item of calendarItems || []) {
        const notes = item.notes ? JSON.parse(item.notes) : {};
        notes.tracking_status = 'in_progress';
        notes.content_id = contentId;

        const { error } = await supabase
          .from('content_calendar')
          .update({
            status: 'in_progress',
            notes: JSON.stringify(notes)
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      console.log('✅ Content marked as in progress:', proposalId);
    } catch (error) {
      console.error('❌ Error marking content as in progress:', error);
      throw error;
    }
  }

  // Track when content is completed
  async markContentCompleted(proposalId: string, contentId: string, contentUrl?: string): Promise<void> {
    try {
      // Find calendar items related to this proposal
      const { data: calendarItems, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*')
        .like('notes', `%${proposalId}%`);

      if (fetchError) throw fetchError;

      // Update calendar items to mark as completed
      for (const item of calendarItems || []) {
        const notes = item.notes ? JSON.parse(item.notes) : {};
        notes.tracking_status = 'completed';
        notes.content_id = contentId;
        notes.created_content_url = contentUrl;
        notes.completed_at = new Date().toISOString();

        const { error } = await supabase
          .from('content_calendar')
          .update({
            status: 'completed',
            notes: JSON.stringify(notes)
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      console.log('✅ Content marked as completed:', proposalId);
    } catch (error) {
      console.error('❌ Error marking content as completed:', error);
      throw error;
    }
  }

  // Get completed proposal IDs to filter them out from clusters view
  async getCompletedProposalIds(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: calendarItems, error } = await supabase
        .from('content_calendar')
        .select('notes')
        .eq('user_id', user.id)
        .in('status', ['completed', 'published']);

      if (error) throw error;

      const completedIds: string[] = [];
      (calendarItems || []).forEach(item => {
        try {
          const notes = item.notes ? JSON.parse(item.notes) : {};
          if (notes.source_proposal_id && notes.tracking_status === 'completed') {
            completedIds.push(notes.source_proposal_id);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      return completedIds;
    } catch (error) {
      console.error('❌ Error fetching completed proposal IDs:', error);
      return [];
    }
  }

  // Get proposals scheduled for reminder notifications
  async getUpcomingScheduledProposals(daysAhead: number = 3): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      // Get calendar items that are scheduled in the next few days
      const { data: calendarItems, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .eq('status', 'planning');

      if (error) throw error;

      // Filter for items that haven't been started yet and have proposal tracking
      const upcomingItems = (calendarItems || []).filter(item => {
        try {
          const notes = item.notes ? JSON.parse(item.notes) : {};
          return notes.source_proposal_id && notes.tracking_status === 'scheduled';
        } catch (e) {
          return false;
        }
      });

      return upcomingItems;
    } catch (error) {
      console.error('❌ Error fetching upcoming scheduled proposals:', error);
      return [];
    }
  }

  // Show reminder notifications
  async showUpcomingContentReminders(): Promise<void> {
    const upcomingItems = await this.getUpcomingScheduledProposals(3);
    
    if (upcomingItems.length > 0) {
      const titles = upcomingItems.slice(0, 3).map(item => item.title).join(', ');
      const remaining = upcomingItems.length > 3 ? ` and ${upcomingItems.length - 3} more` : '';
      
      toast('📝 Content Creation Reminder', {
        description: `Upcoming content to create: ${titles}${remaining}`,
        duration: 10000,
        action: {
          label: "View Calendar",
          onClick: () => {
            window.location.href = '/calendar';
          }
        }
      });
    }
  }
}

export const contentCompletionTracking = new ContentCompletionTrackingService();