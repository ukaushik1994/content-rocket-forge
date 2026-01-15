
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await req.json();
    const { action, strategiesData } = body;
    const userIdFromBody = body.userId ?? body.user_id;

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    if (userIdFromBody && userIdFromBody !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    switch (action) {
      case 'scan_opportunities':
        return await scanForOpportunities(userId, strategiesData)
      case 'get_opportunities':
        return await getOpportunities(userId)
      case 'update_opportunity':
        return await updateOpportunityStatus(req, userId)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in opportunity-hunter:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function scanForOpportunities(userId: string, strategiesData?: any) {
  console.log(`🔍 Scanning opportunities for user: ${userId}`)
  
  try {
    // Get user's active strategy and existing content
    const { data: strategy } = await supabase
      .from('content_strategies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!strategy) {
      return new Response(
        JSON.stringify({ message: 'No active strategy found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get existing content to avoid duplicates
    const { data: existingContent } = await supabase
      .from('content_items')
      .select('title, metadata')
      .eq('user_id', userId)

    // Get user's opportunity settings
    const { data: settings } = await supabase
      .from('user_opportunity_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    const userSettings = settings || {
      min_search_volume: 100,
      max_keyword_difficulty: 50,
      relevance_threshold: 0.6,
      aio_friendly_only: false,
      preferred_content_formats: ['blog', 'guide', 'faq']
    }

    // Generate keyword variations based on strategy
    const baseKeywords = [
      strategy.main_keyword,
      ...(strategy.content_pillars || [])
    ].filter(Boolean)

    const opportunities = []

    for (const keyword of baseKeywords) {
      if (!keyword) continue

      // Call SERP analysis for each keyword using unified API Proxy
      const serpResponse = await supabase.functions.invoke('api-proxy', {
        body: { 
          service: 'serp',
          endpoint: 'analyze',
          apiKey: Deno.env.get('SERP_API_KEY') ?? '',
          params: { keyword, location: 'us', num: 10, device: 'desktop' }
        }
      })

      if (serpResponse.data) {
        const serpData = serpResponse.data
        
        // Generate related opportunities from PAA and related searches
        const relatedQueries = [
          ...(serpData.relatedSearches || []),
          ...(serpData.peopleAlsoAsk || []).map((paa: any) => paa.question)
        ]

        for (const query of relatedQueries.slice(0, 5)) {
          if (await isViableOpportunity(query, userSettings, existingContent || [])) {
            const opportunity = await createOpportunityRecord(userId, strategy.id, query, serpData, userSettings)
            if (opportunity) {
              opportunities.push(opportunity)
            }
          }
        }
      }
    }

    console.log(`✅ Found ${opportunities.length} new opportunities`)

    return new Response(
      JSON.stringify({ 
        message: `Found ${opportunities.length} new opportunities`,
        opportunities 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scanForOpportunities:', error)
    throw error
  }
}

async function isViableOpportunity(query: string, settings: any, existingContent: any[]) {
  // Check if we already have content for this topic
  const isDuplicate = existingContent.some(content => 
    content.title.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes(content.title.toLowerCase())
  )

  if (isDuplicate) return false

  // Basic relevance check (simplified)
  const relevanceScore = Math.random() // In real implementation, use AI to score relevance
  return relevanceScore >= settings.relevance_threshold
}

async function createOpportunityRecord(userId: string, strategyId: string, keyword: string, serpData: any, settings: any) {
  // Calculate opportunity metrics from SERP data
  const searchVolume = Number(serpData?.searchVolume) || 0
  const keywordDifficulty = Number(serpData?.keywordDifficulty) || 0
  const competitionScore = typeof serpData?.competitionScore === 'number' ? serpData.competitionScore : 0

  // If we don't have required metrics, skip creating an opportunity
  if (!searchVolume || !Number.isFinite(keywordDifficulty)) {
    return null
  }

  // Filter based on user preferences
  if (searchVolume < (settings.min_search_volume ?? 0) || keywordDifficulty > (settings.max_keyword_difficulty ?? 100)) {
    return null
  }

  // Compute opportunity score deterministically
  const ctrBaseline = 0.05 // 5% baseline CTR
  const estimatedImpressions = Math.round(searchVolume * ctrBaseline)
  const opportunityScore = Math.max(0, Math.min(1000, Math.round(estimatedImpressions * (1 - competitionScore))))

  try {
    const { data, error } = await supabase
      .from('content_opportunities')
      .insert({
        user_id: userId,
        strategy_id: strategyId,
        keyword,
        search_volume: searchVolume,
        keyword_difficulty: keywordDifficulty,
        competition_score: competitionScore,
        opportunity_score: opportunityScore,
        relevance_score: Math.max(0, Math.min(1, 1 - competitionScore)),
        content_format: (settings.preferred_content_formats && settings.preferred_content_formats[0]) || 'blog',
        status: 'new',
        source: 'serp_analysis',
        serp_data: serpData || {},
        content_gaps: [],
        suggested_title: `How to ${keyword}`,
        suggested_outline: [
          `What is ${keyword}?`,
          `Benefits of ${keyword}`,
          `How to implement ${keyword}`,
          'Best practices and tips'
        ],
        is_aio_friendly: false,
        trend_direction: 'stable',
        priority: opportunityScore > 500 ? 'high' : opportunityScore > 200 ? 'medium' : 'low'
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase
      .from('opportunity_notifications')
      .insert({
        user_id: userId,
        opportunity_id: data.id,
        notification_type: 'in_app',
        status: 'pending',
        metadata: {
          keyword,
          opportunity_score: opportunityScore,
          priority: data.priority
        }
      })

    return data
  } catch (error) {
    console.error('Error creating opportunity record:', error)
    return null
  }
}

async function getOpportunities(userId: string) {
  const { data, error } = await supabase
    .from('content_opportunities')
    .select(`
      *,
      opportunity_briefs (*)
    `)
    .eq('user_id', userId)
    .order('detected_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ opportunities: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateOpportunityStatus(req: Request, userId: string) {
  const { opportunityId, status, notes } = await req.json()
  
  const { data, error } = await supabase
    .from('content_opportunities')
    .update({ 
      status, 
      notes,
      last_updated: new Date().toISOString() 
    })
    .eq('id', opportunityId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ opportunity: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
