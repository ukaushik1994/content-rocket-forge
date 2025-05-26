
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

    const googleAnalyticsApiKey = Deno.env.get('GOOGLE_ANALYTICS_API_KEY');
    const googleAnalyticsPropertyId = Deno.env.get('GOOGLE_ANALYTICS_PROPERTY_ID');
    
    if (!googleAnalyticsApiKey || !googleAnalyticsPropertyId) {
      console.log('Google Analytics API credentials not configured, using mock data');
      
      // Return mock analytics data when API keys are not configured
      const mockAnalyticsData = {
        pageViews: Math.floor(Math.random() * 1000) + 100,
        sessions: Math.floor(Math.random() * 800) + 80,
        bounceRate: Math.round((Math.random() * 0.4 + 0.3) * 100) / 100,
        avgSessionDuration: Math.floor(Math.random() * 180) + 120,
        newUsers: Math.floor(Math.random() * 600) + 60,
        returningUsers: Math.floor(Math.random() * 200) + 20,
        conversionRate: Math.round((Math.random() * 0.05 + 0.01) * 100) / 100,
        demographics: {
          desktop: Math.round((Math.random() * 0.3 + 0.4) * 100) / 100,
          mobile: Math.round((Math.random() * 0.3 + 0.4) * 100) / 100,
          tablet: Math.round((Math.random() * 0.2 + 0.1) * 100) / 100
        },
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
          analytics_data: mockAnalyticsData,
          last_fetched_at: new Date().toISOString()
        }, {
          onConflict: 'content_id'
        });

      if (upsertError) {
        console.error('Error saving mock analytics data:', upsertError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: mockAnalyticsData,
          isMockData: true,
          message: 'Using mock data - configure Google Analytics API for real data'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real Google Analytics data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const analyticsResponse = await fetch(
      `https://analyticsreporting.googleapis.com/v4/reports:batchGet?key=${googleAnalyticsApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportRequests: [{
            viewId: googleAnalyticsPropertyId,
            dateRanges: [{ startDate, endDate }],
            metrics: [
              { expression: 'ga:pageviews' },
              { expression: 'ga:sessions' },
              { expression: 'ga:bounceRate' },
              { expression: 'ga:avgSessionDuration' },
              { expression: 'ga:newUsers' },
              { expression: 'ga:users' }
            ],
            dimensions: [
              { name: 'ga:deviceCategory' }
            ],
            dimensionFilterClauses: [{
              filters: [{
                dimensionName: 'ga:pagePath',
                operator: 'PARTIAL',
                expressions: [new URL(publishedUrl).pathname]
              }]
            }]
          }]
        })
      }
    );

    const analyticsData = await analyticsResponse.json();
    
    if (!analyticsResponse.ok) {
      throw new Error(`Google Analytics API error: ${analyticsData.error?.message || 'Unknown error'}`);
    }

    // Process the analytics data
    const report = analyticsData.reports?.[0];
    const rows = report?.data?.rows || [];
    
    let processedData = {
      pageViews: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      newUsers: 0,
      returningUsers: 0,
      demographics: { desktop: 0, mobile: 0, tablet: 0 },
      lastUpdated: new Date().toISOString()
    };

    if (rows.length > 0) {
      const totals = report.data.totals?.[0]?.values || [];
      processedData = {
        pageViews: parseInt(totals[0] || '0'),
        sessions: parseInt(totals[1] || '0'),
        bounceRate: parseFloat(totals[2] || '0') / 100,
        avgSessionDuration: parseInt(totals[3] || '0'),
        newUsers: parseInt(totals[4] || '0'),
        returningUsers: parseInt(totals[5] || '0') - parseInt(totals[4] || '0'),
        demographics: rows.reduce((acc, row) => {
          const device = row.dimensions[0];
          const sessions = parseInt(row.metrics[0].values[1] || '0');
          if (device === 'desktop') acc.desktop += sessions;
          else if (device === 'mobile') acc.mobile += sessions;
          else if (device === 'tablet') acc.tablet += sessions;
          return acc;
        }, { desktop: 0, mobile: 0, tablet: 0 }),
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
        analytics_data: processedData,
        last_fetched_at: new Date().toISOString()
      }, {
        onConflict: 'content_id'
      });

    if (upsertError) {
      console.error('Error saving analytics data:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analytics data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: processedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-analytics-fetch function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
