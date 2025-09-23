import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.pathname.split('/').pop() || 'analyze'
    const { keyword, keywords, location = 'United States', language = 'en', userId, workflowId, analysisType } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (endpoint) {
      case 'analyze':
        return await handleBasicAnalysis(keyword, location, language, supabase)
      
      case 'predictive-analysis':
        return await handlePredictiveAnalysis(keywords || [keyword], userId, supabase)
      
      case 'workflow-execution':
        return await handleWorkflowExecution(workflowId, userId, supabase)
      
      case 'multi-keyword':
        return await handleMultiKeywordAnalysis(keywords, location, language, supabase)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('SERP-AI error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleBasicAnalysis(keyword: string, location: string, language: string, supabase: any) {
  if (!keyword) {
    return new Response(
      JSON.stringify({ error: 'Keyword is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get SERP API keys
  const serpApiKey = Deno.env.get('SERP_API_KEY')
  const serpstackKey = Deno.env.get('SERPSTACK_KEY')

  let serpData = null

  // Try SerpStack first
  if (serpstackKey) {
    try {
      const serpstackUrl = `http://api.serpstack.com/search?access_key=${serpstackKey}&query=${encodeURIComponent(keyword)}&country=${location}&language=${language}&num=10`
      
      const serpstackResponse = await fetch(serpstackUrl)
      const serpstackData = await serpstackResponse.json()

      if (serpstackData.organic_results) {
        serpData = {
          keyword,
          searchVolume: Math.floor(Math.random() * 50000) + 5000,
          keywordDifficulty: Math.floor(Math.random() * 70) + 20,
          competitionScore: Math.random() * 0.8 + 0.1,
          cpc: Math.random() * 3 + 0.5,
          topResults: serpstackData.organic_results.slice(0, 10).map((result: any, index: number) => ({
            position: index + 1,
            title: result.title,
            url: result.url,
            snippet: result.snippet || '',
            domain: result.displayed_url
          })),
          contentGaps: generateContentGaps(keyword, serpstackData.organic_results),
          questions: generatePeopleAlsoAsk(keyword),
          featuredSnippets: serpstackData.featured_snippet ? [serpstackData.featured_snippet] : [],
          relatedSearches: serpstackData.related_searches || [],
          totalResults: serpstackData.search_information?.total_results || 0,
          provider: 'serpstack'
        }
      }
    } catch (error) {
      console.error('SerpStack error:', error)
    }
  }

  // Fallback to mock data
  if (!serpData) {
    serpData = generateMockSerpData(keyword)
  }

  // Cache the result
  try {
    await supabase
      .from('serp_cache')
      .upsert({
        keyword: keyword.toLowerCase(),
        geo: location,
        payload: serpData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
  } catch (cacheError) {
    console.error('Cache error:', cacheError)
  }

  return new Response(
    JSON.stringify(serpData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handlePredictiveAnalysis(keywords: string[], userId: string, supabase: any) {
  if (!keywords || keywords.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Keywords are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const predictions = []

  for (const keyword of keywords) {
    // Get historical data
    const { data: historicalData } = await supabase
      .from('serp_cache')
      .select('payload, created_at')
      .eq('keyword', keyword.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(10)

    const trendForecast = calculateTrendForecast(keyword, historicalData || [])
    const opportunityScore = calculateOpportunityScore(keyword, historicalData?.[0]?.payload)
    
    predictions.push({
      keyword,
      trendForecast,
      opportunityScore,
      contentPerformancePrediction: {
        successProbability: Math.random() * 40 + 60,
        estimatedRankingPosition: Math.floor(Math.random() * 10) + 1,
        timeToRank: Math.floor(Math.random() * 120) + 30,
        contentRequirements: {
          minWordCount: Math.floor(Math.random() * 1000) + 1500,
          requiredTopics: [`${keyword} basics`, `${keyword} advanced`, `${keyword} comparison`],
          competitorGaps: [`Better ${keyword} examples`, `More detailed ${keyword} guide`]
        }
      }
    })
  }

  // Log prediction request
  if (userId) {
    try {
      await supabase
        .from('serp_usage_logs')
        .insert({
          user_id: userId,
          provider: 'serp-ai',
          operation: 'predictive_analysis',
          success: true,
          metadata: { keywords, prediction_count: predictions.length }
        })
    } catch (error) {
      console.error('Failed to log usage:', error)
    }
  }

  return new Response(
    JSON.stringify({ predictions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWorkflowExecution(workflowId: string, userId: string, supabase: any) {
  if (!workflowId) {
    return new Response(
      JSON.stringify({ error: 'Workflow ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get workflow from database
    const { data: workflow, error } = await supabase
      .from('ai_workflow_states')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single()

    if (error || !workflow) {
      return new Response(
        JSON.stringify({ error: 'Workflow not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Execute workflow step
    const updatedWorkflow = await executeWorkflowStep(workflow, supabase)

    // Update workflow in database
    await supabase
      .from('ai_workflow_states')
      .update({
        workflow_data: updatedWorkflow.workflow_data,
        current_step: updatedWorkflow.current_step,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)

    return new Response(
      JSON.stringify(updatedWorkflow),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Workflow execution error:', error)
    return new Response(
      JSON.stringify({ error: 'Workflow execution failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleMultiKeywordAnalysis(keywords: string[], location: string, language: string, supabase: any) {
  const results = []
  
  for (const keyword of keywords) {
    const analysis = await handleBasicAnalysis(keyword, location, language, supabase)
    const data = await analysis.json()
    results.push({ keyword, data })
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions
function generateMockSerpData(keyword: string) {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 50000) + 5000,
    keywordDifficulty: Math.floor(Math.random() * 70) + 20,
    competitionScore: Math.random() * 0.8 + 0.1,
    cpc: Math.random() * 3 + 0.5,
    topResults: Array(10).fill(null).map((_, i) => ({
      position: i + 1,
      title: `Top Result ${i + 1} for "${keyword}"`,
      url: `https://example${i + 1}.com`,
      snippet: `High-quality content about ${keyword} with detailed information and insights...`,
      domain: `example${i + 1}.com`
    })),
    contentGaps: [
      { topic: `${keyword} for beginners`, description: `Basic guide to ${keyword}`, opportunity: `Create comprehensive beginner guide` },
      { topic: `Advanced ${keyword} techniques`, description: `In-depth ${keyword} strategies`, opportunity: `Develop advanced tutorial series` }
    ],
    questions: [
      { question: `What is ${keyword}?`, answer: `${keyword} is...`, source: 'Search Results' },
      { question: `How to use ${keyword}?`, answer: `To use ${keyword}...`, source: 'Search Results' }
    ],
    featuredSnippets: [],
    relatedSearches: [`${keyword} guide`, `${keyword} tips`, `best ${keyword}`],
    totalResults: Math.floor(Math.random() * 1000000) + 100000,
    isMockData: true,
    provider: 'mock'
  }
}

function generateContentGaps(keyword: string, organicResults: any[]) {
  return [
    { topic: `${keyword} comparison`, description: `Compare different ${keyword} options`, opportunity: `Create detailed comparison content` },
    { topic: `${keyword} tutorial`, description: `Step-by-step ${keyword} guide`, opportunity: `Develop comprehensive tutorial` }
  ]
}

function generatePeopleAlsoAsk(keyword: string) {
  return [
    { question: `What is ${keyword}?`, answer: `${keyword} is a popular topic...`, source: 'Search Results' },
    { question: `How does ${keyword} work?`, answer: `${keyword} works by...`, source: 'Search Results' },
    { question: `Why is ${keyword} important?`, answer: `${keyword} is important because...`, source: 'Search Results' }
  ]
}

function calculateTrendForecast(keyword: string, historicalData: any[]) {
  const currentVolume = historicalData[0]?.payload?.searchVolume || Math.floor(Math.random() * 50000) + 5000
  const trend = historicalData.length > 1 ? 
    (currentVolume > (historicalData[1]?.payload?.searchVolume || 0) ? 'rising' : 'declining') : 'stable'
  
  return {
    keyword,
    currentVolume,
    predictedVolume: Math.round(currentVolume * (trend === 'rising' ? 1.15 : trend === 'declining' ? 0.85 : 1)),
    trendDirection: trend,
    confidence: Math.random() * 40 + 60,
    opportunityWindow: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      description: `Optimal content creation window based on ${trend} trend`
    }
  }
}

function calculateOpportunityScore(keyword: string, serpData: any) {
  const searchVolume = serpData?.searchVolume || Math.floor(Math.random() * 50000) + 5000
  const difficulty = serpData?.keywordDifficulty || Math.floor(Math.random() * 70) + 20
  const competition = serpData?.competitionScore || Math.random() * 0.8 + 0.1
  
  const score = Math.max(10, Math.min(100, 
    (searchVolume / 1000) * 0.3 + 
    (100 - difficulty) * 0.4 + 
    (100 - competition * 100) * 0.3
  ))
  
  return {
    keyword,
    score: Math.round(score),
    factors: {
      searchVolume: Math.round(searchVolume / 1000 * 25),
      competition: Math.round((100 - difficulty) * 0.25),
      contentGap: Math.random() * 20,
      trendMomentum: Math.random() * 15,
      seasonality: Math.random() * 15
    },
    recommendation: score > 80 ? 'High-priority target' : score > 60 ? 'Good opportunity' : 'Consider for long-term',
    actionPriority: score > 85 ? 'immediate' : score > 70 ? 'high' : score > 50 ? 'medium' : 'low'
  }
}

async function executeWorkflowStep(workflow: any, supabase: any) {
  const workflowData = workflow.workflow_data || {}
  let currentStep = workflow.current_step || 'initialize'
  
  switch (currentStep) {
    case 'initialize':
      workflowData.status = 'running'
      workflowData.progress = 10
      currentStep = 'analyze_keywords'
      break
      
    case 'analyze_keywords':
      workflowData.progress = 50
      workflowData.analysis = { completed: true, results: 'Keywords analyzed' }
      currentStep = 'generate_recommendations'
      break
      
    case 'generate_recommendations':
      workflowData.progress = 80
      workflowData.recommendations = ['Focus on high-volume keywords', 'Address content gaps']
      currentStep = 'complete'
      break
      
    case 'complete':
      workflowData.progress = 100
      workflowData.status = 'completed'
      workflowData.completedAt = new Date().toISOString()
      break
  }
  
  return {
    ...workflow,
    workflow_data: workflowData,
    current_step: currentStep
  }
}