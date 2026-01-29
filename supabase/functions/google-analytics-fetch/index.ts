import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getGoogleAccessToken } from '../shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GA4RunReportRequest {
  dateRanges: { startDate: string; endDate: string }[];
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  dimensionFilter?: any;
}

interface GA4Response {
  rows?: {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
  }[];
  totals?: { metricValues?: { value: string }[] }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentId, publishedUrl, userId, propertyId: overridePropertyId } = await req.json();
    
    if (!contentId || !publishedUrl) {
      return new Response(
        JSON.stringify({ error: 'Content ID and published URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to get user's service account from api_keys table
    let serviceAccount = null;
    let propertyId = overridePropertyId;

    if (userId) {
      const { data: apiKeyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('service', 'google-analytics')
        .eq('is_active', true)
        .single();

      if (apiKeyData?.encrypted_key) {
        try {
          // The encrypted_key should be a JSON service account or contain property ID
          const parsed = JSON.parse(apiKeyData.encrypted_key);
          if (parsed.type === 'service_account') {
            serviceAccount = parsed;
          }
          if (parsed.property_id) {
            propertyId = parsed.property_id;
          }
        } catch {
          // If it's not JSON, it might be just the property ID
          propertyId = apiKeyData.encrypted_key;
        }
      }
    }

    // Fall back to environment variables
    if (!propertyId) {
      propertyId = Deno.env.get('GOOGLE_ANALYTICS_PROPERTY_ID');
    }

    // If no configuration found, return mock data
    if (!propertyId) {
      console.log('Google Analytics Property ID not configured, using mock data');
      const mockData = generateMockAnalyticsData();
      await saveAnalyticsData(supabase, contentId, publishedUrl, mockData);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: mockData,
          isMockData: true,
          message: 'Configure GA4 Property ID in Settings for real data'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get access token using service account
    let accessToken: string;
    if (serviceAccount) {
      accessToken = await getGoogleAccessToken(serviceAccount, [
        'https://www.googleapis.com/auth/analytics.readonly'
      ]);
    } else {
      // Try environment variable for service account
      const envServiceAccount = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
      if (!envServiceAccount) {
        console.log('No service account configured, using mock data');
        const mockData = generateMockAnalyticsData();
        await saveAnalyticsData(supabase, contentId, publishedUrl, mockData);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: mockData,
            isMockData: true,
            message: 'Configure Service Account JSON in Settings for real data'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      serviceAccount = JSON.parse(envServiceAccount);
      accessToken = await getGoogleAccessToken(serviceAccount, [
        'https://www.googleapis.com/auth/analytics.readonly'
      ]);
    }

    // Prepare GA4 Data API v1 request
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Format property ID for GA4 API (needs "properties/" prefix)
    const formattedPropertyId = propertyId.startsWith('properties/') 
      ? propertyId 
      : `properties/${propertyId}`;

    // Prepare the page path filter
    const urlPath = new URL(publishedUrl).pathname;

    const requestBody: GA4RunReportRequest = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'newUsers' },
        { name: 'totalUsers' },
        { name: 'engagementRate' },
        { name: 'userEngagementDuration' }
      ],
      dimensions: [
        { name: 'deviceCategory' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: urlPath
          }
        }
      }
    };

    // Call GA4 Data API v1
    const analyticsResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${formattedPropertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    const analyticsData: GA4Response = await analyticsResponse.json();
    
    if (!analyticsResponse.ok) {
      console.error('GA4 API error:', JSON.stringify(analyticsData));
      throw new Error(`GA4 API error: ${(analyticsData as any).error?.message || 'Unknown error'}`);
    }

    // Process the GA4 response
    const processedData = processGA4Response(analyticsData);

    // Save to database
    await saveAnalyticsData(supabase, contentId, publishedUrl, processedData);

    return new Response(
      JSON.stringify({ success: true, data: processedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-analytics-fetch function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processGA4Response(response: GA4Response) {
  const rows = response.rows || [];
  
  // Initialize with zeros
  let data = {
    pageViews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    newUsers: 0,
    totalUsers: 0,
    engagementRate: 0,
    userEngagementDuration: 0,
    demographics: { desktop: 0, mobile: 0, tablet: 0 },
    lastUpdated: new Date().toISOString()
  };

  if (rows.length === 0) {
    return data;
  }

  // Aggregate metrics across all device categories
  rows.forEach(row => {
    const deviceCategory = row.dimensionValues?.[0]?.value?.toLowerCase() || 'unknown';
    const metrics = row.metricValues || [];

    data.pageViews += parseInt(metrics[0]?.value || '0');
    data.sessions += parseInt(metrics[1]?.value || '0');
    data.newUsers += parseInt(metrics[4]?.value || '0');
    data.totalUsers += parseInt(metrics[5]?.value || '0');
    data.userEngagementDuration += parseFloat(metrics[7]?.value || '0');

    // Track sessions by device
    const sessionCount = parseInt(metrics[1]?.value || '0');
    if (deviceCategory === 'desktop') data.demographics.desktop += sessionCount;
    else if (deviceCategory === 'mobile') data.demographics.mobile += sessionCount;
    else if (deviceCategory === 'tablet') data.demographics.tablet += sessionCount;
  });

  // Calculate averages using totals from first row (GA4 returns aggregates per dimension)
  if (response.totals?.[0]?.metricValues) {
    const totals = response.totals[0].metricValues;
    data.bounceRate = parseFloat(totals[2]?.value || '0');
    data.avgSessionDuration = parseFloat(totals[3]?.value || '0');
    data.engagementRate = parseFloat(totals[6]?.value || '0');
  } else if (rows.length > 0) {
    // Fallback to weighted average
    const totalSessions = data.sessions || 1;
    let weightedBounce = 0;
    let weightedDuration = 0;
    let weightedEngagement = 0;

    rows.forEach(row => {
      const metrics = row.metricValues || [];
      const sessions = parseInt(metrics[1]?.value || '0');
      weightedBounce += parseFloat(metrics[2]?.value || '0') * sessions;
      weightedDuration += parseFloat(metrics[3]?.value || '0') * sessions;
      weightedEngagement += parseFloat(metrics[6]?.value || '0') * sessions;
    });

    data.bounceRate = weightedBounce / totalSessions;
    data.avgSessionDuration = weightedDuration / totalSessions;
    data.engagementRate = weightedEngagement / totalSessions;
  }

  // Calculate returning users
  const returningUsers = data.totalUsers - data.newUsers;
  
  return {
    ...data,
    returningUsers: Math.max(0, returningUsers),
    // GA4 returns bounce rate as decimal (0.65 = 65%), keep consistent
    bounceRate: data.bounceRate > 1 ? data.bounceRate / 100 : data.bounceRate,
    engagementRate: data.engagementRate > 1 ? data.engagementRate / 100 : data.engagementRate
  };
}

function generateMockAnalyticsData() {
  return {
    pageViews: Math.floor(Math.random() * 1000) + 100,
    sessions: Math.floor(Math.random() * 800) + 80,
    bounceRate: Math.round((Math.random() * 0.4 + 0.3) * 100) / 100,
    avgSessionDuration: Math.floor(Math.random() * 180) + 120,
    newUsers: Math.floor(Math.random() * 600) + 60,
    totalUsers: Math.floor(Math.random() * 700) + 70,
    returningUsers: Math.floor(Math.random() * 200) + 20,
    engagementRate: Math.round((Math.random() * 0.3 + 0.5) * 100) / 100,
    userEngagementDuration: Math.floor(Math.random() * 300) + 100,
    demographics: {
      desktop: Math.floor(Math.random() * 400) + 200,
      mobile: Math.floor(Math.random() * 350) + 150,
      tablet: Math.floor(Math.random() * 100) + 30
    },
    lastUpdated: new Date().toISOString()
  };
}

async function saveAnalyticsData(supabase: any, contentId: string, publishedUrl: string, data: any) {
  const { error: upsertError } = await supabase
    .from('content_analytics')
    .upsert({
      content_id: contentId,
      published_url: publishedUrl,
      analytics_data: data,
      last_fetched_at: new Date().toISOString()
    }, {
      onConflict: 'content_id'
    });

  if (upsertError) {
    console.error('Error saving analytics data:', upsertError);
  }
}
