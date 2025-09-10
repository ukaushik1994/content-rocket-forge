import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, contextType } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch comprehensive user context
    const [
      strategiesResult,
      solutionsResult,
      contentResult,
      calendarResult,
      pipelineResult,
      analyticsResult
    ] = await Promise.all([
      supabase.from('content_strategies').select('*').eq('user_id', userId).eq('is_active', true).single(),
      supabase.from('solutions').select('*').eq('user_id', userId).limit(5),
      supabase.from('content_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('content_calendar').select('*').eq('user_id', userId).limit(10),
      supabase.from('content_pipeline').select('*').eq('user_id', userId).limit(10),
      supabase.from('content_analytics').select('*').limit(5)
    ]);

    const contentItems = contentResult.data || [];
    const totalContent = contentItems.length;
    const published = contentItems.filter(item => item.status === 'published').length;
    const inReview = contentItems.filter(item => item.status === 'review').length;
    const avgSeoScore = totalContent > 0 
      ? Math.round(contentItems.reduce((acc, item) => acc + (item.seo_score || 0), 0) / totalContent)
      : 0;

    // Generate weekly performance data for charts
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
      currentStrategy: strategiesResult.data,
      solutions: solutionsResult.data || [],
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

    // Generate contextual suggestions based on current state
    const suggestions = generateContextualSuggestions(context);

    // Derive latest Content Builder context from the most recent content item metadata
    const latestItem = (contentItems && contentItems.length > 0) ? contentItems[0] : null;
    const metadata: any = latestItem?.metadata || {};
    const selectedSerp = Array.isArray(metadata.serpSelections)
      ? metadata.serpSelections.filter((s: any) => s && (s.selected === true || s.selected === undefined)) // default to included if flag missing
      : [];
    const serpSelectionCounts = selectedSerp.reduce((acc: Record<string, number>, s: any) => {
      const t = s?.type || 'unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const builderContext = {
      additionalInstructions: metadata.additionalInstructions || '',
      selectedSolution: metadata.selectedSolution || null,
      serpSelections: selectedSerp,
      serpSelectionCounts,
      contentType: metadata.contentType || null,
      contentIntent: metadata.contentIntent || null,
      mainKeyword: metadata.mainKeyword || null,
      secondaryKeywords: Array.isArray(metadata.secondaryKeywords) ? metadata.secondaryKeywords : (metadata.secondaryKeywords ? [metadata.secondaryKeywords] : [])
    };

    return new Response(JSON.stringify({
      ...context,
      builderContext,
      suggestions,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-context-manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateContextualSuggestions(context: any) {
  const suggestions = [];

  // Strategy-based suggestions
  if (context.currentStrategy) {
    if (context.currentStrategy.main_keyword) {
      suggestions.push({
        type: 'keyword-analysis',
        title: `Analyze "${context.currentStrategy.main_keyword}"`,
        description: 'Get detailed SERP analysis and content opportunities',
        action: 'workflow:keyword-analysis',
        data: { keyword: context.currentStrategy.main_keyword }
      });
    }

    suggestions.push({
      type: 'content-creation',
      title: 'Create Strategic Content',
      description: 'Generate content aligned with your strategy goals',
      action: 'workflow:content-creation',
      data: { strategy: context.currentStrategy }
    });
  }

  // Solution-based suggestions
  if (context.solutions.length > 0) {
    suggestions.push({
      type: 'solution-content',
      title: 'Solution-Focused Content',
      description: `Create content featuring ${context.solutions[0].name}`,
      action: 'workflow:solution-integration',
      data: { solution: context.solutions[0] }
    });
  }

  // Pipeline suggestions
  if (context.pipelineItems.length > 0) {
    const ideaStageItems = context.pipelineItems.filter(item => item.stage === 'idea');
    if (ideaStageItems.length > 0) {
      suggestions.push({
        type: 'pipeline-action',
        title: 'Develop Pipeline Ideas',
        description: `You have ${ideaStageItems.length} content ideas ready to develop`,
        action: 'workflow:pipeline-development',
        data: { items: ideaStageItems }
      });
    }
  }

  // Performance suggestions
  if (context.contentItems.length > 0) {
    suggestions.push({
      type: 'performance-analysis',
      title: 'Analyze Content Performance',
      description: 'Review and optimize your published content',
      action: 'workflow:performance-analysis',
      data: { contentCount: context.contentItems.length }
    });
  }

  return suggestions.slice(0, 4); // Limit to top 4 suggestions
}