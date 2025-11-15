import { useState, useEffect } from 'react';
import { campaignService, SavedCampaign } from '@/services/campaignService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    if (!user) {
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await campaignService.getUserCampaigns(user.id);
      setCampaigns(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const deleteCampaign = async (campaignId: string) => {
    try {
      await campaignService.deleteCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast.success('Campaign deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete campaign';
      toast.error(message);
      throw err;
    }
  };

  const updateCampaignName = async (campaignId: string, name: string) => {
    try {
      await campaignService.updateCampaignName(campaignId, name);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, name } : c))
      );
      toast.success('Campaign renamed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename campaign';
      toast.error(message);
      throw err;
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      await campaignService.updateCampaignStatus(campaignId, status);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status } : c))
      );
      toast.success(`Campaign ${status}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update campaign';
      toast.error(message);
      throw err;
    }
  };

  return {
    campaigns,
    isLoading,
    error,
    refetch: fetchCampaigns,
    deleteCampaign,
    updateCampaignName,
    updateCampaignStatus,
  };
};
