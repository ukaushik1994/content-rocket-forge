import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, contextType } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🔍 Fetching context for user: ${userId}, type: ${contextType}`);

    // Fetch comprehensive user context
    const [
      solutionsResult,
      contentResult,
      calendarResult,
      pipelineResult
    ] = await Promise.all([
      supabase.from('solutions').select('*').eq('user_id', userId).limit(5),
      supabase.from('content_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('content_calendar').select('*').eq('user_id', userId).limit(10),
      supabase.from('content_pipeline').select('*').eq('user_id', userId).limit(10)
    ]);

    const contentItems = contentResult.data || [];
    const solutions = solutionsResult.data || [];

    // Calculate analytics
    const totalContent = contentItems.length;
    const published = contentItems.filter(item => item.status === 'published').length;
    const inReview = contentItems.filter(item => item.status === 'review').length;
    const avgSeoScore = totalContent > 0 
      ? Math.round(contentItems.reduce((acc, item) => acc + (item.seo_score || 0), 0) / totalContent)
      : 0;

    // Generate weekly performance data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekContent = contentItems.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= weekStart && itemDate < weekEnd;
      });
      
      weeklyData.push({
        name: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        content: weekContent.length,
        published: weekContent.filter(item => item.status === 'published').length,
        seoScore: weekContent.length > 0 
          ? Math.round(weekContent.reduce((acc, item) => acc + (item.seo_score || 0), 0) / weekContent.length)
          : 0
      });
    }

    const context = {
      solutions,
      contentItems,
      calendarItems: calendarResult.data || [],
      pipelineItems: pipelineResult.data || [],
      analytics: {
        totalContent,
        published,
        inReview,
        avgSeoScore,
        weeklyData,
        contentByType: contentItems.reduce((acc, item) => {
          acc[item.content_type || 'unknown'] = (acc[item.content_type || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        pipelineByStage: (pipelineResult.data || []).reduce((acc, item) => {
          acc[item.stage] = (acc[item.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };

    console.log(`✅ Context fetched successfully: ${solutions.length} solutions, ${contentItems.length} content items`);

    return new Response(JSON.stringify({
      ...context,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in ai-context-manager:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      solutions: [],
      contentItems: [],
      calendarItems: [],
      pipelineItems: [],
      analytics: {
        totalContent: 0,
        published: 0,
        inReview: 0,
        avgSeoScore: 0,
        weeklyData: [],
        contentByType: {},
        pipelineByStage: {}
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});