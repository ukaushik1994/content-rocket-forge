import { supabase } from '@/integrations/supabase/client';
import { CampaignStrategy } from '@/types/campaign-types';

export interface SavedCampaign {
  id: string;
  name: string;
  original_idea: string;
  selected_strategy: CampaignStrategy | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

export const campaignService = {
  /**
   * Save a campaign with selected strategy
   */
  async saveCampaign(
    userId: string,
    name: string,
    originalIdea: string,
    selectedStrategy: CampaignStrategy | null = null
  ): Promise<SavedCampaign> {
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

    if (error) throw error;
    return {
      ...data,
      selected_strategy: data.selected_strategy as unknown as CampaignStrategy | null,
    };
  },

  /**
   * Get all campaigns for a user
   */
  async getUserCampaigns(userId: string): Promise<SavedCampaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((campaign) => ({
      ...campaign,
      selected_strategy: campaign.selected_strategy as unknown as CampaignStrategy | null,
    }));
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
};
