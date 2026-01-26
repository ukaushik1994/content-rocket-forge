/**
 * Campaign Intelligence Tools for AI Chat
 * Provides comprehensive campaign awareness including:
 * - Real-time generation queue status
 * - Campaign performance metrics
 * - Content inventory by campaign
 * - Actionable triggers for generation/retry
 */

export interface CampaignIntelligence {
  campaign: {
    id: string;
    name: string;
    status: string;
    original_idea: string;
    objective: string | null;
    target_audience: string | null;
    timeline: string | null;
    solution_name: string | null;
    created_at: string;
    updated_at: string;
  };
  queueStatus: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    failedItems: Array<{
      id: string;
      asset_type: string;
      error_message: string;
      retry_count: number;
    }>;
    estimatedCompletionMinutes: number | null;
  };
  contentInventory: {
    total: number;
    byStatus: Record<string, number>;
    byFormat: Record<string, number>;
    items: Array<{
      id: string;
      title: string;
      content_type: string;
      status: string;
      word_count: number | null;
      seo_score: number | null;
      published_url: string | null;
      created_at: string;
    }>;
  };
  performance: {
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    engagementRate: number;
    byContent: Array<{
      content_id: string;
      title: string;
      views: number;
      clicks: number;
      conversions: number;
    }>;
  };
  timelineHealth: {
    status: 'on_track' | 'at_risk' | 'overdue' | 'unknown';
    daysRemaining: number | null;
    completionPercentage: number;
    blockers: string[];
  };
}

export const CAMPAIGN_INTELLIGENCE_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_campaign_intelligence",
      description: "Fetch comprehensive campaign intelligence including queue status, content inventory, and performance metrics. Use this when user asks about campaign status, progress, performance, or 'how is my campaign doing'. This is the primary tool for campaign awareness.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: {
            type: "string",
            description: "Specific campaign UUID. If not provided, returns data for all campaigns."
          },
          campaign_name: {
            type: "string",
            description: "Filter by campaign name (case-insensitive partial match)"
          },
          include_queue_status: {
            type: "boolean",
            default: true,
            description: "Include content generation queue status (pending, processing, completed, failed)"
          },
          include_performance: {
            type: "boolean",
            default: true,
            description: "Include campaign performance metrics (views, clicks, conversions)"
          },
          include_content_inventory: {
            type: "boolean",
            default: true,
            description: "Include list of content items for this campaign"
          },
          limit: {
            type: "number",
            default: 5,
            description: "Number of campaigns to return (default 5, max 20)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_queue_status",
      description: "Fetch real-time content generation queue status for a specific campaign. Shows pending, processing, completed, and failed items with error details. Use when user asks about 'generation progress', 'queue status', or 'what's being generated'.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: {
            type: "string",
            description: "Campaign UUID to get queue status for"
          },
          include_failed_details: {
            type: "boolean",
            default: true,
            description: "Include detailed error messages for failed items"
          }
        },
        required: ["campaign_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_campaign_content",
      description: "Fetch content items belonging to a specific campaign with filtering options. Use when user asks to 'show campaign content', 'list generated content', or 'what content is in my campaign'.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: {
            type: "string",
            description: "Campaign UUID to get content for"
          },
          status_filter: {
            type: "string",
            enum: ["all", "draft", "published", "archived", "failed"],
            default: "all",
            description: "Filter content by status"
          },
          include_performance: {
            type: "boolean",
            default: false,
            description: "Include performance metrics for each content item"
          },
          limit: {
            type: "number",
            default: 20,
            description: "Number of content items to return"
          }
        },
        required: ["campaign_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trigger_content_generation",
      description: "Start or resume content generation for a campaign. Populates the generation queue and triggers the processing. Use when user says 'generate content', 'start generation', 'create content for campaign', or 'resume generation'.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: {
            type: "string",
            description: "Campaign UUID to generate content for"
          },
          asset_types: {
            type: "array",
            items: { type: "string" },
            description: "Specific asset types to generate (e.g., ['blog_post', 'social_media']). If empty, generates all pending."
          }
        },
        required: ["campaign_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "retry_failed_content",
      description: "Retry failed content generation items for a campaign. Resets failed items to pending and re-triggers processing. Use when user says 'retry failed', 'regenerate failed items', or 'try again'.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: {
            type: "string",
            description: "Campaign UUID to retry failed items for"
          },
          item_ids: {
            type: "array",
            items: { type: "string" },
            description: "Specific queue item IDs to retry. If empty, retries all failed items."
          }
        },
        required: ["campaign_id"]
      }
    }
  }
];

