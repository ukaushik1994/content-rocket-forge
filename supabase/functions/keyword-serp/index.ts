
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
interface SerpApiTrendsResponse {
  search_volume?: number;
  related_queries?: Array<{ title: string; volume?: number }>;
}

interface SerpstackResponse {
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

    console.log(`SERP analysis for keyword: "${keyword}" in geo: "${geo}"`);

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

    // 2. Prepare API calls - exactly one per service
    const calls = [];
    
    // SerpApi Google Trends call for search volume and related keywords
    if (SERPAPI_KEY) {
      const trendsURL = new URL("https://serpapi.com/search");
      trendsURL.searchParams.set("engine", "google_trends");
      trendsURL.searchParams.set("data_type", "search_volume");
      trendsURL.searchParams.set("q", keyword);
      trendsURL.searchParams.set("geo", geo);
      trendsURL.searchParams.set("date", "today 12-m");
      trendsURL.searchParams.set("api_key", SERPAPI_KEY);
      
      calls.push(fetch(trendsURL.toString()));
    } else {
      calls.push(Promise.resolve(null));
    }

    // Serpstack web SERP call for all SERP features
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
    const [trendsResponse, serpResponse] = await Promise.all(calls);
    
    let trendsData: SerpApiTrendsResponse = {};
    let serpData: SerpstackResponse = {};
    
    // Process SerpApi trends data
    if (trendsResponse && trendsResponse.ok) {
      try {
        trendsData = await trendsResponse.json();
        console.log("SerpApi trends data retrieved successfully");
      } catch (error) {
        console.error("Error parsing SerpApi response:", error);
      }
    }
    
    // Process Serpstack SERP data
    if (serpResponse && serpResponse.ok) {
      try {
        const serpResponseData = await serpResponse.json();
        serpData = serpResponseData.success ? serpResponseData : {};
        console.log("Serpstack SERP data retrieved successfully");
      } catch (error) {
        console.error("Error parsing Serpstack response:", error);
      }
    }

    // 4. Extract data according to specifications
    const search_volume = trendsData.search_volume ?? 0;
    const related_keywords = trendsData.related_queries?.map(q => q.title) ?? [];
    
    const organic_results = serpData.organic_results ?? [];
    const ads = serpData.ads ?? [];
    const related_questions = serpData.related_questions ?? [];
    const news_results = serpData.news_results ?? serpData.top_stories ?? [];
    const images_results = serpData.images_results ?? [];
    const video_results = serpData.video_results ?? serpData.inline_videos ?? [];
    const knowledge_graph = serpData.knowledge_graph ?? null;
    const total_results = serpData.search_information?.total_results ?? 0;
    const timestamp = serpData.request?.processed_timestamp ?? new Date().toISOString();

    // 5. Calculate derived metrics
    const competition_pct = Math.min(ads.length / 10.0, 1.0); // Max 10 ad slots
    const seo_difficulty = search_volume > 0 
      ? Math.round((competition_pct * 100) / Math.log10(search_volume + 10) * 100) / 100
      : 0;
    const opportunity = search_volume > 0
      ? Math.round((1 - competition_pct) * Math.log10(search_volume + 10) * 10 * 100) / 100
      : 0;

    // 6. Assemble exact JSON response structure
    const payload = {
      keyword,
      metrics: {
        search_volume,
        competition_pct,
        result_count: total_results,
        seo_difficulty,
        opportunity
      },
      serp_blocks: {
        organic: organic_results,
        ads,
        people_also_ask: related_questions,
        top_stories: news_results,
        images: images_results,
        videos: video_results,
        knowledge_graph
      },
      related_keywords,
      timestamp
    };

    // 7. Cache the result with 24-hour TTL
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
