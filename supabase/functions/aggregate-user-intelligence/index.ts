/**
 * aggregate-user-intelligence
 * Builds/updates user_intelligence_profile from:
 *   - content_generation_feedback (edit patterns)
 *   - content_items (top topics, formats)
 *   - content_performance_signals (popular content style)
 *   - ai_conversations (interaction style)
 * Runs on-demand or scheduled daily.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Determine target user(s)
    let userIds: string[] = [];
    
    try {
      const body = await req.json();
      if (body.user_id) userIds = [body.user_id];
    } catch {
      // No body = aggregate for all users with feedback data
    }

    if (userIds.length === 0) {
      // Get all users who have feedback data
      const { data: feedbackUsers } = await supabase
        .from('content_generation_feedback')
        .select('user_id')
        .limit(500);
      
      const { data: contentUsers } = await supabase
        .from('content_items')
        .select('user_id')
        .limit(500);
      
      const allIds = new Set<string>();
      feedbackUsers?.forEach((r: any) => allIds.add(r.user_id));
      contentUsers?.forEach((r: any) => allIds.add(r.user_id));
      userIds = Array.from(allIds);
    }

    let processed = 0;

    for (const userId of userIds) {
      try {
        // 1. Aggregate editing patterns from content_generation_feedback
        const { data: feedback } = await supabase
          .from('content_generation_feedback')
          .select('feedback_data')
          .eq('user_id', userId)
          .eq('feedback_type', 'edit_pattern')
          .order('created_at', { ascending: false })
          .limit(20);

        const editingPatterns: Record<string, boolean> = {};
        let totalRatio = 0;
        let ratioCount = 0;

        if (feedback && feedback.length >= 3) {
          const allPatterns: string[] = feedback.flatMap((f: any) => f.feedback_data?.patterns || []);
          const patternCounts: Record<string, number> = {};
          for (const p of allPatterns) {
            patternCounts[p] = (patternCounts[p] || 0) + 1;
          }
          const threshold = Math.ceil(feedback.length * 0.3);
          for (const [pattern, count] of Object.entries(patternCounts)) {
            if (count >= threshold) editingPatterns[pattern] = true;
          }

          for (const f of feedback) {
            const ratio = f.feedback_data?.lengthRatio;
            if (typeof ratio === 'number') {
              totalRatio += ratio;
              ratioCount++;
            }
          }
        }

        // Determine length preference
        let preferredLength = 'medium';
        if (ratioCount >= 3) {
          const avgRatio = totalRatio / ratioCount;
          if (avgRatio < 0.8) preferredLength = 'short';
          else if (avgRatio > 1.2) preferredLength = 'long';
        }

        // 2. Top topics from content_items
        const { data: contentItems } = await supabase
          .from('content_items')
          .select('title, content_type, metadata')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        const topicCounts: Record<string, number> = {};
        const formatCounts: Record<string, number> = {};

        if (contentItems) {
          for (const item of contentItems) {
            // Extract keywords from metadata
            const kw = (item.metadata as any)?.mainKeyword || (item.metadata as any)?.keyword;
            if (kw) topicCounts[kw] = (topicCounts[kw] || 0) + 1;
            // Track content types
            if (item.content_type) formatCounts[item.content_type] = (formatCounts[item.content_type] || 0) + 1;
          }
        }

        const topTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([t]) => t);

        const preferredFormats = Object.entries(formatCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([f]) => f);

        // 3. Top solutions referenced
        const { data: solutions } = await supabase
          .from('solutions')
          .select('name')
          .eq('user_id', userId)
          .limit(10);

        const topSolutions = solutions?.map((s: any) => s.name) || [];

        // 4. Detect negotiation preference (did user frequently skip?)
        const { data: conversations } = await supabase
          .from('ai_messages')
          .select('content')
          .eq('type', 'user')
          .order('created_at', { ascending: false })
          .limit(50);

        let skipCount = 0;
        let totalContentRequests = 0;
        const skipRegex = /just write|skip questions|don't ask|no questions|quick generate/i;
        const contentRegex = /write|create|generate|draft|blog|article/i;

        if (conversations) {
          for (const msg of conversations) {
            if (contentRegex.test(msg.content)) {
              totalContentRequests++;
              if (skipRegex.test(msg.content)) skipCount++;
            }
          }
        }

        const prefersNegotiation = totalContentRequests < 5 || (skipCount / totalContentRequests) < 0.4;

        // 5. Detect response detail preference
        // Check if user asks for brevity or detail
        let briefCount = 0;
        let detailCount = 0;
        const briefRegex = /keep it short|brief|concise|tldr|tl;dr|summarize|quick/i;
        const detailRegex = /detailed|thorough|in-depth|comprehensive|explain more|elaborate/i;

        if (conversations) {
          for (const msg of conversations) {
            if (briefRegex.test(msg.content)) briefCount++;
            if (detailRegex.test(msg.content)) detailCount++;
          }
        }

        let avgResponseDetail = 'medium';
        if (briefCount > detailCount + 3) avgResponseDetail = 'brief';
        else if (detailCount > briefCount + 3) avgResponseDetail = 'detailed';

        // 6. Brand tone as preferred_tone
        const { data: brand } = await supabase
          .from('brand_guidelines')
          .select('tone')
          .eq('user_id', userId)
          .maybeSingle();

        const preferredTone = (brand?.tone && Array.isArray(brand.tone)) ? brand.tone : [];

        // Upsert the profile
        const profileData = {
          user_id: userId,
          preferred_length: preferredLength,
          preferred_tone: preferredTone,
          preferred_formats: preferredFormats,
          editing_patterns: editingPatterns,
          top_topics: topTopics,
          top_solutions: topSolutions,
          prefers_negotiation: prefersNegotiation,
          avg_response_detail: avgResponseDetail,
          last_aggregated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: existing } = await supabase
          .from('user_intelligence_profile')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_intelligence_profile')
            .update(profileData)
            .eq('user_id', userId);
        } else {
          await supabase
            .from('user_intelligence_profile')
            .insert(profileData);
        }

        processed++;
        console.log(`🧠 Aggregated intelligence profile for user ${userId.slice(0, 8)}...`);
      } catch (userErr) {
        console.warn(`Failed to aggregate profile for user ${userId}:`, userErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed, total: userIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('aggregate-user-intelligence error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
