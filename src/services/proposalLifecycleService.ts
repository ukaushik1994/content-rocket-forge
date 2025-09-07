import { supabase } from '@/integrations/supabase/client';
import { contentStrategyService, PipelineItem, CalendarItem } from './contentStrategyService';
import { proposalPipelineSync } from './proposalPipelineSync';
import { smartCalendarScheduling } from './smartCalendarScheduling';
import { toast } from 'sonner';

export type ProposalLifecycleStatus = 
  | 'generated' 
  | 'selected' 
  | 'scheduled' 
  | 'in-progress' 
  | 'review' 
  | 'completed' 
  | 'published'
  | 'archived';

export interface ProposalStatusUpdate {
  proposalId: string;
  status: ProposalLifecycleStatus;
  pipelineStage?: string;
  calendarStatus?: string;
  progress?: number;
  notes?: string;
  updatedBy: string;
}

export interface ProposalContext {
  id: string;
  title: string;
  description?: string;
  primary_keyword: string;
  priority_tag?: string;
  content_type?: string;
  estimated_impressions?: number;
  serp_data?: any;
  competitor_analysis?: any[];
  outline_suggestions?: any[];
  lifecycle_status: ProposalLifecycleStatus;
  pipeline_item?: PipelineItem;
  calendar_item?: CalendarItem;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

interface ProposalCrossTabActions {
  canScheduleToCalendar: boolean;
  canAddToPipeline: boolean;
  canGenerateContent: boolean;
  canMarkComplete: boolean;
  canArchive: boolean;
}

class ProposalLifecycleService {
  
  // Update proposal status across all tabs
  async updateProposalStatus(update: ProposalStatusUpdate): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      console.log('🔄 Updating proposal lifecycle status:', update);

      // Update pipeline item if exists
      const pipelineItems = await contentStrategyService.getPipelineItems();
      const pipelineItem = pipelineItems.find(item => item.source_proposal_id === update.proposalId);
      
      if (pipelineItem && update.pipelineStage) {
        await contentStrategyService.updatePipelineItem(pipelineItem.id, {
          stage: update.pipelineStage,
          progress_percentage: update.progress || pipelineItem.progress_percentage,
          notes: update.notes || pipelineItem.notes
        });
      }

      // Update calendar item if exists
      const calendarItems = await contentStrategyService.getCalendarItems();
      const calendarItem = calendarItems.find(item => 
        item.title === this.getProposalTitle(update.proposalId) // Need to track this better
      );
      
      if (calendarItem && update.calendarStatus) {
        await contentStrategyService.updateCalendarItem(calendarItem.id, {
          status: update.calendarStatus,
          notes: update.notes || calendarItem.notes
        });
      }

      // Store lifecycle update in dedicated table
      await this.logLifecycleUpdate(update);

