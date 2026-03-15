
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from '../shared/cors.ts'

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
    const { action, opportunityId } = body;
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
      case 'enhanced_scan_opportunities':
        return await enhancedScanOpportunities(userId)
      case 'analyze_competitors':
        return await analyzeCompetitors(opportunityId)
      case 'generate_content_payload':
        return await generateContentPayload(opportunityId)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in enhanced-opportunity-hunter:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function enhancedScanOpportunities(userId: string) {
  console.log(`🔍 Enhanced scanning opportunities for user: ${userId}`)
  
  try {
    // Get user's strategy and competitors
    const [strategyResult, competitorsResult] = await Promise.all([
      supabase
        .from('content_strategies')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single(),
      supabase
        .from('company_competitors')
        .select('*')
        .eq('user_id', userId)
    ])

    const strategy = strategyResult.data
    const competitors = competitorsResult.data || []

    if (!strategy) {
      return new Response(
        JSON.stringify({ message: 'No active strategy found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user settings
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

    // Generate enhanced opportunities
    const opportunities = await generateEnhancedOpportunities(
      userId,
      strategy,
      competitors,
      userSettings
    )

    console.log(`✅ Generated ${opportunities.length} enhanced opportunities`)

    return new Response(
      JSON.stringify({ 
        message: `Found ${opportunities.length} new enhanced opportunities`,
        opportunities 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in enhancedScanOpportunities:', error)
    throw error
  }
}

async function generateEnhancedOpportunities(userId: string, strategy: any, competitors: any[], settings: any) {
  const baseKeywords = [
    strategy.main_keyword,
    ...(strategy.content_pillars || [])
  ].filter(Boolean)

  const opportunities = []

  for (const keyword of baseKeywords) {
    if (!keyword) continue

    // Mock SERP analysis (in real implementation, use actual SERP API)
    const serpAnalysis = await mockSerpAnalysis(keyword)
    
    // Analyze competitors for this keyword
    const competitorAnalysis = await analyzeCompetitorsForKeyword(keyword, competitors)
    
    // Determine content format based on search intent
    const contentFormat = determineContentFormat(serpAnalysis.searchIntent, keyword)
    
    // Generate opportunity record
    const opportunity = await createEnhancedOpportunityRecord(
      userId,
      strategy.id,
      keyword,
      serpAnalysis,
      competitorAnalysis,
      contentFormat,
      settings
    )

    if (opportunity) {
      opportunities.push(opportunity)
    }
  }

  return opportunities
}

async function mockSerpAnalysis(keyword: string) {
  // In real implementation, this would call actual SERP APIs
  return {
    searchIntent: ['informational', 'navigational', 'transactional', 'commercial'][Math.floor(Math.random() * 4)],
    searchVolume: Math.floor(Math.random() * 5000) + 500,
    keywordDifficulty: Math.floor(Math.random() * 70) + 10,
    competitionScore: Math.random() * 0.8 + 0.1,
    relatedKeywords: [
      `${keyword} guide`,
      `${keyword} tips`,
      `best ${keyword}`,
      `${keyword} examples`,
      `how to ${keyword}`
    ],
    faqOpportunities: [
      { question: `What is ${keyword}?`, answer: '' },
      { question: `How to use ${keyword}?`, answer: '' },
      { question: `Best practices for ${keyword}?`, answer: '' }
    ],
    suggestedHeadings: [
      `What is ${keyword}?`,
      `Benefits of ${keyword}`,
      `How to implement ${keyword}`,
      `Best practices and tips`,
      `Common mistakes to avoid`,
      'Conclusion'
    ],
    aioScore: Math.floor(Math.random() * 100) + 1,
    isAioFriendly: Math.random() > 0.5
  }
}

async function analyzeCompetitorsForKeyword(keyword: string, competitors: any[]) {
  // Mock competitor analysis (in real implementation, analyze actual SERP results)
  const analysis = competitors.slice(0, 3).map((competitor, index) => ({
    competitor_name: competitor.name,
    competitor_url: competitor.website || '',
    ranking_position: index + 1,
    content_gaps: [
      'Missing detailed examples',
      'Lacks step-by-step guide',
      'No FAQ section'
    ],
    weaknesses: [
      'Outdated information',
      'Poor user experience',
      'Limited visual content'
    ],
    competitive_advantage: `Can outperform ${competitor.name} by providing more comprehensive coverage of ${keyword} with better examples and updated information.`
  }))

  return analysis
}

function determineContentFormat(searchIntent: string, keyword: string) {
  // AI-powered format suggestion logic
  if (keyword.includes('what is') || keyword.includes('definition')) {
    return 'glossary'
  }
  
  if (searchIntent === 'informational' && (keyword.includes('guide') || keyword.includes('how to'))) {
    return 'guide'
  }
  
  if (searchIntent === 'commercial' || searchIntent === 'transactional') {
    return 'article'
  }
  
  return 'blog'
}

async function createEnhancedOpportunityRecord(
  userId: string,
  strategyId: string,
  keyword: string,
  serpAnalysis: any,
  competitorAnalysis: any[],
  contentFormat: string,
  settings: any
) {
  // Calculate enhanced opportunity score
  const opportunityScore = Math.floor(
    (serpAnalysis.searchVolume / 100) * 
    (1 - serpAnalysis.competitionScore) * 
    (serpAnalysis.aioScore / 100) * 
    100
  )

  // Filter based on user preferences
  if (serpAnalysis.searchVolume < settings.min_search_volume || 
      serpAnalysis.keywordDifficulty > settings.max_keyword_difficulty) {
    return null
  }

  // Check for duplicates
  const { data: existingOpp } = await supabase
    .from('content_opportunities')
    .select('id')
    .eq('user_id', userId)
    .ilike('keyword', keyword)
    .in('status', ['new', 'assigned', 'in_progress'])
    .single()

  if (existingOpp) {
    console.log(`Skipping duplicate opportunity: ${keyword}`)
    return null
  }

  try {
    const { data, error } = await supabase
      .from('content_opportunities')
      .insert({
        user_id: userId,
        strategy_id: strategyId,
        keyword,
        search_volume: serpAnalysis.searchVolume,
        keyword_difficulty: serpAnalysis.keywordDifficulty,
        competition_score: serpAnalysis.competitionScore,
        opportunity_score: opportunityScore,
        relevance_score: Math.random() * 0.4 + 0.6,
        content_format: contentFormat,
        content_format_reason: getFormatReason(contentFormat, serpAnalysis.searchIntent),
        status: 'new',
        source: 'enhanced_serp_analysis',
        serp_data: {},
        serp_analysis: serpAnalysis,
        content_gaps: [],
        competitor_analysis: competitorAnalysis,
        competitive_advantage: competitorAnalysis[0]?.competitive_advantage || null,
        suggested_title: `Complete Guide to ${keyword}`,
        suggested_outline: [
          `What is ${keyword}?`,
          `Benefits of ${keyword}`,
          `How to implement ${keyword}`,
          'Best practices and tips'
        ],
        suggested_headings: serpAnalysis.suggestedHeadings,
        faq_opportunities: serpAnalysis.faqOpportunities,
        related_keywords: serpAnalysis.relatedKeywords,
        internal_link_opportunities: [],
        is_aio_friendly: serpAnalysis.isAioFriendly,
        aio_score: serpAnalysis.aioScore,
        search_intent: serpAnalysis.searchIntent,
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
          priority: data.priority,
          has_competitor_analysis: competitorAnalysis.length > 0
        }
      })

    return data
  } catch (error) {
    console.error('Error creating enhanced opportunity record:', error)
    return null
  }
}

function getFormatReason(format: string, intent: string) {
  const reasons = {
    'glossary': `Based on ${intent} search intent, this keyword requires a definition-focused format to capture featured snippets and answer user queries directly.`,
    'blog': `The ${intent} search intent indicates users want comprehensive information, making a blog post the optimal format for engagement.`,
    'guide': `Given the ${intent} intent, users need step-by-step guidance, making a detailed guide format most effective.`,
    'article': `The ${intent} search intent suggests users are in research mode, requiring an in-depth article format.`
  }
  
  return reasons[format as keyof typeof reasons] || reasons['blog']
}

async function analyzeCompetitors(opportunityId: string) {
  // Implementation for competitor analysis
  return new Response(
    JSON.stringify({ competitor_analysis: [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateContentPayload(opportunityId: string) {
  // Implementation for content payload generation
  return new Response(
    JSON.stringify({ payload: {} }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
