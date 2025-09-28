import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from '../shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../shared/errors.ts';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, keyword, location = 'United States' } = await req.json();
    
    if (!action) {
      return createErrorResponse('Action is required', 400, 'serp-historical-tracker', 'missing-action');
    }

    console.log(`📈 SERP Historical Tracker: ${action} for keyword "${keyword}"`);

    switch (action) {
      case 'track_daily':
        return await trackDailySnapshot(keyword, location);
      case 'get_history':
        return await getKeywordHistory(keyword, location);
      case 'get_position_changes':
        return await getPositionChanges(keyword, location);
      case 'create_alert':
        return await createMonitoringAlert(req);
      default:
        return createErrorResponse(`Unknown action: ${action}`, 400, 'serp-historical-tracker', 'invalid-action');
    }

  } catch (error) {
    console.error('SERP Historical Tracker error:', error);
    return createErrorResponse(
      `Historical tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'serp-historical-tracker',
      'tracking-failed'
    );
  }
});

async function trackDailySnapshot(keyword: string, location: string): Promise<Response> {
  if (!keyword) {
    throw new Error('Keyword is required for daily tracking');
  }

  console.log(`📊 Creating daily SERP snapshot for "${keyword}" in ${location}`);

  // Get current SERP data (this would typically call the SERP API)
  const serpApiKey = Deno.env.get('SERP_API_KEY');
  if (!serpApiKey) {
    throw new Error('SERP API key not configured');
  }

  // Call SerpAPI for current SERP data
  const serpApiUrl = new URL('https://serpapi.com/search');
  serpApiUrl.searchParams.set('engine', 'google');
  serpApiUrl.searchParams.set('q', keyword);
  serpApiUrl.searchParams.set('location', location);
  serpApiUrl.searchParams.set('num', '10');
  serpApiUrl.searchParams.set('api_key', serpApiKey);

  const response = await fetch(serpApiUrl.toString());
  
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status}`);
  }

  const serpData = await response.json();
  
  if (serpData.error) {
    throw new Error(`SerpAPI error: ${serpData.error}`);
  }

  // Extract metrics and top results
  const searchVolume = null; // Not available from basic SerpAPI
  const totalResults = serpData.search_information?.total_results || 0;
  const competitionScore = serpData.ads ? Math.min(serpData.ads.length / 10, 1) : 0;
  
  const top10Results = (serpData.organic_results || []).slice(0, 10).map((result: any, index: number) => ({
    position: index + 1,
    title: result.title,
    url: result.link,
    snippet: result.snippet || '',
    domain: result.displayed_link || new URL(result.link).hostname
  }));

  const serpFeatures = {
    hasAds: !!(serpData.ads && serpData.ads.length > 0),
    hasAnswerBox: !!serpData.answer_box,
    hasKnowledgeGraph: !!serpData.knowledge_graph,
    hasFeaturedSnippet: !!serpData.answer_box,
    hasRelatedQuestions: !!(serpData.related_questions && serpData.related_questions.length > 0),
    hasImages: !!(serpData.images_results && serpData.images_results.length > 0),
    hasVideos: !!(serpData.video_results && serpData.video_results.length > 0)
  };

  // Store in historical tracking table
  const { data: trackingData, error: trackingError } = await supabase
    .from('serp_tracking_history')
    .insert({
      keyword,
      location,
      search_volume: searchVolume,
      competition_score: competitionScore,
      total_results: totalResults,
      serp_features: serpFeatures,
      top_10_results: top10Results
    })
    .select()
    .single();

  if (trackingError) {
    throw new Error(`Failed to store tracking data: ${trackingError.message}`);
  }

  // Store individual position data
  if (top10Results.length > 0) {
    const positionData = top10Results.map((result: any) => ({
      tracking_id: trackingData.id,
      url: result.url,
      domain: result.domain,
      title: result.title,
      snippet: result.snippet,
      position: result.position,
      previous_position: null // Will be updated by trigger
    }));

    const { error: positionError } = await supabase
      .from('keyword_position_history')
      .insert(positionData);

    if (positionError) {
      console.error('Failed to store position data:', positionError);
    }
  }

  return createSuccessResponse({
    message: 'Daily SERP snapshot created successfully',
    trackingId: trackingData.id,
    keyword,
    location,
    results: top10Results.length,
    serpFeatures
  });
}

