import { supabase } from '@/integrations/supabase/client';
import { contentStrategyService, CalendarItem } from './contentStrategyService';
import { toast } from 'sonner';
import { addDays, addWeeks, format, isWeekend, nextMonday, parseISO } from 'date-fns';

interface StrategyProposal {
  id?: string;
  title: string;
  description?: string;
  primary_keyword: string;
  priority_tag?: string;
  content_type?: string;
  estimated_impressions?: number;
}

interface SchedulingPreferences {
  startDate?: Date;
  timelineWeeks?: number;
  contentPiecesPerWeek?: number;
  avoidWeekends?: boolean;
  spreadEvenly?: boolean;
  priorityFirst?: boolean;
}

interface OptimalSchedule {
  proposal: StrategyProposal;
  scheduledDate: Date;
  priority: number;
  reasoning: string;
}

class SmartCalendarSchedulingService {
  // Get existing calendar items to avoid conflicts
  private async getExistingCalendarItems(): Promise<CalendarItem[]> {
    try {
      return await contentStrategyService.getCalendarItems();
    } catch (error) {
      console.error('Error fetching calendar items:', error);
      return [];
    }
  }

  // Check if date has existing content scheduled
  private hasConflict(date: Date, existingItems: CalendarItem[]): boolean {
    const dateStr = format(date, 'yyyy-MM-dd');
    return existingItems.some(item => 
      format(parseISO(item.scheduled_date), 'yyyy-MM-dd') === dateStr
    );
  }

  // Get next available business day (avoiding weekends)
  private getNextBusinessDay(date: Date, existingItems: CalendarItem[]): Date {
    let nextDate = new Date(date);
    let attempts = 0;
    const maxAttempts = 14; // Prevent infinite loops

    while (attempts < maxAttempts) {
      // Skip weekends
      if (isWeekend(nextDate)) {
        nextDate = nextMonday(nextDate);
      }

      // Check for conflicts
      if (!this.hasConflict(nextDate, existingItems)) {
        return nextDate;
      }

      // Move to next day
      nextDate = addDays(nextDate, 1);
      attempts++;
    }

    // Fallback: return date even with conflicts
    return nextDate;
  }

  // Calculate priority score for scheduling order
  private calculatePriorityScore(proposal: StrategyProposal): number {
    let score = 0;

    // Priority tag scoring
    switch (proposal.priority_tag) {
      case 'quick_win':
        score += 100;
        break;
      case 'high_return':
        score += 80;
        break;
      case 'evergreen':
        score += 60;
        break;
      default:
        score += 40;
    }

    // Estimated impressions bonus (normalized)
    const impressions = proposal.estimated_impressions || 0;
    score += Math.min(impressions / 1000, 50); // Cap at 50 bonus points

    // Content type priority
    switch (proposal.content_type) {
      case 'blog':
        score += 20;
        break;
      case 'article':
        score += 15;
        break;
      default:
        score += 10;
    }

    return score;
  }

