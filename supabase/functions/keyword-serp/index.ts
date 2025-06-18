
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SERPAPI_KEY = Deno.env.get('SERP_API_KEY');
const SERPSTACK_KEY = Deno.env.get('SERPSTACK_KEY');

serve(async (req) => {
  console.log('🚀 Enhanced SERP analysis function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, geo = "US", forceRefresh = false } = await req.json();
    
    if (!keyword) {
      return new Response(
        JSON.stringify({ success: false, error: "Keyword is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔍 Starting enhanced SERP analysis for keyword: "${keyword}" in geo: "${geo}"`);

    // 1. Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("serp_cache")
        .select("*")
        .eq("keyword", keyword)
        .eq("geo", geo)
        .single();

      if (cached) {
        const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cacheAge < cacheExpiry) {
          console.log(`✅ Using cached data for ${keyword} (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
          return new Response(
            JSON.stringify({ success: true, data: cached.payload, cached: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.log(`⏰ Cache expired for ${keyword}, fetching fresh data`);
        }
      }
    }

    // 2. Prepare API calls - exactly one per service
    const apiCalls = [];
    let searchVolume = 0;
    let relatedKeywords = [];
    let serpData = {
      organic_results: [],
      ads: [],
      related_questions: [],
      news_results: [],
      images_results: [],
      video_results: [],
      knowledge_graph: null,
      total_results: 0,
      processed_timestamp: new Date().toISOString()
    };

    // SerpApi Google Trends call (for search volume and related keywords)
    if (SERPAPI_KEY) {
      console.log('📊 Fetching search volume data from SerpApi...');
      const trendsUrl = new URL("https://serpapi.com/search");
      trendsUrl.searchParams.set("engine", "google_trends");
      trendsUrl.searchParams.set("data_type", "search_volume");
      trendsUrl.searchParams.set("q", keyword);
      trendsUrl.searchParams.set("geo", geo);
      trendsUrl.searchParams.set("date", "today 12-m");
      trendsUrl.searchParams.set("api_key", SERPAPI_KEY);
      
      apiCalls.push(
        fetch(trendsUrl.toString())
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json();
              searchVolume = data.search_volume || 0;
              relatedKeywords = (data.related_queries || []).map((q: any) => q.title || q).filter(Boolean);
              console.log(`✅ SerpApi: Found search volume ${searchVolume} and ${relatedKeywords.length} related keywords`);
            } else {
              console.warn(`⚠️ SerpApi request failed: ${response.status}`);
            }
          })
          .catch(error => {
            console.error("❌ SerpApi error:", error);
          })
      );
    } else {
      console.log('⚠️ No SERPAPI_KEY found, skipping search volume analysis');
    }

    // Serpstack SERP call (for organic results, ads, and SERP features)
    if (SERPSTACK_KEY) {
      console.log('🔍 Fetching SERP data from Serpstack...');
      const serpUrl = new URL("https://api.serpstack.com/search");
      serpUrl.searchParams.set("access_key", SERPSTACK_KEY);
      serpUrl.searchParams.set("query", keyword);
      serpUrl.searchParams.set("type", "web");
      serpUrl.searchParams.set("location", geo === "US" ? "United States" : geo);
      
      apiCalls.push(
        fetch(serpUrl.toString())
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json();
              if (data.success !== false) {
                serpData = {
                  organic_results: data.organic_results || [],
                  ads: data.ads || [],
                  related_questions: data.related_questions || [],
                  news_results: data.news_results || data.top_stories || [],
                  images_results: data.images_results || [],
                  video_results: data.video_results || data.inline_videos || [],
                  knowledge_graph: data.knowledge_graph || null,
                  total_results: data.search_information?.total_results || 0,
                  processed_timestamp: data.request?.processed_timestamp || new Date().toISOString()
                };
                console.log(`✅ Serpstack: Found ${serpData.organic_results.length} organic results, ${serpData.ads.length} ads`);
              } else {
                console.warn(`⚠️ Serpstack API error:`, data.error);
              }
            } else {
              console.warn(`⚠️ Serpstack request failed: ${response.status}`);
            }
          })
          .catch(error => {
            console.error("❌ Serpstack error:", error);
          })
      );
    } else {
      console.log('⚠️ No SERPSTACK_KEY found, skipping SERP features analysis');
    }

    // 3. Execute all API calls in parallel
    await Promise.all(apiCalls);

    // 4. Calculate derived metrics
    const adsFilled = serpData.ads.length;
    const competitionPct = Math.min(adsFilled / 10.0, 1.0); // Max 10 ad slots
    
    // SEO Difficulty: higher competition and volume = harder
    const seoDifficulty = searchVolume > 0 
      ? Math.round((competitionPct * 100 / Math.log10(searchVolume + 10)) * 100) / 100
      : 0;
    
    // Opportunity Score: lower competition + higher volume = better opportunity  
    const opportunityScore = searchVolume > 0
      ? Math.round(((1 - competitionPct) * Math.log10(searchVolume + 10) * 10) * 100) / 100
      : 0;

    console.log(`📈 Calculated metrics - Competition: ${competitionPct}, SEO Difficulty: ${seoDifficulty}, Opportunity: ${opportunityScore}`);

    // 5. Assemble structured response
    const analysisResult = {
      keyword,
      geo,
      metrics: {
        search_volume: searchVolume,
        competition_pct: competitionPct,
        result_count: serpData.total_results,
        seo_difficulty: seoDifficulty,
        opportunity_score: opportunityScore
      },
      serp_blocks: {
        organic: serpData.organic_results,
        ads: serpData.ads,
        people_also_ask: serpData.related_questions,
        top_stories: serpData.news_results,
        images: serpData.images_results,
        videos: serpData.video_results,
        knowledge_graph: serpData.knowledge_graph
      },
      related_keywords: relatedKeywords,
      timestamp: serpData.processed_timestamp,
      data_sources: {
        serpapi_available: !!SERPAPI_KEY,
        serpstack_available: !!SERPSTACK_KEY,
        search_volume_fetched: searchVolume > 0,
        serp_features_fetched: serpData.organic_results.length > 0
      }
    };

    // 6. Cache the result with 24-hour TTL
    try {
      await supabase
        .from("serp_cache")
        .upsert({
          keyword,
          geo,
          payload: analysisResult,
          updated_at: new Date().toISOString()
        });
      console.log(`💾 Cached SERP analysis for ${keyword}`);
    } catch (cacheError) {
      console.error("❌ Error caching SERP data:", cacheError);
      // Don't fail the request if caching fails
    }

    console.log('🎉 SERP analysis completed successfully');
    return new Response(
      JSON.stringify({ success: true, data: analysisResult, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error("💥 Error in keyword-serp function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `SERP analysis failed: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
