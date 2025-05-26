
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentId, publishedUrl } = await req.json();
    
    if (!contentId || !publishedUrl) {
      return new Response(
        JSON.stringify({ error: 'Content ID and published URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleSearchConsoleApiKey = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
    
    if (!googleSearchConsoleApiKey) {
      console.log('Google Search Console API key not configured, using mock data');
      
      // Return mock search console data when API key is not configured
      const mockSearchData = {
        impressions: Math.floor(Math.random() * 5000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
        ctr: Math.round((Math.random() * 0.15 + 0.02) * 100) / 100,
        averagePosition: Math.round((Math.random() * 20 + 5) * 10) / 10,
        topQueries: [
          { query: 'example keyword 1', clicks: Math.floor(Math.random() * 100) + 10, impressions: Math.floor(Math.random() * 1000) + 100 },
          { query: 'example keyword 2', clicks: Math.floor(Math.random() * 80) + 8, impressions: Math.floor(Math.random() * 800) + 80 },
          { query: 'example keyword 3', clicks: Math.floor(Math.random() * 60) + 6, impressions: Math.floor(Math.random() * 600) + 60 },
          { query: 'example keyword 4', clicks: Math.floor(Math.random() * 40) + 4, impressions: Math.floor(Math.random() * 400) + 40 },
          { query: 'example keyword 5', clicks: Math.floor(Math.random() * 20) + 2, impressions: Math.floor(Math.random() * 200) + 20 }
        ],
        topPages: [
          { page: publishedUrl, clicks: Math.floor(Math.random() * 200) + 20, impressions: Math.floor(Math.random() * 2000) + 200 }
        ],
        lastUpdated: new Date().toISOString()
      };

      // Save mock data to database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: upsertError } = await supabase
        .from('content_analytics')
        .upsert({
          content_id: contentId,
          published_url: publishedUrl,
          search_console_data: mockSearchData,
          last_fetched_at: new Date().toISOString()
        }, {
          onConflict: 'content_id'
        });

      if (upsertError) {
        console.error('Error saving mock search console data:', upsertError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: mockSearchData,
          isMockData: true,
          message: 'Using mock data - configure Google Search Console API for real data'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real Google Search Console data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const siteUrl = new URL(publishedUrl).origin;

    const searchConsoleResponse = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query?key=${googleSearchConsoleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          dimensionFilterGroups: [{
            filters: [{
              dimension: 'page',
              operator: 'equals',
              expression: publishedUrl
            }]
          }],
          rowLimit: 25000
        })
      }
    );

    const searchData = await searchConsoleResponse.json();
    
    if (!searchConsoleResponse.ok) {
      throw new Error(`Google Search Console API error: ${searchData.error?.message || 'Unknown error'}`);
    }

    // Process the search console data
    const rows = searchData.rows || [];
    
    let processedData = {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      averagePosition: 0,
      topQueries: [],
      topPages: [],
      lastUpdated: new Date().toISOString()
    };

    if (rows.length > 0) {
      const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
      const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
      const weightedPosition = rows.reduce((sum, row) => sum + (row.position * row.impressions), 0);

      // Group by query for top queries
      const queryMap = new Map();
      rows.forEach(row => {
        const query = row.keys[0];
        if (!queryMap.has(query)) {
          queryMap.set(query, { query, clicks: 0, impressions: 0 });
        }
        const existing = queryMap.get(query);
        existing.clicks += row.clicks;
        existing.impressions += row.impressions;
      });

      processedData = {
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalClicks / totalImpressions,
        averagePosition: weightedPosition / totalImpressions,
        topQueries: Array.from(queryMap.values())
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 10),
        topPages: [{ page: publishedUrl, clicks: totalClicks, impressions: totalImpressions }],
        lastUpdated: new Date().toISOString()
      };
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: upsertError } = await supabase
      .from('content_analytics')
      .upsert({
        content_id: contentId,
        published_url: publishedUrl,
        search_console_data: processedData,
        last_fetched_at: new Date().toISOString()
      }, {
        onConflict: 'content_id'
      });

    if (upsertError) {
      console.error('Error saving search console data:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save search console data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: processedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-console-fetch function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