/**
 * Execute campaign intelligence tool calls
 */
export async function executeCampaignIntelligenceTool(
  toolName: string,
  toolArgs: any,
  supabase: any,
  userId: string
): Promise<any> {
  const executionStart = Date.now();
  console.log(`[CAMPAIGN-TOOL] ${toolName} | user: ${userId} | args:`, JSON.stringify(toolArgs));

  try {
    switch (toolName) {
      case 'get_campaign_intelligence':
        return await getCampaignIntelligence(supabase, userId, toolArgs);
      
      case 'get_queue_status':
        return await getQueueStatus(supabase, userId, toolArgs);
      
      case 'get_campaign_content':
        return await getCampaignContent(supabase, userId, toolArgs);
      
      case 'trigger_content_generation':
        return await triggerContentGeneration(supabase, userId, toolArgs);
      
      case 'retry_failed_content':
        return await retryFailedContent(supabase, userId, toolArgs);
      
      default:
        console.error(`[CAMPAIGN-TOOL] Unknown tool: ${toolName}`);
        return { error: `Unknown campaign tool: ${toolName}` };
    }
  } catch (error) {
    const duration = Date.now() - executionStart;
    console.error(`[CAMPAIGN-TOOL] ${toolName} | FAILED | time: ${duration}ms | error:`, error);
    return { error: String(error) };
  }
}

/**
 * Get comprehensive campaign intelligence
 */
async function getCampaignIntelligence(supabase: any, userId: string, args: any): Promise<any> {
  const {
    campaign_id,
    campaign_name,
    include_queue_status = true,
    include_performance = true,
    include_content_inventory = true,
    limit = 5
  } = args;

  // Fetch campaigns
  let campaignQuery = supabase
    .from('campaigns')
    .select(`
      id, name, status, original_idea, objective, target_audience, 
      timeline, created_at, updated_at,
      solutions (id, name)
    `)
    .eq('user_id', userId);

  if (campaign_id) {
    campaignQuery = campaignQuery.eq('id', campaign_id);
  }
  if (campaign_name) {
    campaignQuery = campaignQuery.ilike('name', `%${campaign_name}%`);
  }

  const { data: campaigns, error: campaignError } = await campaignQuery
    .order('updated_at', { ascending: false })
    .limit(Math.min(limit, 20));

  if (campaignError) {
    console.error('[CAMPAIGN-TOOL] Error fetching campaigns:', campaignError);
    return { error: campaignError.message };
  }

  if (!campaigns || campaigns.length === 0) {
    return {
      campaigns: [],
      message: campaign_name 
        ? `No campaigns found matching "${campaign_name}"`
        : "No campaigns found. Create a campaign to get started."
    };
  }

  // Enrich each campaign with additional data
  const enrichedCampaigns = await Promise.all(
    campaigns.map(async (campaign: any) => {
      const result: any = {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          original_idea: campaign.original_idea,
          objective: campaign.objective,
          target_audience: campaign.target_audience,
          timeline: campaign.timeline,
          solution_name: campaign.solutions?.name || null,
          created_at: campaign.created_at,
          updated_at: campaign.updated_at
        }
      };

      // Queue Status
      if (include_queue_status) {
        const queueData = await getQueueStatusInternal(supabase, campaign.id);
        result.queueStatus = queueData;
      }

      // Content Inventory
      if (include_content_inventory) {
        const contentData = await getContentInventoryInternal(supabase, userId, campaign.id);
        result.contentInventory = contentData;
      }

      // Performance Metrics
      if (include_performance) {
        const perfData = await getPerformanceInternal(supabase, userId, campaign.id);
        result.performance = perfData;
      }

      // Timeline Health
      result.timelineHealth = calculateTimelineHealth(campaign, result.queueStatus, result.contentInventory);

      return result;
    })
  );

  return {
    campaigns: enrichedCampaigns,
    summary: {
      totalCampaigns: enrichedCampaigns.length,
      activeGenerations: enrichedCampaigns.reduce((acc: number, c: any) => 
        acc + (c.queueStatus?.processing || 0), 0),
      pendingGenerations: enrichedCampaigns.reduce((acc: number, c: any) => 
        acc + (c.queueStatus?.pending || 0), 0),
      failedGenerations: enrichedCampaigns.reduce((acc: number, c: any) => 
        acc + (c.queueStatus?.failed || 0), 0),
      totalContent: enrichedCampaigns.reduce((acc: number, c: any) => 
        acc + (c.contentInventory?.total || 0), 0)
    }
  };
}

