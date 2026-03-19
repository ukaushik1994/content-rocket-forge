import { createClient } from 'npm:@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: activeUsers } = await supabase
      .from('ai_conversations')
      .select('user_id')
      .gte('updated_at', thirtyDaysAgo);

    const uniqueUserIds = [...new Set((activeUsers || []).map((u: any) => u.user_id))];
    console.log(`[PROACTIVE] Processing ${uniqueUserIds.length} active users`);

    let totalRecs = 0;

    for (const userId of uniqueUserIds) {
      const recommendations: Array<{ user_id: string; type: string; title: string; description: string; action: string; priority: number }> = [];
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();
      const today = now.toISOString().split('T')[0];
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000).toISOString();

      // 1. Stale high-SEO drafts
      const { data: staleDrafts } = await supabase
        .from('content_items')
        .select('id, title, seo_score')
        .eq('user_id', userId).eq('status', 'draft')
        .lt('updated_at', fourteenDaysAgo)
        .order('seo_score', { ascending: false }).limit(3);

      if (staleDrafts?.length) {
        const best = staleDrafts[0];
        recommendations.push({
          user_id: userId,
          type: 'stale_draft',
          title: `"${best.title}" is ready to publish`,
          description: `This draft has ${best.seo_score ? `an SEO score of ${best.seo_score} and` : ''} been sitting for 14+ days. ${staleDrafts.length > 1 ? `Plus ${staleDrafts.length - 1} more stale draft(s).` : ''}`,
          action: `Review and help me finalize my draft "${best.title}" for publishing`,
          priority: 1
        });
      }

      // 2. Calendar gaps
      const { data: calendarItems } = await supabase
        .from('content_calendar')
        .select('id')
        .eq('user_id', userId)
        .gte('scheduled_date', today).lte('scheduled_date', sevenDaysFromNow);

      if (!calendarItems?.length) {
        recommendations.push({
          user_id: userId,
          type: 'calendar_gap',
          title: 'Empty content calendar this week',
          description: 'You have nothing scheduled for the next 7 days. Fill your calendar from available proposals or create new content.',
          action: 'Help me plan content for this week based on my available proposals',
          priority: 2
        });
      }

      // 3. Unused proposals
      const { data: unusedProposals } = await supabase
        .from('ai_strategy_proposals')
        .select('id, title, primary_keyword')
        .eq('user_id', userId).eq('status', 'available')
        .lt('created_at', sevenDaysAgo)
        .order('created_at', { ascending: true }).limit(3);

      if (unusedProposals?.length) {
        recommendations.push({
          user_id: userId,
          type: 'unused_proposal',
          title: `${unusedProposals.length} proposal(s) waiting for action`,
          description: `"${unusedProposals[0].title}" and ${unusedProposals.length > 1 ? `${unusedProposals.length - 1} more` : 'others'} have been available for 7+ days.`,
          action: `Show me my available proposals and help me schedule the best ones`,
          priority: 3
        });
      }

      // 4. Stale competitor analysis
      const thirtyDaysAgoDate = new Date(now.getTime() - 30 * 86400000).toISOString();
      const { data: staleCompetitors } = await supabase
        .from('company_competitors')
        .select('id, name, last_analyzed_at')
        .eq('user_id', userId);

      const needsRefresh = (staleCompetitors || []).filter((c: any) => 
        !c.last_analyzed_at || new Date(c.last_analyzed_at).getTime() < new Date(thirtyDaysAgoDate).getTime()
      );

      if (needsRefresh.length > 0) {
        recommendations.push({
          user_id: userId,
          type: 'competitor_stale',
          title: `${needsRefresh.length} competitor(s) need fresh analysis`,
          description: `${needsRefresh.map((c: any) => c.name).join(', ')} haven't been analyzed in 30+ days.`,
          action: `Analyze my competitors and show me what's changed recently`,
          priority: 4
        });
      }

      if (recommendations.length === 0) continue;

      // Clear old recommendations for this user, then insert new ones
      await supabase.from('proactive_recommendations')
        .delete().eq('user_id', userId).eq('dismissed', false).eq('acted_on', false);

      const { error: insertError } = await supabase
        .from('proactive_recommendations')
        .insert(recommendations);

      if (insertError) {
        console.error(`[PROACTIVE] Failed to insert recs for ${userId}:`, insertError);
      } else {
        totalRecs += recommendations.length;
      }
    }

    console.log(`[PROACTIVE] Generated ${totalRecs} recommendations for ${uniqueUserIds.length} users`);

    return new Response(JSON.stringify({ success: true, users: uniqueUserIds.length, recommendations: totalRecs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[PROACTIVE] Error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