  // Generate optimal schedule for selected proposals
  async generateOptimalSchedule(
    proposals: StrategyProposal[],
    preferences: SchedulingPreferences = {}
  ): Promise<OptimalSchedule[]> {
    try {
      console.log('📅 Generating optimal schedule for', proposals.length, 'proposals');

      const {
        startDate = new Date(),
        timelineWeeks = 12,
        contentPiecesPerWeek = 2,
        avoidWeekends = true,
        spreadEvenly = true,
        priorityFirst = true
      } = preferences;

      // Get existing calendar items
      const existingItems = await this.getExistingCalendarItems();

      // Sort proposals by priority if enabled
      const sortedProposals = priorityFirst 
        ? [...proposals].sort((a, b) => this.calculatePriorityScore(b) - this.calculatePriorityScore(a))
        : [...proposals];

      const schedule: OptimalSchedule[] = [];
      let currentDate = new Date(startDate);
      let weekCounter = 0;
      let contentThisWeek = 0;

      console.log('📊 Scheduling preferences:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        timelineWeeks,
        contentPiecesPerWeek,
        totalProposals: proposals.length
      });

      for (const proposal of sortedProposals) {
        // Reset weekly counter if needed
        if (spreadEvenly && contentThisWeek >= contentPiecesPerWeek) {
          weekCounter++;
          contentThisWeek = 0;
          currentDate = addWeeks(startDate, weekCounter);
        }

        // Stop if we exceed timeline
        if (weekCounter >= timelineWeeks) {
          console.warn('⚠️ Timeline exceeded, remaining proposals will be scheduled at the end');
          currentDate = addWeeks(startDate, timelineWeeks - 1);
        }

        // Find next available date
        const scheduledDate = avoidWeekends 
          ? this.getNextBusinessDay(currentDate, existingItems)
          : currentDate;

        // Calculate priority score for reasoning
        const priorityScore = this.calculatePriorityScore(proposal);

        // Generate reasoning
        let reasoning = `Priority: ${proposal.priority_tag || 'standard'}`;
        if (proposal.estimated_impressions) {
          reasoning += `, Est. impressions: ${proposal.estimated_impressions.toLocaleString()}`;
        }
        if (contentThisWeek === 0) {
          reasoning += `, Week ${weekCounter + 1} start`;
        }

        schedule.push({
          proposal,
          scheduledDate,
          priority: priorityScore,
          reasoning
        });

        // Update counters
        contentThisWeek++;
        
        // Move to next scheduling slot
        if (spreadEvenly) {
          const daysPerContent = 7 / contentPiecesPerWeek;
          currentDate = addDays(currentDate, Math.ceil(daysPerContent));
        } else {
          currentDate = addDays(currentDate, 1);
        }
      }

      console.log('✅ Generated optimal schedule with', schedule.length, 'items');
      return schedule;

    } catch (error) {
      console.error('❌ Error generating optimal schedule:', error);
      throw error;
    }
  }

  // Auto-schedule selected proposals to calendar
  async autoScheduleProposals(
    proposals: StrategyProposal[],
    preferences: SchedulingPreferences = {}
  ): Promise<{
    scheduled: number;
    conflicts: number;
    errors: number;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      console.log('🚀 Auto-scheduling', proposals.length, 'proposals to calendar');

      // Generate optimal schedule
      const optimalSchedule = await this.generateOptimalSchedule(proposals, preferences);

      let scheduledCount = 0;
      let conflictCount = 0;
      let errorCount = 0;

      // Get active strategy for linking
      const activeStrategy = await contentStrategyService.getActiveStrategy();

      // Create calendar items
      for (const scheduleItem of optimalSchedule) {
        try {
          const calendarItem: Partial<CalendarItem> = {
            user_id: user.id,
            strategy_id: activeStrategy?.id,
            title: scheduleItem.proposal.title,
            content_type: scheduleItem.proposal.content_type || 'blog',
            status: 'planning',
            scheduled_date: format(scheduleItem.scheduledDate, 'yyyy-MM-dd'),
            priority: this.mapPriorityTagToLevel(scheduleItem.proposal.priority_tag),
            estimated_hours: this.estimateContentHours(scheduleItem.proposal.content_type),
            tags: [
              scheduleItem.proposal.primary_keyword,
              scheduleItem.proposal.priority_tag || 'evergreen',
              'ai-generated'
            ],
            notes: `Auto-scheduled from AI strategy proposal.\n${scheduleItem.reasoning}`
          };

          await contentStrategyService.createCalendarItem(calendarItem);
          scheduledCount++;
          
          console.log('📅 Scheduled:', {
            title: scheduleItem.proposal.title,
            date: format(scheduleItem.scheduledDate, 'yyyy-MM-dd'),
            priority: scheduleItem.priority
          });

        } catch (error) {
          console.error('❌ Error scheduling proposal:', scheduleItem.proposal.title, error);
          errorCount++;
        }
      }

      const result = {
        scheduled: scheduledCount,
        conflicts: conflictCount,
        errors: errorCount
      };

      console.log('🎉 Auto-scheduling completed:', result);

      // Send bulk scheduling notification
      if (scheduledCount > 0) {
        try {
          const { createNotificationHelper } = await import('@/utils/notificationHelpers');
          const notificationHelper = createNotificationHelper(user.id);
          
          const firstDate = format(optimalSchedule[0]?.scheduledDate || new Date(), 'MMM dd');
          const lastDate = format(optimalSchedule[optimalSchedule.length - 1]?.scheduledDate || new Date(), 'MMM dd');
          
          await notificationHelper.notifyBulkContentScheduled(scheduledCount, firstDate, lastDate);
        } catch (notificationError) {
          console.error('Failed to send bulk scheduling notification:', notificationError);
        }

        // Show user feedback
        toast.success(`Auto-scheduled ${scheduledCount} content pieces to calendar`, {
          description: errorCount > 0 ? `${errorCount} items failed to schedule` : 'All items scheduled successfully'
        });
      } else {
        toast.error('Failed to schedule any content to calendar');
      }

      return result;

    } catch (error) {
      console.error('❌ Error in auto-schedule proposals:', error);
      toast.error('Failed to auto-schedule proposals to calendar');
      return { scheduled: 0, conflicts: 0, errors: 0 };
    }
  }

  // Map priority tags to calendar priority levels
  private mapPriorityTagToLevel(priorityTag?: string): string {
    switch (priorityTag) {
      case 'quick_win':
        return 'high';
      case 'high_return':
        return 'high';
      case 'evergreen':
        return 'medium';
      default:
        return 'medium';
    }
  }

  // Estimate content production hours by type
  private estimateContentHours(contentType?: string): number {
    switch (contentType) {
      case 'blog':
        return 4;
      case 'article':
        return 6;
      case 'social':
        return 1;
      case 'email':
        return 2;
      default:
        return 3;
    }
  }

  // Preview schedule without creating calendar items
  async previewSchedule(
    proposals: StrategyProposal[],
    preferences: SchedulingPreferences = {}
  ): Promise<OptimalSchedule[]> {
    return this.generateOptimalSchedule(proposals, preferences);
  }
}

export const smartCalendarScheduling = new SmartCalendarSchedulingService();