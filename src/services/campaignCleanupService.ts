import { supabase } from '@/integrations/supabase/client';

export const campaignCleanupService = {
  /**
   * Remove duplicate campaigns keeping only the most recent one for each unique idea
   */
  async removeDuplicates(userId: string): Promise<{ removed: number; kept: number }> {
    try {
      // Get all campaigns for the user
      const { data: campaigns, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (!campaigns) return { removed: 0, kept: 0 };

      // Group by original_idea
      const grouped = campaigns.reduce((acc, campaign) => {
        const key = campaign.original_idea;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(campaign);
        return acc;
      }, {} as Record<string, typeof campaigns>);

      // For each group, keep the most recent and delete the rest
      const idsToDelete: string[] = [];
      let keptCount = 0;

      Object.values(grouped).forEach((group) => {
        if (group.length > 1) {
          // Keep the first one (most recent due to ordering)
          keptCount++;
          // Delete the rest
          idsToDelete.push(...group.slice(1).map((c) => c.id));
        } else {
          keptCount++;
        }
      });

      // Delete duplicates
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('campaigns')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) throw deleteError;
      }

      return { removed: idsToDelete.length, kept: keptCount };
    } catch (error) {
      console.error('Error removing duplicates:', error);
      throw error;
    }
  },

  /**
   * Remove a specific campaign duplicate by ID
   */
  async removeSpecificCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) throw error;
  },
};