/**
 * Get queue status for a specific campaign
 */
async function getQueueStatus(supabase: any, userId: string, args: any): Promise<any> {
  const { campaign_id, include_failed_details = true } = args;

  // Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, name, user_id')
    .eq('id', campaign_id)
    .eq('user_id', userId)
    .single();

  if (campaignError || !campaign) {
    return { error: 'Campaign not found or access denied' };
  }

  const queueData = await getQueueStatusInternal(supabase, campaign_id, include_failed_details);
  
  return {
    campaignId: campaign_id,
    campaignName: campaign.name,
    ...queueData
  };
}

/**
 * Internal queue status fetcher
 */
async function getQueueStatusInternal(supabase: any, campaignId: string, includeFailedDetails = true): Promise<any> {
  const { data: queueItems, error } = await supabase
    .from('content_generation_queue')
    .select('id, status, asset_type, error_message, retry_count, created_at, updated_at')
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('[CAMPAIGN-TOOL] Error fetching queue:', error);
    return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0, failedItems: [] };
  }

  const items = queueItems || [];
  const statusCounts = {
    pending: items.filter((i: any) => i.status === 'pending').length,
    processing: items.filter((i: any) => i.status === 'processing').length,
    completed: items.filter((i: any) => i.status === 'completed').length,
    failed: items.filter((i: any) => i.status === 'failed').length
  };

  const failedItems = includeFailedDetails
    ? items
        .filter((i: any) => i.status === 'failed')
        .map((i: any) => ({
          id: i.id,
          asset_type: i.asset_type,
          error_message: i.error_message,
          retry_count: i.retry_count
        }))
    : [];

  // Estimate completion time (rough: 30 seconds per item in queue)
  const itemsRemaining = statusCounts.pending + statusCounts.processing;
  const estimatedCompletionMinutes = itemsRemaining > 0 
    ? Math.ceil((itemsRemaining * 30) / 60) 
    : null;

  return {
    total: items.length,
    ...statusCounts,
    failedItems,
    estimatedCompletionMinutes,
    processingDetails: items
      .filter((i: any) => i.status === 'processing')
      .map((i: any) => ({ id: i.id, asset_type: i.asset_type }))
  };
}

/**
 * Get content items for a campaign
 */
async function getCampaignContent(supabase: any, userId: string, args: any): Promise<any> {
  const { campaign_id, status_filter = 'all', include_performance = false, limit = 20 } = args;

  // Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, name, user_id')
    .eq('id', campaign_id)
    .eq('user_id', userId)
    .single();

  if (campaignError || !campaign) {
    return { error: 'Campaign not found or access denied' };
  }

  let query = supabase
    .from('content_items')
    .select('id, title, content_type, status, word_count, seo_score, published_url, created_at')
    .eq('user_id', userId)
    .eq('campaign_id', campaign_id);

  if (status_filter !== 'all') {
    query = query.eq('status', status_filter);
  }

  const { data: items, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[CAMPAIGN-TOOL] Error fetching content:', error);
    return { error: error.message };
  }

  const contentItems = items || [];

  // Group by status and format
  const byStatus: Record<string, number> = {};
  const byFormat: Record<string, number> = {};
  
  contentItems.forEach((item: any) => {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byFormat[item.content_type] = (byFormat[item.content_type] || 0) + 1;
  });

  return {
    campaignId: campaign_id,
    campaignName: campaign.name,
    total: contentItems.length,
    byStatus,
    byFormat,
    items: contentItems
  };
}

