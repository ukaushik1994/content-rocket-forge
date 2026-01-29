import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ClarityInsight {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  data?: any;
}

interface HeatmapData {
  scrollDepth: number;
  avgTimeOnPage: number;
  deadClicks: { selector: string; count: number; x: number; y: number }[];
  rageClicks: { selector: string; count: number; x: number; y: number }[];
  topInteractions: { element: string; clicks: number }[];
  insights: ClarityInsight[];
  provider: 'clarity' | 'hotjar';
  fetchedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, url, userId, provider = 'clarity' } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get API credentials from user settings
    let apiToken: string | null = null;
    let clarityProjectId = projectId;

    if (userId) {
      const { data: apiKeyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('service', provider === 'clarity' ? 'microsoft-clarity' : 'hotjar')
        .eq('is_active', true)
        .single();
      
      if (apiKeyData?.encrypted_key) {
        try {
          const parsed = JSON.parse(apiKeyData.encrypted_key);
          apiToken = parsed.apiToken || parsed.api_token;
          clarityProjectId = parsed.projectId || parsed.project_id || clarityProjectId;
        } catch {
          apiToken = apiKeyData.encrypted_key;
        }
      }
    }

    // Fall back to environment variables
    if (!apiToken) {
      apiToken = Deno.env.get(provider === 'clarity' ? 'CLARITY_API_TOKEN' : 'HOTJAR_API_TOKEN');
    }
    if (!clarityProjectId) {
      clarityProjectId = Deno.env.get(provider === 'clarity' ? 'CLARITY_PROJECT_ID' : 'HOTJAR_SITE_ID');
    }

    // If no credentials, return mock data for development
    if (!apiToken || !clarityProjectId) {
      console.log(`${provider} credentials not configured, using mock data`);
      const mockData = generateMockHeatmapData(provider as 'clarity' | 'hotjar');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: mockData,
          isMockData: true,
          message: `Configure ${provider === 'clarity' ? 'Microsoft Clarity' : 'Hotjar'} in Settings for real data`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let heatmapData: HeatmapData;

    if (provider === 'clarity') {
      heatmapData = await fetchClarityData(clarityProjectId, apiToken, url);
    } else {
      heatmapData = await fetchHotjarData(clarityProjectId, apiToken, url);
    }

    return new Response(
      JSON.stringify({ success: true, data: heatmapData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in clarity-fetch function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchClarityData(projectId: string, apiToken: string, url: string): Promise<HeatmapData> {
  // Microsoft Clarity API endpoint
  // Note: Clarity's API is limited - most data comes from their dashboard
  // This is a best-effort implementation using available endpoints
  
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Clarity Export API (if available)
    const response = await fetch(
      `https://www.clarity.ms/export/api/v1/project/${projectId}/data?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      // Clarity API might not be available for all plans
      console.warn('Clarity API returned error, using derived insights');
      return generateDerivedInsights('clarity', url);
    }

    const data = await response.json();

    // Process Clarity data
    return {
      scrollDepth: data.scrollDepth || 0.5,
      avgTimeOnPage: data.avgTimeOnPage || 0,
      deadClicks: (data.deadClicks || []).map((dc: any) => ({
        selector: dc.element || 'unknown',
        count: dc.count || 0,
        x: dc.x || 0,
        y: dc.y || 0
      })),
      rageClicks: (data.rageClicks || []).map((rc: any) => ({
        selector: rc.element || 'unknown',
        count: rc.count || 0,
        x: rc.x || 0,
        y: rc.y || 0
      })),
      topInteractions: (data.topClicks || []).slice(0, 10).map((tc: any) => ({
        element: tc.element || 'unknown',
        clicks: tc.count || 0
      })),
      insights: generateInsightsFromData(data),
      provider: 'clarity',
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Clarity API error:', error);
    return generateDerivedInsights('clarity', url);
  }
}

async function fetchHotjarData(siteId: string, apiToken: string, url: string): Promise<HeatmapData> {
  // Hotjar API endpoint
  try {
    // Hotjar's API requires OAuth and has different endpoints
    const response = await fetch(
      `https://insights.hotjar.com/api/v2/sites/${siteId}/heatmaps`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn('Hotjar API returned error, using derived insights');
      return generateDerivedInsights('hotjar', url);
    }

    const data = await response.json();

    // Find heatmap for the specified URL
    const relevantHeatmap = data.heatmaps?.find((h: any) => 
      h.url === url || url.includes(h.url)
    );

    if (!relevantHeatmap) {
      return generateDerivedInsights('hotjar', url);
    }

    return {
      scrollDepth: relevantHeatmap.scrollReach || 0.5,
      avgTimeOnPage: relevantHeatmap.avgDuration || 0,
      deadClicks: [],
      rageClicks: [],
      topInteractions: (relevantHeatmap.clicks || []).slice(0, 10).map((c: any) => ({
        element: c.selector || 'unknown',
        clicks: c.count || 0
      })),
      insights: generateInsightsFromData(relevantHeatmap),
      provider: 'hotjar',
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Hotjar API error:', error);
    return generateDerivedInsights('hotjar', url);
  }
}

function generateInsightsFromData(data: any): ClarityInsight[] {
  const insights: ClarityInsight[] = [];

  // Scroll depth insights
  if (data.scrollDepth !== undefined) {
    if (data.scrollDepth < 0.3) {
      insights.push({
        type: 'scroll_depth',
        message: 'Only 30% of users scroll past the first section. Consider adding a hook or moving key content higher.',
        severity: 'critical'
      });
    } else if (data.scrollDepth < 0.6) {
      insights.push({
        type: 'scroll_depth',
        message: `${Math.round(data.scrollDepth * 100)}% of users reach mid-page. Consider adding visual breaks or CTAs to encourage scrolling.`,
        severity: 'warning'
      });
    }
  }

  // Dead clicks insights
  if (data.deadClicks?.length > 0) {
    insights.push({
      type: 'dead_clicks',
      message: `${data.deadClicks.length} elements have dead clicks. Users expect these to be interactive.`,
      severity: 'warning',
      data: data.deadClicks.slice(0, 5)
    });
  }

  // Rage clicks insights
  if (data.rageClicks?.length > 0) {
    insights.push({
      type: 'rage_clicks',
      message: `${data.rageClicks.length} frustration points detected. Users are clicking repeatedly on unresponsive elements.`,
      severity: 'critical',
      data: data.rageClicks.slice(0, 5)
    });
  }

  return insights;
}

function generateDerivedInsights(provider: 'clarity' | 'hotjar', url: string): HeatmapData {
  // When API isn't available, return structure with helpful message
  return {
    scrollDepth: 0,
    avgTimeOnPage: 0,
    deadClicks: [],
    rageClicks: [],
    topInteractions: [],
    insights: [{
      type: 'setup_required',
      message: `${provider === 'clarity' ? 'Microsoft Clarity' : 'Hotjar'} tracking needs to be set up. Add the tracking code to your page and configure API access.`,
      severity: 'info'
    }],
    provider,
    fetchedAt: new Date().toISOString()
  };
}

function generateMockHeatmapData(provider: 'clarity' | 'hotjar'): HeatmapData {
  const scrollDepth = Math.random() * 0.5 + 0.3; // 30-80%
  
  return {
    scrollDepth,
    avgTimeOnPage: Math.floor(Math.random() * 180) + 60, // 60-240 seconds
    deadClicks: [
      { selector: '.hero-image', count: 23, x: 450, y: 280 },
      { selector: '.testimonial-text', count: 12, x: 320, y: 890 }
    ],
    rageClicks: [
      { selector: '.submit-button.disabled', count: 8, x: 600, y: 1200 }
    ],
    topInteractions: [
      { element: 'CTA Button - Get Started', clicks: 156 },
      { element: 'Navigation - Pricing', clicks: 89 },
      { element: 'Footer - Contact', clicks: 45 },
      { element: 'Hero Image', clicks: 34 },
      { element: 'Feature Card 1', clicks: 28 }
    ],
    insights: [
      {
        type: 'scroll_depth',
        message: `${Math.round(scrollDepth * 100)}% of users scroll past the fold. ${scrollDepth < 0.5 ? 'Consider adding engaging content above the fold.' : 'Good engagement with page content.'}`,
        severity: scrollDepth < 0.5 ? 'warning' : 'info'
      },
      {
        type: 'dead_clicks',
        message: '2 elements have dead clicks - users expect them to be interactive.',
        severity: 'warning'
      },
      {
        type: 'rage_clicks',
        message: 'Submit button is receiving rage clicks when disabled. Consider showing a loading state or enabling the button.',
        severity: 'critical'
      }
    ],
    provider,
    fetchedAt: new Date().toISOString()
  };
}
