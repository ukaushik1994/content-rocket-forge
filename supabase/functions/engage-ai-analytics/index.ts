import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { use_case, workspace_id, period } = await req.json();

    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "Missing workspace_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get AI provider
    const { data: provider } = await supabase
      .from("ai_service_providers")
      .select("provider, api_key")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("priority", { ascending: true })
      .limit(1)
      .single();

    if (!provider) {
      return new Response(JSON.stringify({ error: "No AI provider configured. Please set up an AI provider in Settings." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const days = period === "weekly" ? 7 : 1;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Gather workspace data
    const [emailStats, journeyStats, automationStats, contactStats, activityStats] = await Promise.all([
      supabase.from("email_messages").select("status", { count: "exact" }).eq("workspace_id", workspace_id).gte("queued_at", since),
      supabase.from("journey_enrollments").select("status", { count: "exact" }).eq("workspace_id", workspace_id).gte("enrolled_at", since),
      supabase.from("automation_runs").select("status", { count: "exact" }).eq("workspace_id", workspace_id).gte("created_at", since),
      supabase.from("engage_contacts").select("id", { count: "exact" }).eq("workspace_id", workspace_id).gte("created_at", since),
      supabase.from("engage_activity_log").select("channel, type", { count: "exact" }).eq("workspace_id", workspace_id).gte("created_at", since),
    ]);

    // Count statuses
    const emailData = emailStats.data || [];
    const emailSent = emailData.filter((e: any) => e.status === "sent" || e.status === "delivered").length;
    const emailFailed = emailData.filter((e: any) => e.status === "failed").length;
    const emailQueued = emailData.filter((e: any) => e.status === "queued").length;

    const automationData = automationStats.data || [];
    const autoSuccess = automationData.filter((a: any) => a.status === "success").length;
    const autoFailed = automationData.filter((a: any) => a.status === "failed").length;

    const summaryData = {
      period: period || "daily",
      emails: { total: emailData.length, sent: emailSent, failed: emailFailed, queued: emailQueued },
      journeys: { enrollments: journeyStats.count || 0 },
      automations: { total: automationData.length, success: autoSuccess, failed: autoFailed },
      contacts: { new: contactStats.count || 0 },
      activity: { total: activityStats.count || 0 },
    };

    if (use_case === "briefing") {
      const systemPrompt = `You are an AI marketing analyst. Generate a concise daily briefing from workspace metrics.
Return a JSON object:
{
  "summary": "2-3 sentence narrative summary of the period",
  "insights": [
    { "type": "positive"|"warning"|"neutral", "text": "..." }
  ],
  "actions": [
    { "priority": "high"|"medium"|"low", "text": "...", "action_type": "create_campaign"|"edit_journey"|"review_contacts"|"check_deliverability"|"general" }
  ]
}
Max 3 insights and 3 actions. Be specific and actionable. Only return valid JSON.`;

      const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          service: provider.provider,
          endpoint: "chat",
          apiKey: provider.api_key,
          params: {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate a ${period || "daily"} briefing from these metrics:\n${JSON.stringify(summaryData, null, 2)}` },
            ],
            temperature: 0.5,
            max_tokens: 800,
          },
        }),
      });

      const aiData = await aiRes.json();
      let aiContent = "";
      const rd = aiData.data || aiData;
      if (rd.data?.choices?.[0]?.message?.content) aiContent = rd.data.choices[0].message.content;
      else if (rd.data?.content?.[0]?.text) aiContent = rd.data.content[0].text;
      else if (rd.choices?.[0]?.message?.content) aiContent = rd.choices[0].message.content;
      else if (rd.content?.[0]?.text) aiContent = rd.content[0].text;

      let briefing;
      try {
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
        briefing = JSON.parse(jsonMatch[1]!.trim());
      } catch {
        briefing = { summary: aiContent, insights: [], actions: [] };
      }

      // Cache the briefing
      await supabase.from("engage_ai_briefings").insert({
        workspace_id,
        period: period || "daily",
        summary: briefing.summary || "",
        insights: briefing.insights || [],
        actions: briefing.actions || [],
      });

      return new Response(JSON.stringify({ success: true, briefing, metrics: summaryData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (use_case === "next_best_action") {
      // Get more context for NBA
      const { data: campaigns } = await supabase
        .from("email_campaigns")
        .select("name, status, stats")
        .eq("workspace_id", workspace_id)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: journeys } = await supabase
        .from("engage_journeys")
        .select("name, status")
        .eq("workspace_id", workspace_id)
        .eq("status", "active");

      const nbaContext = {
        ...summaryData,
        recent_campaigns: campaigns || [],
        active_journeys: journeys || [],
      };

      const systemPrompt = `You are a marketing strategist AI. Based on workspace data, suggest the top 3 most impactful next actions.
Return a JSON array:
[
  {
    "priority": "high"|"medium"|"low",
    "title": "Short action title",
    "description": "Why this matters and what to do",
    "impact": "Expected impact description",
    "action_type": "create_campaign"|"create_segment"|"edit_journey"|"review_contacts"|"send_email"|"general"
  }
]
Be specific, data-driven, and actionable. Only return valid JSON array.`;

      const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          service: provider.provider,
          endpoint: "chat",
          apiKey: provider.api_key,
          params: {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Suggest next best actions based on:\n${JSON.stringify(nbaContext, null, 2)}` },
            ],
            temperature: 0.5,
            max_tokens: 800,
          },
        }),
      });

      const aiData = await aiRes.json();
      let aiContent = "";
      const rd = aiData.data || aiData;
      if (rd.data?.choices?.[0]?.message?.content) aiContent = rd.data.choices[0].message.content;
      else if (rd.data?.content?.[0]?.text) aiContent = rd.data.content[0].text;
      else if (rd.choices?.[0]?.message?.content) aiContent = rd.choices[0].message.content;
      else if (rd.content?.[0]?.text) aiContent = rd.content[0].text;

      let actions;
      try {
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
        actions = JSON.parse(jsonMatch[1]!.trim());
      } catch {
        actions = [{ priority: "medium", title: "Review metrics", description: aiContent, impact: "Stay informed", action_type: "general" }];
      }

      return new Response(JSON.stringify({ success: true, actions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: return raw metrics
    return new Response(JSON.stringify({ success: true, metrics: summaryData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("engage-ai-analytics error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
