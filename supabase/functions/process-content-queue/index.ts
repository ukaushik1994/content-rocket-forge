import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Exponential backoff configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 10000;
const CONCURRENT_LIMIT = 3;

interface QueueItem {
  id: string;
  campaign_id: string;
  user_id: string;
  format_id: string;
  piece_index: number;
  brief: any;
  campaign_context: any;
  solution_data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  retry_count: number;
  error_message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 [Queue Processor] Starting queue processing');

    // Fetch pending items ordered by priority and created_at
    const { data: queueItems, error: fetchError } = await supabase
      .from('content_generation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(CONCURRENT_LIMIT);

    if (fetchError) {
      console.error('❌ [Queue Processor] Failed to fetch queue items:', fetchError);
      throw fetchError;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('✅ [Queue Processor] No items in queue');
      return new Response(
        JSON.stringify({ message: 'No items to process', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 [Queue Processor] Processing ${queueItems.length} items`);

    // Process items concurrently
    const results = await Promise.allSettled(
      queueItems.map((item: QueueItem) => processQueueItem(supabase, item))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ [Queue Processor] Complete: ${successful} succeeded, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: 'Processing complete',
        processed: queueItems.length,
        successful,
        failed
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [Queue Processor] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processQueueItem(supabase: any, item: QueueItem): Promise<void> {
  const itemId = item.id;
  console.log(`🔄 [Queue Item ${itemId}] Starting processing`);

  try {
    // Mark as processing
    await updateQueueStatus(supabase, itemId, 'processing');

    // Call campaign-content-generator with retry logic
    const content = await generateContentWithRetry(supabase, item);

    // Mark as completed
    await updateQueueStatus(supabase, itemId, 'completed', { content_id: content.id });
    console.log(`✅ [Queue Item ${itemId}] Completed successfully`);

  } catch (error: any) {
    console.error(`❌ [Queue Item ${itemId}] Failed:`, error);

    // Check if we should retry
    if (item.retry_count < MAX_RETRIES && !isNonRetryableError(error)) {
      console.log(`🔄 [Queue Item ${itemId}] Retrying (${item.retry_count + 1}/${MAX_RETRIES})`);
      
      // Update retry count and reset to pending
      await supabase
        .from('content_generation_queue')
        .update({
          retry_count: item.retry_count + 1,
          status: 'pending',
          error_message: error.message,
          last_error_at: new Date().toISOString()
        })
        .eq('id', itemId);
    } else {
      // Mark as failed permanently
      await updateQueueStatus(supabase, itemId, 'failed', { error: error.message });
    }

    throw error;
  }
}

async function generateContentWithRetry(supabase: any, item: QueueItem): Promise<any> {
  let lastError: Error | null = null;
  let delay = INITIAL_DELAY;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🎯 [Queue Item ${item.id}] Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

      // Call campaign-content-generator edge function
      const { data, error } = await supabase.functions.invoke('campaign-content-generator', {
        body: {
          brief: item.brief,
          campaignId: item.campaign_id,
          solutionId: item.solution_data?.id || null,
          formatId: item.format_id,
          campaignContext: item.campaign_context,
          solutionData: item.solution_data,
          userId: item.user_id
        }
      });

      if (error) throw error;
      return data;

    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication/permission errors
      if (isNonRetryableError(error)) {
        throw error;
      }

      // Calculate exponential backoff delay
      if (attempt < MAX_RETRIES) {
        const jitter = Math.random() * 1000;
        const waitTime = Math.min(delay + jitter, MAX_DELAY);
        console.log(`⏳ [Queue Item ${item.id}] Waiting ${waitTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        delay *= 2;
      }
    }
  }

  throw lastError || new Error('Content generation failed after all retries');
}

async function updateQueueStatus(
  supabase: any, 
  itemId: string, 
  status: string, 
  metadata?: any
): Promise<void> {
  const update: any = { 
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed') {
    update.completed_at = new Date().toISOString();
    update.result = metadata;
  }

  if (status === 'failed') {
    update.error_message = metadata?.error || 'Unknown error';
    update.last_error_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('content_generation_queue')
    .update(update)
    .eq('id', itemId);

  if (error) {
    console.error(`❌ [Queue Item ${itemId}] Failed to update status:`, error);
    throw error;
  }
}

function isNonRetryableError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';
  const nonRetryablePatterns = [
    'unauthorized',
    'authentication',
    'permission denied',
    'not found',
    'invalid api key',
    'quota exceeded'
  ];

  return nonRetryablePatterns.some(pattern => message.includes(pattern));
}
