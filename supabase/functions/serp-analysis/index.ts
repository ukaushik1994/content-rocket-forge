
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
            searchVolume: null, // SerpStack doesn't provide search volume
            keywordDifficulty: null, // Calculated separately if needed
            competitionScore: serpstackData.ads ? Math.min(serpstackData.ads.length / 10, 1) : 0,
            cpc: null, // Not available from SerpStack
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
        // Don't fall back to mock data - let it fail properly
        throw new Error(`SerpStack API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // If no SERP data is available, throw an error instead of returning mock data
    if (!serpData) {
      const errorMessage = !serpstackKey 
        ? 'No SERP API keys configured. Please add SerpStack API key to enable real-time SERP data.'
        : 'All SERP API calls failed. Please check your API keys and try again.';
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: 'NO_SERP_DATA',
          details: 'Real-time SERP data is required. Mock data has been disabled.' 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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