/**
 * Internal content inventory fetcher
 */
async function getContentInventoryInternal(supabase: any, userId: string, campaignId: string): Promise<any> {
  const { data: items, error } = await supabase
    .from('content_items')
    .select('id, title, content_type, status, word_count, seo_score, published_url, created_at')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[CAMPAIGN-TOOL] Error fetching content inventory:', error);
    return { total: 0, byStatus: {}, byFormat: {}, items: [] };
  }

  const contentItems = items || [];
  const byStatus: Record<string, number> = {};
  const byFormat: Record<string, number> = {};

  contentItems.forEach((item: any) => {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byFormat[item.content_type] = (byFormat[item.content_type] || 0) + 1;
  });

  return {
    total: contentItems.length,
    byStatus,
    byFormat,
    items: contentItems.slice(0, 10) // Only return first 10 for summary
  };
}

/**
 * Internal performance fetcher
 */
async function getPerformanceInternal(supabase: any, userId: string, campaignId: string): Promise<any> {
  const { data: analytics, error } = await supabase
    .from('campaign_analytics')
    .select('content_id, views, clicks, conversions, content_items (title)')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId);

  if (error || !analytics || analytics.length === 0) {
    return {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      engagementRate: 0,
      byContent: []
    };
  }

  const totalViews = analytics.reduce((acc: number, a: any) => acc + (a.views || 0), 0);
  const totalClicks = analytics.reduce((acc: number, a: any) => acc + (a.clicks || 0), 0);
  const totalConversions = analytics.reduce((acc: number, a: any) => acc + (a.conversions || 0), 0);
  const engagementRate = totalViews > 0 ? ((totalClicks / totalViews) * 100) : 0;

  return {
    totalViews,
    totalClicks,
    totalConversions,
    engagementRate: Math.round(engagementRate * 100) / 100,
    byContent: analytics.slice(0, 5).map((a: any) => ({
      content_id: a.content_id,
      title: a.content_items?.title || 'Unknown',
      views: a.views || 0,
      clicks: a.clicks || 0,
      conversions: a.conversions || 0
    }))
  };
}

/**
 * Calculate timeline health
 */
function calculateTimelineHealth(campaign: any, queueStatus: any, contentInventory: any): any {
  const blockers: string[] = [];
  let status: 'on_track' | 'at_risk' | 'overdue' | 'unknown' = 'unknown';
  let daysRemaining: number | null = null;

  // Check for failed items
  if (queueStatus?.failed > 0) {
    blockers.push(`${queueStatus.failed} content items failed generation`);
  }

  // Check pending items
  if (queueStatus?.pending > 5) {
    blockers.push(`${queueStatus.pending} items still pending generation`);
  }

  // Calculate completion percentage
  const totalExpected = (queueStatus?.total || 0) + (contentInventory?.total || 0);
  const completed = contentInventory?.total || 0;
  const completionPercentage = totalExpected > 0 
    ? Math.round((completed / totalExpected) * 100) 
    : 0;

  // Determine status based on blockers and completion
  if (blockers.length === 0 && completionPercentage >= 80) {
    status = 'on_track';
  } else if (blockers.length > 0 || completionPercentage < 50) {
    status = 'at_risk';
  } else if (queueStatus?.failed > queueStatus?.completed) {
    status = 'overdue';
  }

  return {
    status,
    daysRemaining,
    completionPercentage,
    blockers
  };
}

/**
 * Trigger content generation for a campaign
 */
