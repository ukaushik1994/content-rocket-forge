
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { keyword, location = 'United States', language = 'en' } = await req.json()

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get SERP API key from environment
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
            searchVolume: Math.floor(Math.random() * 50000) + 5000, // Mock data as SerpStack doesn't provide volume
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
            totalResults: serpstackData.search_information?.total_results || 0,
            provider: 'serpstack'
          }
        }
      } catch (error) {
        console.error('SerpStack error:', error)
      }
    }

    // Fallback to mock data if no API key or API fails
    if (!serpData) {
      serpData = {
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
        totalResults: Math.floor(Math.random() * 1000000) + 100000,
        isMockData: true,
        provider: 'mock'
      }
    }

    // Cache the result
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const cacheResponse = await fetch(`${supabaseUrl}/rest/v1/serp_cache`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            keyword: keyword.toLowerCase(),
            geo: location,
            payload: serpData
          })
        })
      } catch (cacheError) {
        console.error('Cache error:', cacheError)
      }
    }

    return new Response(
      JSON.stringify(serpData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('SERP analysis error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze SERP data',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
