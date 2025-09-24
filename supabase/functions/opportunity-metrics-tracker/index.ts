import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const serpApiKey = Deno.env.get('SERP_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { opportunityId, contentId, publishedUrl } = await req.json();

    console.log(`📊 Tracking metrics for opportunity: ${opportunityId}`);

    // Get opportunity details
    const { data: opportunity, error: oppError } = await supabase
      .from('content_opportunities')
      .select('keyword, user_id')
      .eq('id', opportunityId)
      .single();

    if (oppError || !opportunity) {
      throw new Error('Opportunity not found');
    }

    // Check current ranking if SERP API is available
    let currentRank = null;
    if (serpApiKey && publishedUrl) {
      currentRank = await checkKeywordRanking(opportunity.keyword, publishedUrl);
    }

    // Get or create metrics record
    const { data: existingMetrics } = await supabase
      .from('opportunity_metrics')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .single();

    let metricsData;
    if (existingMetrics) {
      // Update existing metrics
      const updateData: any = {
        last_updated: new Date().toISOString()
      };

      if (contentId) updateData.content_id = contentId;
      if (publishedUrl) updateData.published_url = publishedUrl;
      if (currentRank) {
        updateData.current_rank = currentRank;
        if (!existingMetrics.initial_rank) {
          updateData.initial_rank = currentRank;
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from('opportunity_metrics')
        .update(updateData)
        .eq('id', existingMetrics.id)
        .select()
        .single();

      if (updateError) throw updateError;
      metricsData = updated;
    } else {
      // Create new metrics record
      const { data: created, error: createError } = await supabase
        .from('opportunity_metrics')
        .insert([{
          opportunity_id: opportunityId,
          content_id: contentId,
          published_url: publishedUrl,
          initial_rank: currentRank,
          current_rank: currentRank,
          click_through_rate: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        }])
        .select()
        .single();

      if (createError) throw createError;
      metricsData = created;
    }

    // Update opportunity status if content is published
    if (publishedUrl && contentId) {
      await supabase
        .from('content_opportunities')
        .update({ 
          status: 'published',
          last_updated: new Date().toISOString()
        })
        .eq('id', opportunityId);
    }

    console.log(`✅ Metrics updated for: ${opportunity.keyword}`);

    return new Response(JSON.stringify({
      success: true,
      metrics: metricsData,
      current_rank: currentRank,
      message: 'Metrics updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error tracking metrics:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function checkKeywordRanking(keyword: string, targetUrl: string): Promise<number | null> {
  if (!serpApiKey) {
    console.log('⚠️ SERP API key not configured for ranking check');
    return null;
  }

  try {
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&num=100&hl=en&gl=us&api_key=${serpApiKey}`;
    
    const response = await fetch(serpUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`SERP API error: ${data.error}`);
    }
    
    const organicResults = data.organic_results || [];
    const targetDomain = new URL(targetUrl).hostname;
    
    // Find ranking position
    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      if (result.link && result.link.includes(targetDomain)) {
        return i + 1; // Rankings start at 1
      }
    }
    
    return null; // Not found in top 100
  } catch (error) {
    console.error('Ranking check error:', error);
    return null;
  }
}

// Additional function to batch update all published content metrics
export async function updateAllMetrics() {
  console.log('📊 Starting batch metrics update...');
  
  const { data: publishedOpportunities } = await supabase
    .from('content_opportunities')
    .select(`
      id,
      keyword,
      opportunity_metrics (
        id,
        published_url,
        current_rank
      )
    `)
    .eq('status', 'published')
    .not('opportunity_metrics.published_url', 'is', null);

  const updates = [];
  for (const opp of publishedOpportunities || []) {
    if (opp.opportunity_metrics?.[0]?.published_url) {
      const newRank = await checkKeywordRanking(
        opp.keyword, 
        opp.opportunity_metrics[0].published_url
      );
      
      if (newRank !== null) {
        updates.push({
          id: opp.opportunity_metrics[0].id,
          current_rank: newRank,
          last_updated: new Date().toISOString()
        });
      }
    }
  }

  if (updates.length > 0) {
    for (const update of updates) {
      await supabase
        .from('opportunity_metrics')
        .update({
          current_rank: update.current_rank,
          last_updated: update.last_updated
        })
        .eq('id', update.id);
    }
  }

  console.log(`✅ Updated metrics for ${updates.length} opportunities`);
  return updates;
}