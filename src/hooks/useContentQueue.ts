import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface QueueItem {
  id: string;
  campaign_id: string;
  user_id: string;
  format_id: string;
  piece_index: number;
  brief: any;
  campaign_context: any;
  solution_data: any | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  result: any | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export const useContentQueue = (campaignId: string | null) => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch queue items
  const fetchQueueItems = useCallback(async () => {
    if (!campaignId) {
      setQueueItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content_generation_queue')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      setQueueItems(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Failed to fetch queue items:', error);
      toast.error('Failed to load generation queue');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  // Calculate stats from queue items
  const calculateStats = (items: QueueItem[]) => {
    const newStats: QueueStats = {
      total: items.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    items.forEach(item => {
      if (item.status === 'pending') newStats.pending++;
      else if (item.status === 'processing') newStats.processing++;
      else if (item.status === 'completed') newStats.completed++;
      else if (item.status === 'failed') newStats.failed++;
    });

    setStats(newStats);
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchQueueItems();

    if (!campaignId) return;

    // Subscribe to queue changes
    const queueChannel = supabase
      .channel(`queue-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_generation_queue',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Queue update:', payload);
          fetchQueueItems();
        }
      )
      .subscribe();

    setChannel(queueChannel);

    return () => {
      queueChannel.unsubscribe();
    };
  }, [campaignId, fetchQueueItems]);

  // Start queue processing
  const startProcessing = async () => {
    try {
      const { error } = await supabase.functions.invoke('process-content-queue');
      
      if (error) throw error;
      
      toast.success('Content generation started');
    } catch (error: any) {
      console.error('Failed to start queue processing:', error);
      toast.error('Failed to start content generation');
    }
  };

  // Retry a failed item
  const retryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('content_generation_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item queued for retry');
      
      // Trigger queue processing
      await startProcessing();
    } catch (error: any) {
      console.error('Failed to retry item:', error);
      toast.error('Failed to retry item');
    }
  };

  // Cancel a pending/processing item
  const cancelItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('content_generation_queue')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item cancelled');
    } catch (error: any) {
      console.error('Failed to cancel item:', error);
      toast.error('Failed to cancel item');
    }
  };

  // Clear completed items
  const clearCompleted = async () => {
    if (!campaignId) return;

    try {
      const { error } = await supabase
        .from('content_generation_queue')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('status', 'completed');

      if (error) throw error;

      toast.success('Cleared completed items');
    } catch (error: any) {
      console.error('Failed to clear completed items:', error);
      toast.error('Failed to clear completed items');
    }
  };

  return {
    queueItems,
    stats,
    loading,
    startProcessing,
    retryItem,
    cancelItem,
    clearCompleted,
    refresh: fetchQueueItems
  };
};
