
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
    const { action, userId, strategiesData } = await req.json()
    
    switch (action) {
      case 'scan_opportunities':
        return await scanForOpportunities(userId, strategiesData)
      case 'get_opportunities':
        return await getOpportunities(userId)
      case 'update_opportunity':
        return await updateOpportunityStatus(req)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in opportunity-hunter:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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

      // Call SERP analysis for each keyword
      const serpResponse = await supabase.functions.invoke('serp-analysis', {
        body: { keyword, location: 'United States' }
      })

      if (serpResponse.data) {
        const serpData = serpResponse.data
        
        // Generate related opportunities from PAA and related searches
        const relatedQueries = [
          ...(serpData.relatedSearches || []),
          ...(serpData.peopleAlsoAsk || []).map((paa: any) => paa.question)
        ]

        for (const query of relatedQueries.slice(0, 5)) {
          if (await isViableOpportunity(query, userSettings, existingContent)) {
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
  // Calculate opportunity metrics
  const searchVolume = Math.floor(Math.random() * 5000) + 500 // Mock data
  const keywordDifficulty = Math.floor(Math.random() * 70) + 10
  const competitionScore = Math.random() * 0.8 + 0.1
  const opportunityScore = Math.floor((searchVolume / 100) * (1 - competitionScore) * 100)

  // Filter based on user preferences
  if (searchVolume < settings.min_search_volume || keywordDifficulty > settings.max_keyword_difficulty) {
    return null
  }

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
        relevance_score: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
        content_format: settings.preferred_content_formats[0] || 'blog',
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
        is_aio_friendly: Math.random() > 0.5,
        trend_direction: ['growing', 'stable', 'declining'][Math.floor(Math.random() * 3)],
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

async function updateOpportunityStatus(req: Request) {
  const { opportunityId, status, notes } = await req.json()
  
  const { data, error } = await supabase
    .from('content_opportunities')
    .update({ 
      status, 
      notes,
      last_updated: new Date().toISOString() 
    })
    .eq('id', opportunityId)
    .select()
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ opportunity: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
