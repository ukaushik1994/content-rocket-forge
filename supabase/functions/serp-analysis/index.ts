
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Rate limit detection patterns
const RATE_LIMIT_PATTERNS = [
  'rate limit',
  'exceeded the maximum rate',
  'too many requests',
  'quota exceeded',
  '429'
];

function isRateLimitError(error: any): boolean {
  const message = (error?.message || String(error)).toLowerCase();
  return RATE_LIMIT_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()));
}

function isRateLimitResponse(data: any): boolean {
  if (!data) return false;
  
  // Check for Serpstack error codes
  if (data.error?.code === 106 || data.error?.type === 'rate_limit_reached') {
    return true;
  }
  
  // Check error messages
  const errorInfo = data.error?.info || data.error?.message || '';
  return RATE_LIMIT_PATTERNS.some(pattern => 
    errorInfo.toLowerCase().includes(pattern.toLowerCase())
  );
}

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

    // Get SERP API keys from environment
    const serpApiKey = Deno.env.get('SERP_API_KEY')
    const serpstackKey = Deno.env.get('SERPSTACK_KEY')

    let serpData = null
    let rateLimitHit = false
    let lastError: string | null = null

    // Try SerpStack first
    if (serpstackKey) {
      try {
        console.log(`🔍 Attempting Serpstack for keyword: "${keyword}"`);
        
        const serpstackUrl = `http://api.serpstack.com/search?access_key=${serpstackKey}&query=${encodeURIComponent(keyword)}&country=${location}&language=${language}&num=10`
        
        const serpstackResponse = await fetch(serpstackUrl)
        const serpstackData = await serpstackResponse.json()

        // Check for rate limit in response
        if (serpstackResponse.status === 429 || isRateLimitResponse(serpstackData)) {
          console.warn('⚠️ Serpstack rate limit detected');
          rateLimitHit = true;
          lastError = 'Serpstack rate limit exceeded';
          // Don't throw - try fallback
        } else if (serpstackData.organic_results) {
          serpData = {
            searchVolume: null,
            keywordDifficulty: null,
            competitionScore: serpstackData.ads ? Math.min(serpstackData.ads.length / 10, 1) : 0,
            cpc: null,
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
          console.log('✅ Serpstack returned results');
        } else if (serpstackData.error) {
          console.error('❌ Serpstack API error:', serpstackData.error);
          lastError = serpstackData.error?.info || 'Serpstack error';
        }
      } catch (error) {
        console.error('❌ Serpstack fetch error:', error);
        if (isRateLimitError(error)) {
          rateLimitHit = true;
        }
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // If Serpstack failed or hit rate limit, try SerpAPI as fallback
    if (!serpData && serpApiKey) {
      try {
        console.log(`🔄 Falling back to SerpAPI for keyword: "${keyword}"`);
        
        const serpApiUrl = `https://serpapi.com/search.json?api_key=${serpApiKey}&q=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&hl=${language}&num=10`
        
        const serpApiResponse = await fetch(serpApiUrl)
        const serpApiData = await serpApiResponse.json()

        if (serpApiResponse.status === 429 || serpApiData.error?.includes('rate')) {
          console.warn('⚠️ SerpAPI rate limit detected');
          rateLimitHit = true;
          lastError = 'SerpAPI rate limit exceeded';
        } else if (serpApiData.organic_results) {
          serpData = {
            searchVolume: serpApiData.search_metadata?.total_results || null,
            keywordDifficulty: null,
            competitionScore: serpApiData.ads ? Math.min(serpApiData.ads.length / 10, 1) : 0,
            cpc: null,
            topResults: serpApiData.organic_results.slice(0, 10).map((result: any, index: number) => ({
              position: index + 1,
              title: result.title,
              url: result.link,
              snippet: result.snippet || '',
              domain: result.displayed_link
            })),
            totalResults: parseInt(serpApiData.search_information?.total_results?.replace(/[^0-9]/g, '') || '0'),
            provider: 'serpapi'
          }
          console.log('✅ SerpAPI fallback returned results');
        } else if (serpApiData.error) {
          console.error('❌ SerpAPI error:', serpApiData.error);
          lastError = serpApiData.error;
        }
      } catch (error) {
        console.error('❌ SerpAPI fetch error:', error);
        if (isRateLimitError(error)) {
          rateLimitHit = true;
        }
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Handle rate limit scenario with graceful response
    if (rateLimitHit && !serpData) {
      console.warn('⏰ All SERP providers rate limited');
      
      return new Response(
        JSON.stringify({ 
          error: 'SERP API rate limit exceeded',
          code: 'RATE_LIMIT',
          isRateLimited: true,
          message: 'All SERP API providers have reached their rate limits. Please wait a few minutes before trying again.',
          retryAfter: 60,
          canContinue: false
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      )
    }

    // If no SERP data is available
    if (!serpData) {
      const noKeysConfigured = !serpstackKey && !serpApiKey;
      const errorMessage = noKeysConfigured 
        ? 'No SERP API keys configured. Please add SerpStack or SerpAPI key in Settings.'
        : `SERP analysis failed: ${lastError || 'Unknown error'}`;
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: noKeysConfigured ? 'NO_API_KEYS' : 'SERP_ERROR',
          details: lastError,
          requiresConfiguration: noKeysConfigured
        }),
        { 
          status: noKeysConfigured ? 400 : 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Cache the result (async, don't block response)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && supabaseServiceKey) {
      // Fire and forget - don't wait for cache
      fetch(`${supabaseUrl}/rest/v1/serp_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          keyword: keyword.toLowerCase(),
          geo: location,
          payload: serpData
        })
      }).catch(err => console.error('Cache write error:', err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...serpData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 SERP analysis error:', error)
    
    // Check if it's a rate limit error
    if (isRateLimitError(error)) {
      return new Response(
        JSON.stringify({ 
          error: 'SERP API rate limit exceeded',
          code: 'RATE_LIMIT',
          isRateLimited: true,
          message: 'Rate limit reached. Please wait before retrying.',
          retryAfter: 60
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze SERP data',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
