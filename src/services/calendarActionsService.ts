import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

class CalendarActionsService {
  // Postpone a calendar item to a new date
  async postponeCalendarItem(calendarItemId: string, newDate: string, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current calendar item
      const { data: currentItem, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('id', calendarItemId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update the scheduled date
      const { error: updateError } = await supabase
        .from('content_calendar')
        .update({
          scheduled_date: newDate,
          notes: this.updateNotesWithAction(currentItem.notes, 'postponed', {
            original_date: currentItem.scheduled_date,
            new_date: newDate,
            reason: reason || 'User requested postponement',
            postponed_at: new Date().toISOString()
          })
        })
        .eq('id', calendarItemId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Send notification
      await this.notifyCalendarAction('postponed', {
        title: currentItem.title,
        originalDate: format(new Date(currentItem.scheduled_date), 'MMM dd, yyyy'),
        newDate: format(new Date(newDate), 'MMM dd, yyyy'),
        userId: user.id
      });

      toast.success(`Content postponed to ${format(new Date(newDate), 'MMM dd, yyyy')}`);
      console.log('✅ Calendar item postponed:', calendarItemId);
    } catch (error) {
      console.error('❌ Error postponing calendar item:', error);
      toast.error('Failed to postpone calendar item');
      throw error;
    }
  }

  // Remove calendar item and restore proposal to available
  async removeCalendarItemAndRestoreProposal(calendarItemId: string, reason?: string): Promise<void> {
    try {
      console.log('🔄 Starting calendar item removal with proposal restoration:', {
        calendarItemId,
        reason: reason || 'User requested removal'
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated for calendar item removal');
        throw new Error('User not authenticated');
      }

      console.log('✅ User authenticated:', user.id);

      // Get current calendar item with detailed logging
      console.log('📋 Fetching calendar item details...');
      const { data: currentItem, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('id', calendarItemId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ Failed to fetch calendar item:', fetchError);
        throw new Error(`Failed to fetch calendar item: ${fetchError.message}`);
      }

      if (!currentItem) {
        console.error('❌ Calendar item not found or access denied:', calendarItemId);
        throw new Error('Calendar item not found or you do not have permission to delete it');
      }

      console.log('✅ Calendar item found:', {
        id: currentItem.id,
        title: currentItem.title,
        proposalId: currentItem.proposal_id,
        userId: currentItem.user_id
      });

      const proposalId = currentItem.proposal_id;
      
      // Delete the calendar item (this will automatically restore proposal status via trigger)
      console.log('🗑️ Deleting calendar item...');
      const { error: deleteError } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', calendarItemId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Failed to delete calendar item:', deleteError);
        throw new Error(`Failed to delete calendar item: ${deleteError.message}`);
      }

      console.log('✅ Calendar item deleted successfully');

      // Verify proposal was restored (if there was one)
      if (proposalId) {
        console.log('🔍 Verifying proposal restoration...');
        const { data: restoredProposal, error: proposalError } = await supabase
          .from('ai_strategy_proposals')
          .select('status')
          .eq('id', proposalId)
          .single();

        if (proposalError) {
          console.warn('⚠️ Could not verify proposal restoration:', proposalError);
        } else {
          console.log('✅ Proposal status after deletion:', restoredProposal.status);
        }
      }

      // Send notification about removal and restoration
      try {
        await this.notifyCalendarAction('removed_and_restored', {
          title: currentItem.title,
          scheduledDate: format(new Date(currentItem.scheduled_date), 'MMM dd, yyyy'),
          reason: reason || 'User requested removal',
          proposalId,
          userId: user.id
        });
      } catch (notificationError) {
        console.warn('⚠️ Failed to send notification:', notificationError);
        // Don't throw here, deletion was successful
      }

      const successMessage = proposalId 
        ? 'Calendar item removed and proposal restored to available'
        : 'Calendar item removed successfully';
      
      toast.success(successMessage);
      console.log('✅ Calendar item removal completed:', { calendarItemId, proposalId });
    } catch (error: any) {
      console.error('❌ Error removing calendar item:', {
        error: error.message || error,
        calendarItemId,
        stack: error.stack
      });
      toast.error(error.message || 'Failed to remove calendar item');
      throw error;
    }
  }

  // Bulk postpone multiple calendar items
  async bulkPostponeCalendarItems(calendarItemIds: string[], newDates: string[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (calendarItemIds.length !== newDates.length) {
        throw new Error('Calendar item IDs and new dates arrays must have the same length');
      }

      const promises = calendarItemIds.map((id, index) => 
        this.postponeCalendarItem(id, newDates[index], 'Bulk postponement')
      );

      await Promise.all(promises);
      
      toast.success(`Successfully postponed ${calendarItemIds.length} calendar items`);
      console.log('✅ Bulk postponement completed:', calendarItemIds.length);
    } catch (error) {
      console.error('❌ Error in bulk postponement:', error);
      toast.error('Failed to postpone some calendar items');
      throw error;
    }
  }

  // Bulk remove calendar items and restore proposals
  async bulkRemoveCalendarItems(calendarItemIds: string[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const promises = calendarItemIds.map(id => 
        this.removeCalendarItemAndRestoreProposal(id, 'Bulk removal')
      );

      await Promise.all(promises);
      
      toast.success(`Successfully removed ${calendarItemIds.length} calendar items and restored proposals`);
      console.log('✅ Bulk removal completed:', calendarItemIds.length);
    } catch (error) {
      console.error('❌ Error in bulk removal:', error);
      toast.error('Failed to remove some calendar items');
      throw error;
    }
  }

  // Check if calendar item is overdue
  isCalendarItemOverdue(scheduledDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    
    return scheduled < today;
  }

  // Get overdue calendar items for a user
  async getOverdueCalendarItems(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: overdueItems, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id)
        .lt('scheduled_date', today.toISOString())
        .in('status', ['planning', 'writing'])
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return overdueItems || [];
    } catch (error) {
      console.error('Error getting overdue calendar items:', error);
      return [];
    }
  }

  // Private helper to update notes with action history
  private updateNotesWithAction(currentNotes: string | null, action: string, actionData: any): string {
    try {
      const notes = currentNotes ? JSON.parse(currentNotes) : {};
      
      if (!notes.action_history) {
        notes.action_history = [];
      }
      
      notes.action_history.push({
        action,
        timestamp: new Date().toISOString(),
        data: actionData
      });
      
      return JSON.stringify(notes);
    } catch (error) {
      console.error('Error updating notes:', error);
      return currentNotes || '{}';
    }
  }

  // Private helper to send notifications for calendar actions
  private async notifyCalendarAction(actionType: string, data: any): Promise<void> {
    try {
      const { createNotificationHelper } = await import('@/utils/notificationHelpers');
      const notificationHelper = createNotificationHelper(data.userId);
      
      switch (actionType) {
        case 'postponed':
          await notificationHelper.notifyContentPostponed(data.title, data.originalDate, data.newDate);
          break;
        case 'removed_and_restored':
          await notificationHelper.notifyContentRemovedAndRestored(data.title, data.scheduledDate, data.reason);
          break;
      }
    } catch (error) {
      console.error('Failed to send calendar action notification:', error);
    }
  }
}

export const calendarActionsService = new CalendarActionsService();