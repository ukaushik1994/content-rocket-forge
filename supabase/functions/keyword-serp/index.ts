
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCorsPreflightRequest } from "../shared/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../shared/errors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SERPAPI_KEY = Deno.env.get("SERP_API_KEY");
const SERPSTACK_KEY = Deno.env.get("SERPSTACK_KEY");

// Type definitions for API responses
interface VolumeResponse {
  search_volume?: number;
  related_queries?: Array<{ title: string; volume?: number }>;
}

interface SerpResponse {
  organic_results?: any[];
  ads?: any[];
  related_questions?: any[];
  images_results?: any[];
  video_results?: any[];
  inline_videos?: any[];
  news_results?: any[];
  top_stories?: any[];
  knowledge_graph?: any;
  search_information?: {
    total_results?: number;
  };
  request?: {
    processed_timestamp?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { keyword, geo = "US", forceRefresh = false } = await req.json();
    
    if (!keyword) {
      return createErrorResponse("Keyword is required", 400, 'keyword-serp', 'missing-keyword');
    }

    console.log(`Enhanced SERP analysis for keyword: "${keyword}" in geo: "${geo}"`);

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
          console.log(`Using cached data for ${keyword} (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
          return createSuccessResponse(cached.payload);
        } else {
          console.log(`Cache expired for ${keyword}, fetching fresh data`);
        }
      }
    }

    // 2. Prepare API calls
    const calls = [];
    
    // SerpApi Google Trends call (if key available)
    if (SERPAPI_KEY) {
      const volumeURL = new URL("https://serpapi.com/search");
      volumeURL.searchParams.set("engine", "google_trends");
      volumeURL.searchParams.set("data_type", "search_volume");
      volumeURL.searchParams.set("q", keyword);
      volumeURL.searchParams.set("geo", geo);
      volumeURL.searchParams.set("date", "today 12-m");
      volumeURL.searchParams.set("api_key", SERPAPI_KEY);
      
      calls.push(fetch(volumeURL.toString()));
    } else {
      calls.push(Promise.resolve(null));
    }

    // Serpstack SERP call (if key available)
    if (SERPSTACK_KEY) {
      const serpURL = new URL("https://api.serpstack.com/search");
      serpURL.searchParams.set("access_key", SERPSTACK_KEY);
      serpURL.searchParams.set("query", keyword);
      serpURL.searchParams.set("type", "web");
      serpURL.searchParams.set("location", geo === "US" ? "United States" : geo);
      
      calls.push(fetch(serpURL.toString()));
    } else {
      calls.push(Promise.resolve(null));
    }

    // 3. Execute API calls in parallel
    const [volumeResponse, serpResponse] = await Promise.all(calls);
    
    let volumeData: VolumeResponse = {};
    let serpData: SerpResponse = {};
    
    // Process volume data
    if (volumeResponse && volumeResponse.ok) {
      try {
        volumeData = await volumeResponse.json();
        console.log("SerpApi volume data retrieved successfully");
      } catch (error) {
        console.error("Error parsing SerpApi response:", error);
      }
    }
    
    // Process SERP data
    if (serpResponse && serpResponse.ok) {
      try {
        const serpResponseData = await serpResponse.json();
        serpData = serpResponseData.success ? serpResponseData : {};
        console.log("Serpstack SERP data retrieved successfully");
      } catch (error) {
        console.error("Error parsing Serpstack response:", error);
      }
    }

    // 4. Calculate derived metrics
    const adsFilled = serpData.ads?.length ?? 0;
    const competitionPct = Math.min(adsFilled / 10.0, 1.0); // Max 10 ad slots
    const searchVolume = volumeData.search_volume ?? 0;
    
    // SEO Difficulty: higher competition and volume = harder
    const seoDifficulty = searchVolume > 0 
      ? +(competitionPct * 100 / Math.log10(searchVolume + 10)).toFixed(2)
      : 0;
    
    // Opportunity Score: lower competition + higher volume = better opportunity
    const opportunityScore = searchVolume > 0
      ? +((1 - competitionPct) * Math.log10(searchVolume + 10) * 10).toFixed(2)
      : 0;

    // 5. Generate strategic insights
    const generateInsights = (volume: number, competition: number, difficulty: number, opportunity: number) => {
      const insights = [];
      
      if (volume === 0) {
        insights.push("Long-tail keyword with niche traffic potential");
      } else if (volume < 500) {
        insights.push("Modest but targeted search volume");
      } else {
        insights.push("High-interest keyword with substantial search volume");
      }
      
      if (difficulty < 30) {
        insights.push("Low difficulty - quick win opportunity");
      } else if (difficulty < 60) {
        insights.push("Moderate difficulty - requires solid content strategy");
      } else {
        insights.push("High difficulty - competitive landscape");
      }
      
      if (competition < 0.3) {
        insights.push("Low ad competition - organic opportunity");
      } else {
        insights.push("Crowded ad space - consider long-tail variations");
      }
      
      if (opportunity > 50) {
        insights.push("Recommended: Publish content now for quick wins");
      } else {
        insights.push("Consider for future content calendar");
      }
      
      return insights;
    };

    // 6. Assemble comprehensive payload
    const payload = {
      keyword,
      geo,
      metrics: {
        search_volume: searchVolume,
        competition_pct: competitionPct,
        result_count: serpData.search_information?.total_results ?? 0,
        seo_difficulty: seoDifficulty,
        opportunity_score: opportunityScore
      },
      serp_blocks: {
        organic: serpData.organic_results ?? [],
        ads: serpData.ads ?? [],
        people_also_ask: serpData.related_questions ?? [],
        top_stories: serpData.top_stories ?? serpData.news_results ?? [],
        images: serpData.images_results ?? [],
        videos: serpData.video_results ?? serpData.inline_videos ?? [],
        knowledge_graph: serpData.knowledge_graph ?? null
      },
      related_keywords: volumeData.related_queries ?? [],
      insights: generateInsights(searchVolume, competitionPct, seoDifficulty, opportunityScore),
      timestamp: serpData.request?.processed_timestamp ?? new Date().toISOString(),
      data_sources: {
        volume_api: !!SERPAPI_KEY && volumeResponse?.ok,
        serp_api: !!SERPSTACK_KEY && serpResponse?.ok,
        is_cached: false
      }
    };

    // 7. Cache the result
    try {
      await supabase
        .from("serp_cache")
        .upsert({
          keyword,
          geo,
          payload,
          updated_at: new Date().toISOString()
        });
      console.log(`Cached SERP data for ${keyword}`);
    } catch (cacheError) {
      console.error("Error caching SERP data:", cacheError);
      // Don't fail the request if caching fails
    }

    return createSuccessResponse(payload);
    
  } catch (error: any) {
    console.error("Error in keyword-serp function:", error);
    return createErrorResponse(
      `SERP analysis failed: ${error.message}`, 
      500, 
      'keyword-serp', 
      'analysis-failed'
    );
  }
});