async function triggerContentGeneration(supabase: any, userId: string, args: any): Promise<any> {
  const { campaign_id, asset_types } = args;

  // Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, name, user_id, selected_strategy')
    .eq('id', campaign_id)
    .eq('user_id', userId)
    .single();

  if (campaignError || !campaign) {
    return { error: 'Campaign not found or access denied' };
  }

  // Check if there's already items in queue
  const { data: existingQueue } = await supabase
    .from('content_generation_queue')
    .select('id, status')
    .eq('campaign_id', campaign_id)
    .in('status', ['pending', 'processing']);

  if (existingQueue && existingQueue.length > 0) {
    return {
      success: false,
      message: `Campaign already has ${existingQueue.length} items in queue (pending/processing). Wait for completion or retry failed items.`,
      queueCount: existingQueue.length
    };
  }

  // Get strategy assets from campaign
  const strategy = campaign.selected_strategy;
  if (!strategy || !strategy.assets) {
    return {
      success: false,
      message: "Campaign has no strategy or assets defined. Please select a strategy first."
    };
  }

  // Filter assets if specific types requested
  let assetsToGenerate = strategy.assets || [];
  if (asset_types && asset_types.length > 0) {
    assetsToGenerate = assetsToGenerate.filter((a: any) => 
      asset_types.includes(a.type) || asset_types.includes(a.asset_type)
    );
  }

  if (assetsToGenerate.length === 0) {
    return {
      success: false,
      message: "No matching assets found to generate."
    };
  }

  // Create queue items
  const queueItems = assetsToGenerate.map((asset: any, index: number) => ({
    campaign_id: campaign_id,
    asset_type: asset.type || asset.asset_type || 'content',
    asset_data: asset,
    status: 'pending',
    priority: index,
    retry_count: 0
  }));

  const { data: insertedItems, error: insertError } = await supabase
    .from('content_generation_queue')
    .insert(queueItems)
    .select('id');

  if (insertError) {
    console.error('[CAMPAIGN-TOOL] Error creating queue items:', insertError);
    return { error: insertError.message };
  }

  // Trigger the queue processor (non-blocking)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (supabaseUrl && supabaseKey) {
    fetch(`${supabaseUrl}/functions/v1/process-content-queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign_id })
    }).catch(err => console.error('[CAMPAIGN-TOOL] Queue trigger error:', err));
  }

  return {
    success: true,
    message: `Started generation for ${insertedItems?.length || 0} content items`,
    itemsQueued: insertedItems?.length || 0,
    campaignName: campaign.name
  };
}

/**
 * Retry failed content generation items
 */
async function retryFailedContent(supabase: any, userId: string, args: any): Promise<any> {
  const { campaign_id, item_ids } = args;

  // Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, name, user_id')
    .eq('id', campaign_id)
    .eq('user_id', userId)
    .single();

  if (campaignError || !campaign) {
    return { error: 'Campaign not found or access denied' };
  }

  // Get failed items
  let failedQuery = supabase
    .from('content_generation_queue')
    .select('id')
    .eq('campaign_id', campaign_id)
    .eq('status', 'failed');

  if (item_ids && item_ids.length > 0) {
    failedQuery = failedQuery.in('id', item_ids);
  }

  const { data: failedItems, error: fetchError } = await failedQuery;

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!failedItems || failedItems.length === 0) {
    return {
      success: false,
      message: "No failed items found to retry."
    };
  }

  // Reset failed items to pending
  const itemIdsToRetry = failedItems.map((i: any) => i.id);
  const { error: updateError } = await supabase
    .from('content_generation_queue')
    .update({ 
      status: 'pending', 
      error_message: null,
      retry_count: 0,
      updated_at: new Date().toISOString()
    })
    .in('id', itemIdsToRetry);

  if (updateError) {
    return { error: updateError.message };
  }

  // Trigger the queue processor
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (supabaseUrl && supabaseKey) {
    fetch(`${supabaseUrl}/functions/v1/process-content-queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign_id })
    }).catch(err => console.error('[CAMPAIGN-TOOL] Queue trigger error:', err));
  }

  return {
    success: true,
    message: `Retrying ${itemIdsToRetry.length} failed items`,
    itemsRetried: itemIdsToRetry.length,
    campaignName: campaign.name
  };
}
