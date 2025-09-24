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

    // Fetch comprehensive user context - ALL platform data
    const [
      solutionsResult,
      contentResult,
      calendarResult,
      pipelineResult,
      approvalsResult,
      strategiesResult,
      proposalsResult,
      companyInfoResult,
      brandGuidelinesResult,
      competitorsResult,
      aiAnalysesResult,
      workflowStatesResult,
      contextSnapshotsResult,
      conversationsResult
    ] = await Promise.all([
      // Existing data
      supabase.from('solutions').select('*').eq('user_id', userId),
      supabase.from('content_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('content_calendar').select('*').eq('user_id', userId).limit(15),
      supabase.from('content_pipeline').select('*').eq('user_id', userId).limit(15),
      
      // Content approval ecosystem
      supabase.from('content_approvals')
        .select(`
          *,
          content_items!inner(id, title, user_id)
        `)
        .eq('content_items.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Strategy ecosystem
      supabase.from('ai_strategies').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('ai_strategy_proposals').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(15),
      
      // Company & Brand context
      supabase.from('company_info').select('*').eq('user_id', userId).limit(5),
      supabase.from('brand_guidelines').select('*').eq('user_id', userId).limit(5),
      supabase.from('company_competitors').select('*').eq('user_id', userId).limit(10),
      
      // AI insights & analyses
      supabase.from('content_ai_analyses')
        .select(`
          *,
          content_items!inner(id, title, user_id)
        `)
        .eq('content_items.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // AI workflow context
      supabase.from('ai_workflow_states').select('*').eq('user_id', userId).limit(5),
      supabase.from('ai_context_snapshots').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('ai_conversations').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(10)
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
      // Core content data
      solutions,
      contentItems,
      calendarItems: calendarResult.data || [],
      pipelineItems: pipelineResult.data || [],
      
      // Approval ecosystem
      contentApprovals: approvalsResult.data || [],
      
      // Strategy ecosystem  
      aiStrategies: strategiesResult.data || [],
      strategyProposals: proposalsResult.data || [],
      
      // Company & Brand context
      companyInfo: companyInfoResult.data || [],
      brandGuidelines: brandGuidelinesResult.data || [],
      competitors: competitorsResult.data || [],
      
      // AI insights & analyses
      contentAnalyses: aiAnalysesResult.data || [],
      
      // AI workflow context
      workflowStates: workflowStatesResult.data || [],
      contextSnapshots: contextSnapshotsResult.data || [],
      conversations: conversationsResult.data || [],
      
      // Analytics
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
        }, {} as Record<string, number>),
        totalStrategies: (strategiesResult.data || []).length,
        totalProposals: (proposalsResult.data || []).length,
        totalApprovals: (approvalsResult.data || []).length
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      // Core content data  
      solutions: [],
      contentItems: [],
      calendarItems: [],
      pipelineItems: [],
      
      // Approval ecosystem
      contentApprovals: [],
      
      // Strategy ecosystem
      aiStrategies: [],
      strategyProposals: [],
      
      // Company & Brand context
      companyInfo: [],
      brandGuidelines: [],
      competitors: [],
      
      // AI insights & analyses
      contentAnalyses: [],
      
      // AI workflow context
      workflowStates: [],
      contextSnapshots: [],
      conversations: [],
      
      // Analytics
      analytics: {
        totalContent: 0,
        published: 0,
        inReview: 0,
        avgSeoScore: 0,
        weeklyData: [],
        contentByType: {},
        pipelineByStage: {},
        totalStrategies: 0,
        totalProposals: 0,
        totalApprovals: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});