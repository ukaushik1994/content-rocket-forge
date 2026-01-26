import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CampaignStats {
  activeCampaigns: number;
  contentPiecesCreated: number;
  completedCampaigns: number;
  loading: boolean;
}

export const useCampaignStats = (): CampaignStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CampaignStats>({
    activeCampaigns: 0,
    contentPiecesCreated: 0,
    completedCampaigns: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Fetch active campaigns (active or planned status)
        const { count: activeCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['active', 'planned']);

        // Fetch completed campaigns
        const { count: completedCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        // Fetch content pieces created for campaigns
        const { count: contentCount } = await supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('campaign_id', 'is', null);

        setStats({
          activeCampaigns: activeCount || 0,
          contentPiecesCreated: contentCount || 0,
          completedCampaigns: completedCount || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch campaign stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const campaignsChannel = supabase
      .channel('campaign-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_items',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(campaignsChannel);
    };
  }, [user]);

  return stats;
};
