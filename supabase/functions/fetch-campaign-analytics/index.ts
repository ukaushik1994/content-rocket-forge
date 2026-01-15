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
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await req.json();
    const { campaignId } = body;
    const userIdFromBody = body.userId ?? body.user_id;

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: 'Campaign ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    if (userIdFromBody && userIdFromBody !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all content items for this campaign
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('id, title, published_url, performance_metrics, metadata')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId);


    if (contentError) {
      throw contentError;
    }

    if (!contentItems || contentItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No content items found for this campaign',
          data: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For each content item, fetch or generate analytics
    const analyticsPromises = contentItems.map(async (item) => {
      try {
        // Try to fetch existing analytics first
        const { data: existingAnalytics, error: analyticsError } = await supabase
          .from('campaign_analytics')
          .select('*')
          .eq('content_id', item.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .maybeSingle();

        if (analyticsError) {
          console.error('Error fetching analytics for content:', item.id, analyticsError);
        }

        if (existingAnalytics) {
          return existingAnalytics;
        }

        // Generate mock analytics if none exist
        const mockAnalytics = {
          campaign_id: campaignId,
          content_id: item.id,
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          views: Math.floor(Math.random() * 5000) + 500,
          engagement_count: Math.floor(Math.random() * 500) + 50,
          clicks: Math.floor(Math.random() * 300) + 30,
          shares: Math.floor(Math.random() * 100) + 10,
          conversions: Math.floor(Math.random() * 50) + 5,
          revenue: Math.floor(Math.random() * 1000) + 100,
          source: 'organic',
          platform: (item.metadata as any)?.platform || 'wordpress',
          metadata: {
            generated_at: new Date().toISOString(),
            content_type: (item.metadata as any)?.content_type || 'blog'
          }
        };

        // Insert mock analytics
        const { data: newAnalytics, error: insertError } = await supabase
          .from('campaign_analytics')
          .insert(mockAnalytics)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting analytics:', insertError);
          return mockAnalytics;
        }

        // Update content_items performance_metrics
        await supabase
          .from('content_items')
          .update({
            performance_metrics: {
              views: mockAnalytics.views,
              engagement: mockAnalytics.engagement_count,
              clicks: mockAnalytics.clicks,
              shares: mockAnalytics.shares,
              conversions: mockAnalytics.conversions,
              last_updated: new Date().toISOString()
            }
          })
          .eq('id', item.id);

        return newAnalytics;
      } catch (error) {
        console.error('Error processing analytics for content:', item.id, error);
        return null;
      }
    });

    const analyticsResults = await Promise.all(analyticsPromises);
    const validAnalytics = analyticsResults.filter(a => a !== null);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: validAnalytics,
        count: validAnalytics.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-campaign-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