async function getKeywordHistory(keyword: string, location: string): Promise<Response> {
  if (!keyword) {
    throw new Error('Keyword is required to get history');
  }

  console.log(`📈 Getting SERP history for "${keyword}" in ${location}`);

  const { data: historyData, error } = await supabase
    .from('serp_tracking_history')
    .select(`
      *,
      keyword_position_history (
        url,
        domain,
        position,
        previous_position,
        position_change,
        created_at
      )
    `)
    .eq('keyword', keyword)
    .eq('location', location)
    .order('search_date', { ascending: false })
    .limit(30); // Last 30 days

  if (error) {
    throw new Error(`Failed to get history: ${error.message}`);
  }

  // Calculate trends and insights
  const trends = calculateTrends(historyData);

  return createSuccessResponse({
    keyword,
    location,
    history: historyData,
    trends,
    totalSnapshots: historyData.length
  });
}

async function getPositionChanges(keyword: string, location: string): Promise<Response> {
  if (!keyword) {
    throw new Error('Keyword is required to get position changes');
  }

  console.log(`🔄 Getting position changes for "${keyword}" in ${location}`);

  // Get position changes for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: positionChanges, error } = await supabase
    .from('keyword_position_history')
    .select(`
      *,
      serp_tracking_history!inner (
        keyword,
        location,
        search_date
      )
    `)
    .eq('serp_tracking_history.keyword', keyword)
    .eq('serp_tracking_history.location', location)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get position changes: ${error.message}`);
  }

  // Group by URL and calculate significant changes
  const urlChanges = groupPositionChangesByUrl(positionChanges);

  return createSuccessResponse({
    keyword,
    location,
    positionChanges: urlChanges,
    totalChanges: positionChanges.length
  });
}

async function createMonitoringAlert(req: Request): Promise<Response> {
  const body = await req.json();
  const { keyword, alert_type, threshold_value, user_id } = body;

  if (!keyword || !alert_type || !user_id) {
    throw new Error('keyword, alert_type, and user_id are required');
  }

  const { data: alertData, error } = await supabase
    .from('serp_monitoring_alerts')
    .insert({
      user_id,
      keyword,
      alert_type,
      threshold_value,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return createSuccessResponse({
    message: 'Monitoring alert created successfully',
    alert: alertData
  });
}

function calculateTrends(historyData: any[]): any {
  if (historyData.length < 2) {
    return { trend: 'insufficient_data' };
  }

  const latest = historyData[0];
  const previous = historyData[1];

  const trends = {
    searchVolume: {
      current: latest.search_volume,
      previous: previous.search_volume,
      change: latest.search_volume && previous.search_volume 
        ? latest.search_volume - previous.search_volume 
        : null
    },
    competitionScore: {
      current: latest.competition_score,
      previous: previous.competition_score,
      change: latest.competition_score && previous.competition_score
        ? latest.competition_score - previous.competition_score
        : null
    },
    totalResults: {
      current: latest.total_results,
      previous: previous.total_results,
      change: latest.total_results && previous.total_results
        ? latest.total_results - previous.total_results
        : null
    },
    serpFeatures: {
      added: [] as string[],
      removed: [] as string[]
    }
  };

  // Analyze SERP feature changes
  if (latest.serp_features && previous.serp_features) {
    for (const [feature, currentValue] of Object.entries(latest.serp_features)) {
      const previousValue = (previous.serp_features as any)[feature];
      if (currentValue && !previousValue) {
        trends.serpFeatures.added.push(feature);
      } else if (!currentValue && previousValue) {
        trends.serpFeatures.removed.push(feature);
      }
    }
  }

  return trends;
}

function groupPositionChangesByUrl(positionChanges: any[]): any[] {
  const urlMap = new Map();

  positionChanges.forEach(change => {
    if (!urlMap.has(change.url)) {
      urlMap.set(change.url, {
        url: change.url,
        domain: change.domain,
        title: change.title,
        changes: []
      });
    }
    urlMap.get(change.url).changes.push({
      date: change.created_at,
      position: change.position,
      previousPosition: change.previous_position,
      positionChange: change.position_change
    });
  });

  return Array.from(urlMap.values());
}