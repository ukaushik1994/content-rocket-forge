import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface QueueStatusData {
  campaignId: string;
  campaignName: string;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  progressPercent: number;
  isActive: boolean;
  lastUpdated: string;
}

export const useRealtimeQueueStatus = (campaignId: string | null) => {
  const [status, setStatus] = useState<QueueStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateStatus = useCallback((items: any[], campaignName: string): QueueStatusData => {
    const stats = {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
    };

    const progressPercent = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;

    return {
      campaignId: campaignId!,
      campaignName,
      ...stats,
      progressPercent,
      isActive: stats.pending > 0 || stats.processing > 0,
      lastUpdated: new Date().toISOString()
    };
  }, [campaignId]);

  const fetchStatus = useCallback(async () => {
    if (!campaignId) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch campaign name and queue items in parallel
      const [campaignRes, queueRes] = await Promise.all([
        supabase.from('campaigns').select('name').eq('id', campaignId).single(),
        supabase.from('content_generation_queue').select('status').eq('campaign_id', campaignId)
      ]);

      const campaignName = campaignRes.data?.name || 'Campaign';
      const items = queueRes.data || [];

      setStatus(calculateStatus(items, campaignName));
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    } finally {
      setLoading(false);
    }
  }, [campaignId, calculateStatus]);

  useEffect(() => {
    fetchStatus();

    if (!campaignId) return;

    // Subscribe to real-time changes
    const channel: RealtimeChannel = supabase
      .channel(`queue-realtime-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_generation_queue',
          filter: `campaign_id=eq.${campaignId}`
        },
        () => {
          // Refetch on any change
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [campaignId, fetchStatus]);

  return { status, loading, refresh: fetchStatus };
};
