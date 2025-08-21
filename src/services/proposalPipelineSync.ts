import { contentStrategyService, PipelineItem } from '@/services/contentStrategyService';
import { StrategyProposal } from '@/services/aiStrategyService';

export interface ProposalSyncService {
  syncSelectedProposals: (
    selectedProposals: Record<string, boolean>,
    aiProposals: StrategyProposal[],
    existingPipeline: PipelineItem[],
    userId: string,
    strategyId?: string
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
      'low_priority': '9ca3af' // gray
    };
    
    const color = colorMap[priority] || '6366f1';
    return `https://placehold.co/400x300/${color}/ffffff?text=${encodeURIComponent(contentType.toUpperCase())}`;
  }

  // Convert proposal priority to pipeline priority
  private mapPriority(proposalPriority: string): string {
    const priorityMap = {
      'quick_win': 'high',
      'high_return': 'high', 
      'evergreen': 'medium',
      'low_priority': 'low'
    };
    return priorityMap[proposalPriority as keyof typeof priorityMap] || 'medium';
  }

  // Convert proposal to pipeline item
  private proposalToPipelineItem(
    proposal: StrategyProposal, 
    userId: string, 
    strategyId?: string
  ): Partial<PipelineItem> {
    return {
      user_id: userId,
      strategy_id: strategyId,
      title: proposal.title,
      stage: 'ideation',
      content_type: proposal.content_type || 'blog',
      target_keyword: proposal.primary_keyword,
      priority: this.mapPriority(proposal.priority_tag),
      progress_percentage: 0,
      image_url: this.generatePlaceholderImage(proposal),
      source_proposal_id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-'),
      proposal_data: {
        description: proposal.description,
        keywords: proposal.keywords,
        priority_tag: proposal.priority_tag,
        estimated_impressions: proposal.estimated_impressions,
        suggested_outline: proposal.suggested_outline,
        serp_data: proposal.serp_data
      },
      notes: `Generated from AI strategy proposal: ${proposal.description}`
    };
  }

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
      // Find proposals that are newly selected
      const selectedProposalIds = Object.entries(selectedProposals)
        .filter(([_, selected]) => selected)
        .map(([id, _]) => id);

      // Find proposals that are newly deselected
      const deselectedProposalIds = Object.entries(selectedProposals)
        .filter(([_, selected]) => !selected)
        .map(([id, _]) => id);

      // Get existing pipeline items created from proposals
      const existingProposalItems = existingPipeline.filter(item => item.source_proposal_id);
      const existingProposalIds = existingProposalItems.map(item => item.source_proposal_id!);

      // Create pipeline items for newly selected proposals
      const proposalsToAdd = aiProposals.filter(proposal => {
        const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
        return selectedProposalIds.includes(proposalId) && 
               !existingProposalIds.includes(proposalId);
      });

      // Remove pipeline items for deselected proposals
      const itemsToRemove = existingProposalItems.filter(item => 
        deselectedProposalIds.includes(item.source_proposal_id!)
      );

      console.log('📊 Sync operations:', {
        proposalsToAdd: proposalsToAdd.length,
        itemsToRemove: itemsToRemove.length
      });

      // Create new pipeline items
      for (const proposal of proposalsToAdd) {
        const pipelineItem = this.proposalToPipelineItem(proposal, userId, strategyId);
        await contentStrategyService.createPipelineItem(pipelineItem);
        console.log('✅ Created pipeline item for proposal:', proposal.title);
      }

      // Remove deselected pipeline items
      for (const item of itemsToRemove) {
        await contentStrategyService.deletePipelineItem(item.id);
        console.log('🗑️ Removed pipeline item for proposal:', item.title);
      }

      console.log('🎉 Proposal-pipeline sync completed successfully');

    } catch (error) {
      console.error('❌ Error syncing proposals to pipeline:', error);
      throw error;
    }
  }

  async removePipelineItemsByProposalId(proposalIds: string[]): Promise<void> {
    try {
      const existingPipeline = await contentStrategyService.getPipelineItems();
      const itemsToRemove = existingPipeline.filter(item => 
        item.source_proposal_id && proposalIds.includes(item.source_proposal_id)
      );

      for (const item of itemsToRemove) {
        await contentStrategyService.deletePipelineItem(item.id);
      }

      console.log(`Removed ${itemsToRemove.length} pipeline items for proposals:`, proposalIds);
    } catch (error) {
      console.error('Error removing pipeline items by proposal ID:', error);
      throw error;
    }
  }
}

export const proposalPipelineSync = new ProposalPipelineSyncService();