      console.log('✅ Proposal status updated across all tabs');
      
    } catch (error) {
      console.error('❌ Error updating proposal status:', error);
      throw error;
    }
  }

  // Get comprehensive proposal context
  async getProposalContext(proposalId: string): Promise<ProposalContext | null> {
    try {
      // Get pipeline item
      const pipelineItems = await contentStrategyService.getPipelineItems();
      const pipelineItem = pipelineItems.find(item => item.source_proposal_id === proposalId);

      // Get calendar item
      const calendarItems = await contentStrategyService.getCalendarItems();
      const calendarItem = calendarItems.find(item => 
        item.notes?.includes(proposalId) || item.title === pipelineItem?.title
      );

      // Get latest lifecycle status
      const lifecycleStatus = await this.getLatestLifecycleStatus(proposalId);

      if (!pipelineItem && !calendarItem) {
        return null;
      }

      // Calculate completion percentage based on pipeline stage and calendar status
      const completionPercentage = this.calculateCompletionPercentage(
        pipelineItem?.stage,
        calendarItem?.status,
        lifecycleStatus
      );

      const context: ProposalContext = {
        id: proposalId,
        title: pipelineItem?.title || calendarItem?.title || 'Unknown',
        description: pipelineItem?.notes,
        primary_keyword: pipelineItem?.target_keyword || '',
        priority_tag: this.mapPriorityToTag(pipelineItem?.priority),
        content_type: pipelineItem?.content_type || calendarItem?.content_type,
        serp_data: pipelineItem?.proposal_data?.serp_data,
        competitor_analysis: pipelineItem?.proposal_data?.competitor_analysis,
        outline_suggestions: pipelineItem?.proposal_data?.outline_suggestions,
        lifecycle_status: lifecycleStatus,
        pipeline_item: pipelineItem,
        calendar_item: calendarItem,
        completion_percentage: completionPercentage,
        created_at: pipelineItem?.created_at || calendarItem?.created_at || new Date().toISOString(),
        updated_at: pipelineItem?.updated_at || calendarItem?.updated_at || new Date().toISOString()
      };

      return context;

    } catch (error) {
      console.error('❌ Error getting proposal context:', error);
      return null;
    }
  }

  // Get available cross-tab actions for a proposal
  getCrossTabActions(context: ProposalContext): ProposalCrossTabActions {
    return {
      canScheduleToCalendar: !context.calendar_item && context.lifecycle_status !== 'completed',
      canAddToPipeline: !context.pipeline_item && context.lifecycle_status !== 'completed',
      canGenerateContent: context.pipeline_item?.stage === 'writing' || context.calendar_item?.status === 'writing',
      canMarkComplete: context.completion_percentage >= 80 && context.lifecycle_status !== 'completed',
      canArchive: context.lifecycle_status === 'completed' || context.lifecycle_status === 'published'
    };
  }

  // Sync proposal status across tabs
  async syncProposalAcrossTabs(proposalId: string, action: string, data?: any): Promise<void> {
    try {
      const context = await this.getProposalContext(proposalId);
      if (!context) return;

      switch (action) {
        case 'schedule_to_calendar':
          await this.scheduleProposalToCalendar(context, data);
          break;
        case 'add_to_pipeline':
          await this.addProposalToPipeline(context, data);
          break;
        case 'mark_complete':
          await this.markProposalComplete(context);
          break;
        case 'generate_content':
          await this.navigateToContentBuilder(context);
          break;
        default:
          console.warn('Unknown cross-tab action:', action);
      }

    } catch (error) {
      console.error('❌ Error syncing proposal across tabs:', error);
      throw error;
    }
  }

  // Schedule proposal to calendar
  private async scheduleProposalToCalendar(context: ProposalContext, schedulingData?: any): Promise<void> {
    if (context.calendar_item) return;

    const proposals = [{
      id: context.id,
      title: context.title,
      description: context.description,
      primary_keyword: context.primary_keyword,
      priority_tag: context.priority_tag,
      content_type: context.content_type,
      estimated_impressions: 0
    }];

    await smartCalendarScheduling.autoScheduleProposals(proposals, schedulingData);
    
    await this.updateProposalStatus({
      proposalId: context.id,
      status: 'scheduled',
      calendarStatus: 'planning',
      notes: 'Auto-scheduled from cross-tab action',
      updatedBy: 'system'
    });
  }

  // Add proposal to pipeline
  private async addProposalToPipeline(context: ProposalContext, pipelineData?: any): Promise<void> {
    if (context.pipeline_item) return;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    await contentStrategyService.createPipelineItem({
      user_id: user.id,
      title: context.title,
      stage: 'idea',
      content_type: context.content_type || 'blog',
      target_keyword: context.primary_keyword,
      priority: this.mapTagToPriority(context.priority_tag),
      source_proposal_id: context.id,
      proposal_data: {
        serp_data: context.serp_data,
        competitor_analysis: context.competitor_analysis,
        outline_suggestions: context.outline_suggestions
      },
      notes: context.description || 'Added from cross-tab action',
      ...pipelineData
    });

    await this.updateProposalStatus({
      proposalId: context.id,
      status: 'in-progress',
      pipelineStage: 'idea',
      notes: 'Added to pipeline from cross-tab action',
      updatedBy: 'system'
    });
  }

  // Mark proposal as complete
  private async markProposalComplete(context: ProposalContext): Promise<void> {
    const updates: ProposalStatusUpdate = {
      proposalId: context.id,
      status: 'completed',
      progress: 100,
      notes: 'Marked as complete',
      updatedBy: 'user'
    };

    if (context.pipeline_item) {
      updates.pipelineStage = 'published';
    }

    if (context.calendar_item) {
      updates.calendarStatus = 'published';
    }

    await this.updateProposalStatus(updates);
  }

  // Navigate to content builder with full context
  private async navigateToContentBuilder(context: ProposalContext): Promise<void> {
    const builderParams = new URLSearchParams({
      title: context.title,
      keyword: context.primary_keyword,
      contentType: context.content_type || 'blog',
      proposalId: context.id
    });

    // Store enhanced context in sessionStorage for content builder
    sessionStorage.setItem('contentBuilderContext', JSON.stringify({
      proposalContext: context,
      serpData: context.serp_data,
      competitorAnalysis: context.competitor_analysis,
      outlineSuggestions: context.outline_suggestions
    }));

    window.location.href = `/content-builder?${builderParams.toString()}`;
  }

  // Log lifecycle update
  private async logLifecycleUpdate(update: ProposalStatusUpdate): Promise<void> {
    try {
      // For now, just log to console until types are updated
      console.log('📝 Lifecycle update logged:', update);
      // TODO: Implement database logging when types are available
    } catch (error) {
      console.error('Error logging lifecycle update:', error);
      // Don't throw - logging is supplementary
    }
  }

  // Get latest lifecycle status
  private async getLatestLifecycleStatus(proposalId: string): Promise<ProposalLifecycleStatus> {
    try {
      // For now, determine status from pipeline/calendar state
      const pipelineItems = await contentStrategyService.getPipelineItems();
      const pipelineItem = pipelineItems.find(item => item.source_proposal_id === proposalId);
      
      const calendarItems = await contentStrategyService.getCalendarItems();
      const calendarItem = calendarItems.find(item => 
        item.notes?.includes(proposalId) || item.title === pipelineItem?.title
      );

      if (pipelineItem?.stage === 'published') return 'completed';
      if (calendarItem?.status === 'published') return 'completed';
      if (pipelineItem?.stage === 'writing') return 'in-progress';
      if (calendarItem?.status === 'writing') return 'in-progress';
      if (pipelineItem || calendarItem) return 'scheduled';
      
      return 'generated';
    } catch {
      return 'generated';
    }
  }

  // Calculate completion percentage
  private calculateCompletionPercentage(
    pipelineStage?: string,
    calendarStatus?: string,
    lifecycleStatus?: ProposalLifecycleStatus
  ): number {
    if (lifecycleStatus === 'completed' || lifecycleStatus === 'published') return 100;
    if (lifecycleStatus === 'review') return 90;
    if (lifecycleStatus === 'in-progress') {
      if (pipelineStage === 'writing') return 60;
      if (pipelineStage === 'research') return 40;
      if (pipelineStage === 'idea') return 20;
    }
    if (lifecycleStatus === 'scheduled') return 30;
    if (lifecycleStatus === 'selected') return 10;
    return 0;
  }

  // Helper methods
  private getProposalTitle(proposalId: string): string {
    // This should be enhanced to maintain proposal title mapping
    return 'Unknown Proposal';
  }

  private mapPriorityToTag(priority?: string): string | undefined {
    switch (priority) {
      case 'high': return 'quick_win';
      case 'medium': return 'evergreen';
      case 'low': return 'low_priority';
      default: return undefined;
    }
  }

  private mapTagToPriority(tag?: string): string {
    switch (tag) {
      case 'quick_win': return 'high';
      case 'high_return': return 'high';
      case 'evergreen': return 'medium';
      default: return 'medium';
    }
  }
}

export const proposalLifecycleService = new ProposalLifecycleService();