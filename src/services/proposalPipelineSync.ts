import { contentStrategyService, PipelineItem } from '@/services/contentStrategyService';
import { StrategyProposal } from '@/services/aiStrategyService';
import { smartCalendarScheduling } from '@/services/smartCalendarScheduling';
import { toast } from 'sonner';

export interface ProposalSyncService {
  syncSelectedProposals: (
    selectedProposals: Record<string, boolean>,
    aiProposals: StrategyProposal[],
    existingPipeline: PipelineItem[],
    userId: string,
    strategyId?: string
  ) => Promise<void>;
  
  autoScheduleSelectedProposals: (
    selectedProposals: Record<string, boolean>,
    aiProposals: StrategyProposal[]
  ) => Promise<void>;
  
  removePipelineItemsByProposalId: (proposalIds: string[]) => Promise<void>;
}

class ProposalPipelineSyncService implements ProposalSyncService {
  
  // Generate a placeholder image URL based on content type and priority
  private generatePlaceholderImage(proposal: StrategyProposal): string {
    const contentType = proposal.content_type || 'blog';
    const priority = proposal.priority_tag;
    
    // Using a service like picsum.photos for placeholder images with different seeds
    const seed = proposal.primary_keyword?.replace(/\s+/g, '-') || 'content';
    const colorMap = {
      'quick_win': '4ade80', // green
      'high_return': 'f59e0b', // yellow
      'evergreen': '3b82f6', // blue
      'default': '6b7280' // gray
    };
    
    const color = colorMap[priority as keyof typeof colorMap] || colorMap.default;
    return `https://picsum.photos/seed/${seed}/400/200?grayscale&blur=1`;
  }

  // Main sync function that adds/removes pipeline items based on proposal selection
  async syncSelectedProposals(
    selectedProposals: Record<string, boolean>,
    aiProposals: StrategyProposal[],
    existingPipeline: PipelineItem[],
    userId: string,
    strategyId?: string
  ): Promise<void> {
    console.log('🔄 Starting proposal-pipeline sync', { 
      selectedCount: Object.values(selectedProposals).filter(Boolean).length,
      proposalsCount: aiProposals.length,
      existingPipelineCount: existingPipeline.length 
    });

    try {
      // Get currently selected proposal IDs
      const selectedProposalIds = Object.entries(selectedProposals)
        .filter(([_, selected]) => selected)
        .map(([proposalId, _]) => proposalId);

      // Find proposals that should be added to pipeline
      const itemsToAdd = aiProposals.filter(proposal => {
        const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
        const isSelected = selectedProposalIds.includes(proposalId);
        const existsInPipeline = existingPipeline.some(item => item.source_proposal_id === proposalId);
        
        return isSelected && !existsInPipeline;
      });

      // Find pipeline items that should be removed (deselected proposals)
      const itemsToRemove = existingPipeline.filter(item => {
        if (!item.source_proposal_id) return false;
        return !selectedProposalIds.includes(item.source_proposal_id);
      });

      console.log('📊 Sync analysis:', {
        toAdd: itemsToAdd.length,
        toRemove: itemsToRemove.length
      });

      // Add new pipeline items
      for (const proposal of itemsToAdd) {
        const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
        
        const pipelineItem = {
          user_id: userId,
          strategy_id: strategyId,
          title: proposal.title,
          stage: 'idea',
          content_type: proposal.content_type || 'blog',
          target_keyword: proposal.primary_keyword,
          priority: this.mapPriorityToLevel(proposal.priority_tag || 'evergreen'),
          image_url: this.generatePlaceholderImage(proposal),
          source_proposal_id: proposalId,
          proposal_data: proposal,
          notes: `Generated from AI strategy proposal: ${proposal.description || ''}`
        };

        await contentStrategyService.createPipelineItem(pipelineItem);
        console.log('➕ Added pipeline item for proposal:', proposal.title);
      }

      // Remove deselected items
      for (const item of itemsToRemove) {
        await contentStrategyService.deletePipelineItem(item.id);
        console.log('🗑️ Removed pipeline item for proposal:', item.title);
      }

      console.log('🎉 Proposal-pipeline sync completed successfully');
      
      // Auto-schedule selected proposals to calendar
      await this.autoScheduleSelectedProposals(selectedProposals, aiProposals);

    } catch (error) {
      console.error('❌ Error syncing proposals to pipeline:', error);
      throw error;
    }
  }

  // Auto-schedule selected proposals to calendar with smart scheduling
  async autoScheduleSelectedProposals(
    selectedProposals: Record<string, boolean>,
    aiProposals: StrategyProposal[]
  ): Promise<void> {
    try {
      // Get selected proposals by matching IDs from the selectedProposals object
      const selectedIds = Object.entries(selectedProposals)
        .filter(([_, selected]) => selected)
        .map(([id, _]) => id);
      
      const selected = aiProposals.filter(proposal => {
        const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
        return selectedIds.includes(proposalId);
      });
      
      if (selected.length === 0) {
        console.log('📅 No proposals selected for calendar scheduling');
        return;
      }

      console.log('📅 Auto-scheduling', selected.length, 'selected proposals to calendar');

      // Use smart scheduling with default preferences
      const schedulingPreferences = {
        startDate: new Date(),
        timelineWeeks: 12,
        contentPiecesPerWeek: 2,
        avoidWeekends: true,
        spreadEvenly: true,
        priorityFirst: true
      };

      const result = await smartCalendarScheduling.autoScheduleProposals(
        selected.map(proposal => ({
          id: proposal.id,
          title: proposal.title,
          description: proposal.description,
          primary_keyword: proposal.primary_keyword,
          priority_tag: proposal.priority_tag,
          content_type: proposal.content_type,
          estimated_impressions: proposal.estimated_impressions
        })),
        schedulingPreferences
      );

      console.log('✅ Calendar auto-scheduling completed:', result);

    } catch (error) {
      console.error('❌ Error auto-scheduling to calendar:', error);
      // Don't throw - calendar scheduling is supplementary to pipeline sync
      toast.error('Failed to auto-schedule to calendar, but pipeline sync completed');
    }
  }

  async removePipelineItemsByProposalId(proposalIds: string[]): Promise<void> {
    try {
      // This is a batch cleanup operation - get all pipeline items with matching source IDs
      const items = await contentStrategyService.getPipelineItems();
      
      const filteredItems = items.filter(item => 
        item.source_proposal_id && proposalIds.includes(item.source_proposal_id)
      );

      for (const item of filteredItems) {
        await contentStrategyService.deletePipelineItem(item.id);
      }
      
      console.log(`🗑️ Removed ${filteredItems.length} pipeline items for proposals:`, proposalIds);
    } catch (error) {
      console.error('❌ Error removing pipeline items by proposal ID:', error);
      throw error;
    }
  }

  private mapPriorityToLevel(priority: string): string {
    switch (priority) {
      case 'quick_win': return 'high';
      case 'high_return': return 'high';
      case 'evergreen': return 'medium';
      default: return 'medium';
    }
  }
}

export const proposalPipelineSync = new ProposalPipelineSyncService();