import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CampaignStrategy } from '@/types/campaign-types';

interface BatchGenerationProgress {
  total: number;
  completed: number;
  failed: number;
  status: 'idle' | 'queuing' | 'processing' | 'complete' | 'error';
}

export const useBatchContentGeneration = () => {
  const [progress, setProgress] = useState<BatchGenerationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    status: 'idle'
  });

  const generateAllContent = async (
    strategy: CampaignStrategy,
    campaignId: string,
    userId: string
  ) => {
    try {
      setProgress({
        total: 0,
        completed: 0,
        failed: 0,
        status: 'queuing'
      });

      // Validate strategy has contentBriefs
      if (!strategy.contentBriefs || strategy.contentBriefs.length === 0) {
        throw new Error('Strategy missing content briefs - cannot generate content');
      }

      const totalItems = strategy.contentBriefs.length;
      console.log(`🚀 Starting batch generation for ${totalItems} content pieces`);

      setProgress(prev => ({ ...prev, total: totalItems }));

      // Insert all items into queue at once (batch operation)
      const queueItems = strategy.contentBriefs.map((brief) => ({
        campaign_id: campaignId,
        user_id: userId,
        format_id: brief.formatId,
        piece_index: brief.pieceIndex,
        brief: brief as any,
        campaign_context: {
          strategy: strategy as any,
          solutionId: campaignId
        } as any,
        status: 'pending' as const,
        priority: 1
      }));

      const { error: insertError } = await supabase
        .from('content_generation_queue')
        .insert(queueItems as any);

      if (insertError) {
        console.error('Failed to insert queue items:', insertError);
        throw new Error('Failed to queue content for generation');
      }

      console.log(`✅ Queued ${totalItems} items for batch processing`);
      
      setProgress(prev => ({ ...prev, status: 'processing' }));
      
      // Update campaign status to 'active'
      await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      // Trigger queue processor
      const { error: processorError } = await supabase.functions.invoke('process-content-queue', {
        body: { campaignId }
      });

      if (processorError) {
        console.warn('Queue processor invocation failed (will auto-process):', processorError);
        // Non-critical - queue will auto-process
      }

      toast.success(`Started generating ${totalItems} content pieces`);

      // Subscribe to queue updates for real-time progress
      const channel = supabase
        .channel(`campaign-${campaignId}-queue`)
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
            refreshProgress(campaignId);
          }
        )
        .subscribe();

      // Initial progress check
      await refreshProgress(campaignId);

      return { success: true, channel };

    } catch (error) {
      console.error('Batch generation error:', error);
      setProgress(prev => ({ ...prev, status: 'error' }));
      toast.error(error instanceof Error ? error.message : 'Failed to start batch generation');
      return { success: false };
    }
  };

  const refreshProgress = async (campaignId: string) => {
    const { data, error } = await supabase
      .from('content_generation_queue')
      .select('status')
      .eq('campaign_id', campaignId);

    if (error || !data) {
      console.error('Failed to fetch progress:', error);
      return;
    }

    const completed = data.filter(item => item.status === 'completed').length;
    const failed = data.filter(item => item.status === 'failed').length;
    const total = data.length;

    setProgress({
      total,
      completed,
      failed,
      status: completed + failed >= total ? 'complete' : 'processing'
    });

    // Update campaign status if all complete
    if (completed + failed >= total) {
      await supabase
        .from('campaigns')
        .update({ 
          status: failed === 0 ? 'completed' : 'active' 
        })
        .eq('id', campaignId);
    }
  };

  return {
    generateAllContent,
    progress
  };
};
