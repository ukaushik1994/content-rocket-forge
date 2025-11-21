import { supabase } from '@/integrations/supabase/client';
import { CampaignStrategy } from '@/types/campaign-types';

export interface SavedCampaign {
  id: string;
  name: string;
  original_idea: string;
  target_audience?: string;
  goal?: string;
  timeline?: string;
  selected_strategy: CampaignStrategy | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  // Enhanced metrics
  contentCount?: number;
  plannedCount?: number;
  progressPercentage?: number;
  estimatedReach?: string;
  distributionChannels?: string[];
}

export const campaignService = {
  /**
   * @deprecated Use createCampaignAtomic from campaignTransactions.ts instead.
   * This method performs direct inserts without atomic transaction support.
   * Will be removed in a future version.
   * 
   * Save a campaign with selected strategy
   */
  async saveCampaign(
    userId: string,
    name: string,
    originalIdea: string,
    selectedStrategy: CampaignStrategy | null = null
  ): Promise<SavedCampaign> {
    console.warn('⚠️ saveCampaign is deprecated. Use createCampaignAtomic instead.');
    // Validate inputs
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required to save campaign');
    }
    if (!name || name.trim() === '') {
      throw new Error('Campaign name is required');
    }
    if (!originalIdea || originalIdea.trim() === '') {
      throw new Error('Campaign idea is required');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name,
        original_idea: originalIdea,
        selected_strategy: selectedStrategy as any,
        status: selectedStrategy ? 'active' : 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Campaign save error:', error);
      throw new Error(`Failed to save campaign: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Campaign saved but no data returned');
    }
    
    return {
      ...data,
      selected_strategy: data.selected_strategy as unknown as CampaignStrategy | null,
    };
  },

  /**
   * Get all campaigns for a user with enhanced metrics
   */
  async getUserCampaigns(userId: string): Promise<SavedCampaign[]> {
    // Fetch campaigns with content count
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        content_items!content_items_campaign_id_fkey(id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((campaign: any) => {
      const strategy = campaign.selected_strategy as unknown as CampaignStrategy | null;
      
      // Calculate content metrics
      const contentCount = campaign.content_items?.length || 0;
      const plannedCount = strategy?.contentMix 
        ? Object.values(strategy.contentMix).reduce((sum: number, val: any) => {
            return sum + (typeof val === 'number' ? val : (val?.count || 0));
          }, 0)
        : 0;
      const progressPercentage = plannedCount > 0 ? Math.round((contentCount / plannedCount) * 100) : 0;
      
      // Extract distribution channels
      const distributionChannels = strategy?.distributionStrategy?.channels || [];
      
      return {
        id: campaign.id,
        name: campaign.name,
        original_idea: campaign.original_idea,
        target_audience: campaign.target_audience,
        goal: campaign.goal,
        timeline: campaign.timeline,
        selected_strategy: strategy,
        status: campaign.status,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        user_id: campaign.user_id,
        contentCount,
        plannedCount,
        progressPercentage,
        estimatedReach: strategy?.estimatedReach,
        distributionChannels,
      };
    });
  },

  /**
   * Get a single campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<SavedCampaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return {
      ...data,
      selected_strategy: data.selected_strategy as unknown as CampaignStrategy | null,
    };
  },

  /**
   * Update campaign name
   */
  async updateCampaignName(campaignId: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    if (error) throw error;
    
    console.log(`📊 [Campaign Service] Status updated to "${status}" for campaign ${campaignId}`);
  },

  /**
   * Transition campaign status based on workflow
   * draft → planned (strategy selected)
   * planned → active (content generation started)
   * active → completed (all content generated)
   */
  async transitionCampaignStatus(
    campaignId: string,
    event: 'strategy_selected' | 'generation_started' | 'generation_completed'
  ): Promise<void> {
    const statusMap = {
      'strategy_selected': 'planned',
      'generation_started': 'active',
      'generation_completed': 'completed'
    };

    const newStatus = statusMap[event];
    await this.updateCampaignStatus(campaignId, newStatus);
  },

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Update selected strategy
   */
  async updateSelectedStrategy(
    campaignId: string,
    selectedStrategy: CampaignStrategy
  ): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({
        selected_strategy: selectedStrategy as any,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Update campaign with strategy and context fields
   */
  async updateCampaign(
    campaignId: string,
    updates: {
      selected_strategy?: CampaignStrategy;
      target_audience?: string;
      goal?: string;
      timeline?: string;
      status?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        selected_strategy: updates.selected_strategy as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) throw error;
  },
};
