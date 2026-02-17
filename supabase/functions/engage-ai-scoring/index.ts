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

    const { use_case, workspace_id, contact_ids } = await req.json();

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

    // Fetch contacts to score (batch of 50 max)
    let contactQuery = supabase
      .from("engage_contacts")
      .select("id, email, first_name, last_name, tags, created_at, unsubscribed")
      .eq("workspace_id", workspace_id)
      .eq("unsubscribed", false)
      .limit(50);

    if (contact_ids?.length) {
      contactQuery = contactQuery.in("id", contact_ids);
    }

    const { data: contacts } = await contactQuery;
    if (!contacts?.length) {
      return new Response(JSON.stringify({ success: true, scored: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather engagement signals for each contact
    const contactSignals = [];
    for (const contact of contacts) {
      const [emailActivity, events, journeys] = await Promise.all([
        supabase.from("email_messages").select("status, sent_at").eq("workspace_id", workspace_id).eq("contact_id", contact.id).limit(50),
        supabase.from("engage_events").select("type, occurred_at").eq("workspace_id", workspace_id).eq("contact_id", contact.id).order("occurred_at", { ascending: false }).limit(20),
        supabase.from("journey_enrollments").select("status").eq("workspace_id", workspace_id).eq("contact_id", contact.id),
      ]);

      contactSignals.push({
        id: contact.id,
        email: contact.email,
        name: [contact.first_name, contact.last_name].filter(Boolean).join(" "),
        tags: contact.tags || [],
        created_at: contact.created_at,
        emails_received: (emailActivity.data || []).length,
        emails_delivered: (emailActivity.data || []).filter((e: any) => e.status === "delivered" || e.status === "sent").length,
        recent_events: (events.data || []).length,
        last_event: events.data?.[0]?.occurred_at || null,
        journey_enrollments: (journeys.data || []).length,
        journeys_completed: (journeys.data || []).filter((j: any) => j.status === "completed").length,
      });
    }

    const systemPrompt = `You are a contact scoring AI. Score each contact 0-100 based on engagement signals.
For each contact return: { "id": "...", "score": 0-100, "churn_risk": "low"|"medium"|"high"|"critical", "actions": ["..."] }
Scoring factors: email engagement, event frequency, journey completion, recency, tag richness.
Return a JSON array of scored contacts. Only valid JSON, no explanation.`;

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
            { role: "user", content: `Score these contacts:\n${JSON.stringify(contactSignals, null, 2)}` },
          ],
          temperature: 0.3,
          max_tokens: 2000,
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

    let scores;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      scores = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI scores", raw: aiContent }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert scores
    const scoreRows = (Array.isArray(scores) ? scores : []).map((s: any) => ({
      workspace_id,
      contact_id: s.id,
      engagement_score: Math.min(100, Math.max(0, s.score || 0)),
      churn_risk: ["low", "medium", "high", "critical"].includes(s.churn_risk) ? s.churn_risk : "low",
      scoring_factors: { signals: contactSignals.find((c) => c.id === s.id) || {} },
      recommended_actions: s.actions || [],
      computed_at: new Date().toISOString(),
    }));

    if (scoreRows.length > 0) {
      for (const row of scoreRows) {
        await supabase.from("engage_contact_scores").upsert(row, { onConflict: "workspace_id,contact_id" });
      }
    }

    return new Response(JSON.stringify({ success: true, scored: scoreRows.length, scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("engage-ai-scoring error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
