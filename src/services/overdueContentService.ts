import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OverdueContentItem {
  id: string;
  title: string;
  scheduled_date: string;
  content_type: string;
  status: string;
  days_overdue: number;
  source_proposal_id?: string;
  proposal_data?: any;
}

class OverdueContentService {
  
  /**
   * Check for overdue calendar items and return them
   */
  async checkOverdueContent(): Promise<OverdueContentItem[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id)
        .lt('scheduled_date', today.toISOString().split('T')[0])
        .in('status', ['planning', 'in_progress', 'ready'])
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error checking overdue content:', error);
        return [];
      }

      const overdueItems: OverdueContentItem[] = (data || []).map(item => {
        const scheduledDate = new Date(item.scheduled_date);
        const daysOverdue = Math.ceil((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: item.id,
          title: item.title,
          scheduled_date: item.scheduled_date,
          content_type: item.content_type,
          status: item.status,
          days_overdue: daysOverdue,
          source_proposal_id: item.source_proposal_id || null,
          proposal_data: item.proposal_data || null
        };
      });

      console.log(`Found ${overdueItems.length} overdue content items`);
      return overdueItems;
      
    } catch (error) {
      console.error('Error in checkOverdueContent:', error);
      return [];
    }
  }

  /**
   * Move overdue calendar items back to AI proposals
   */
  async restoreOverdueToProposals(overdueItems: OverdueContentItem[]): Promise<{
    restored: number;
    errors: number;
  }> {
    let restored = 0;
    let errors = 0;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      for (const item of overdueItems) {
        try {
          // Check if this item has proposal data to restore
          if (item.source_proposal_id && item.proposal_data) {
            // Create a new AI proposal from the overdue item
            const proposalData = {
              user_id: user.id,
              title: `[OVERDUE] ${item.title}`,
              description: `Content was overdue by ${item.days_overdue} days. Originally scheduled for ${new Date(item.scheduled_date).toLocaleDateString()}.`,
              primary_keyword: item.proposal_data.primary_keyword || '',
              related_keywords: item.proposal_data.related_keywords || [],
              content_suggestions: item.proposal_data.content_suggestions || [],
              estimated_impressions: item.proposal_data.estimated_impressions || 0,
              priority_tag: 'high_return', // Mark as high priority due to being overdue
              content_type: item.content_type,
              serp_data: item.proposal_data.serp_data || {},
              proposal_data: {
                ...item.proposal_data,
                restored_from_overdue: true,
                original_due_date: item.scheduled_date,
                days_overdue: item.days_overdue,
                restored_at: new Date().toISOString()
              }
            };

            // Insert the restored proposal
            const { error: insertError } = await supabase
              .from('ai_strategy_proposals')
              .insert(proposalData);

            if (insertError) {
              console.error('Error restoring proposal:', insertError);
              errors++;
              continue;
            }
          }

          // Update the calendar item status to indicate it was moved back
          const { error: updateError } = await supabase
            .from('content_calendar')
            .update({ 
              status: 'cancelled',
              notes: `Moved back to proposals due to being overdue by ${item.days_overdue} days`
            })
            .eq('id', item.id);

          if (updateError) {
            console.error('Error updating calendar item:', updateError);
            errors++;
          } else {
            restored++;
            console.log(`Restored overdue item: ${item.title}`);
          }

        } catch (itemError) {
          console.error(`Error processing overdue item ${item.id}:`, itemError);
          errors++;
        }
      }

      if (restored > 0) {
        toast.success(`Restored ${restored} overdue items back to proposals`, {
          description: errors > 0 ? `${errors} items had errors during restoration` : undefined
        });
      }

      return { restored, errors };

    } catch (error) {
      console.error('Error in restoreOverdueToProposals:', error);
      toast.error('Failed to restore overdue content');
      return { restored: 0, errors: overdueItems.length };
    }
  }

  /**
   * Create dashboard notifications for overdue content
   */
  async createOverdueNotifications(overdueItems: OverdueContentItem[]): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return;
      }

      // Group overdue items by severity
      const criticalOverdue = overdueItems.filter(item => item.days_overdue >= 7);
      const moderateOverdue = overdueItems.filter(item => item.days_overdue >= 3 && item.days_overdue < 7);
      const recentOverdue = overdueItems.filter(item => item.days_overdue < 3);

      const notifications = [];

      if (criticalOverdue.length > 0) {
        notifications.push({
          user_id: user.id,
          title: 'Critical: Severely Overdue Content',
          message: `${criticalOverdue.length} content pieces are 7+ days overdue and need immediate attention.`,
          severity: 'high',
          category: 'content_management',
          action_url: '/research/content-strategy#calendar',
          metadata: {
            type: 'critical_overdue',
            count: criticalOverdue.length,
            items: criticalOverdue.map(item => ({ id: item.id, title: item.title, days_overdue: item.days_overdue }))
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });
      }

      if (moderateOverdue.length > 0) {
        notifications.push({
          user_id: user.id,
          title: 'Content Overdue',
          message: `${moderateOverdue.length} content pieces are overdue and should be addressed soon.`,
          severity: 'medium',
          category: 'content_management',
          action_url: '/research/content-strategy#calendar',
          metadata: {
            type: 'moderate_overdue',
            count: moderateOverdue.length,
            items: moderateOverdue.map(item => ({ id: item.id, title: item.title, days_overdue: item.days_overdue }))
          },
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
        });
      }

      if (notifications.length > 0) {
        const { error } = await supabase
          .from('dashboard_alerts')
          .insert(notifications);

        if (error) {
          console.error('Error creating overdue notifications:', error);
        } else {
          console.log(`Created ${notifications.length} overdue content notifications`);
        }
      }

    } catch (error) {
      console.error('Error in createOverdueNotifications:', error);
    }
  }

  /**
   * Run the complete overdue content check and restoration process
   */
  async processOverdueContent(): Promise<{
    checked: number;
    restored: number;
    notificationsCreated: number;
  }> {
    try {
      // Check for overdue content
      const overdueItems = await this.checkOverdueContent();
      
      if (overdueItems.length === 0) {
        console.log('No overdue content found');
        return { checked: 0, restored: 0, notificationsCreated: 0 };
      }

      // Create notifications for overdue items
      await this.createOverdueNotifications(overdueItems);

      // Restore severely overdue items (7+ days) back to proposals
      const severelyOverdue = overdueItems.filter(item => item.days_overdue >= 7);
      let restored = 0;
      
      if (severelyOverdue.length > 0) {
        const result = await this.restoreOverdueToProposals(severelyOverdue);
        restored = result.restored;
      }

      console.log(`Overdue content processing complete: ${overdueItems.length} checked, ${restored} restored`);
      
      return {
        checked: overdueItems.length,
        restored,
        notificationsCreated: overdueItems.length > 0 ? 1 : 0
      };

    } catch (error) {
      console.error('Error in processOverdueContent:', error);
      return { checked: 0, restored: 0, notificationsCreated: 0 };
    }
  }
}

export const overdueContentService = new OverdueContentService();