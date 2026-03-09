import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { gap_ids } = await req.json();
    if (!Array.isArray(gap_ids) || gap_ids.length === 0) {
      return new Response(JSON.stringify({ error: "gap_ids array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch gaps
    const { data: gaps } = await supabase
      .from("content_gaps")
      .select("*")
      .in("id", gap_ids)
      .eq("user_id", userId);

    // Fetch clusters for context
    const { data: clusters } = await supabase
      .from("topic_clusters")
      .select("*")
      .eq("user_id", userId);

    if (!gaps || gaps.length === 0) {
      return new Response(JSON.stringify({ error: "No gaps found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's active AI provider
    const { data: providers } = await supabase
      .from("ai_service_providers")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("priority", { ascending: true })
      .limit(1);

    if (!providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active AI provider configured. Please set up an API key in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = providers[0];

    // Build prompt
    const gapSummary = gaps.map((g: any) => `- ${g.title} (score: ${g.opportunity_score ?? "N/A"}, type: ${g.gap_type})`).join("\n");
    const clusterSummary = clusters?.length
      ? clusters.map((c: any) => `- ${c.cluster_name} (importance: ${c.importance_score ?? "N/A"})`).join("\n")
      : "No clusters defined.";

    const systemPrompt = `You are a content strategy advisor. Given content gaps and topic clusters, generate exactly 3 actionable strategy recommendations. Return pure JSON array with objects having: title, description, recommendation_type (one of: "content_creation", "optimization", "topic_expansion", "competitive"), priority ("high"/"medium"/"low"), confidence_score (0-1), effort_estimate ("low"/"medium"/"high"), expected_impact (short string), reasoning (1 sentence).`;

    const userPrompt = `Content Gaps:\n${gapSummary}\n\nTopic Clusters:\n${clusterSummary}\n\nGenerate 3 strategy recommendations.`;

    // Call ai-proxy
    const { data: aiData, error: aiError } = await supabase.functions.invoke("ai-proxy", {
      body: JSON.stringify({
        service: provider.provider,
        endpoint: "chat",
        params: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: provider.preferred_model || "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 1500,
        },
        apiKey: provider.api_key,
      }),
    });

    if (aiError) {
      console.error("AI proxy error:", aiError);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = aiData?.choices?.[0]?.message?.content || "[]";
    let recommendations: any[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      recommendations = JSON.parse(cleaned);
      if (!Array.isArray(recommendations)) recommendations = [recommendations];
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert recommendations
    const toInsert = recommendations.slice(0, 3).map((rec: any) => ({
      user_id: userId,
      title: rec.title || "Strategy Recommendation",
      description: rec.description || "",
      recommendation_type: rec.recommendation_type || "content_creation",
      priority: rec.priority || "medium",
      confidence_score: typeof rec.confidence_score === "number" ? rec.confidence_score : 0.7,
      effort_estimate: rec.effort_estimate || "medium",
      expected_impact: rec.expected_impact || null,
      reasoning: rec.reasoning || null,
      status: "pending",
      related_gap_id: gaps[0]?.id || null,
      related_cluster_id: gaps[0]?.target_cluster_id || null,
      data_sources: { related_gap_ids: gap_ids },
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from("strategy_recommendations")
      .insert(toInsert)
      .select();

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return new Response(JSON.stringify({ error: "Failed to save recommendations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ recommendations: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
