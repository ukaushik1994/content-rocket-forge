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

    const body = await req.json();
    const { use_case, content, platform, topic, tone, message_context, workspace_id } = body;

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

    let systemPrompt = "";
    let userPrompt = "";

    switch (use_case) {
      case "generate_posts": {
        systemPrompt = `You are an expert social media manager. Generate engaging, platform-optimized posts.
Return a JSON object with platform keys:
{
  "twitter": { "content": "...(max 280 chars)", "hashtags": ["..."] },
  "linkedin": { "content": "...(max 3000 chars, professional)", "hashtags": ["..."] },
  "instagram": { "content": "...(max 2200 chars, with emoji)", "hashtags": ["..."] },
  "facebook": { "content": "...(conversational, engaging)", "hashtags": ["..."] }
}
Only return valid JSON.`;
        userPrompt = `Create social posts about: ${topic || content || ""}
Tone: ${tone || "engaging and professional"}
${platform ? `Focus on: ${platform}` : "Generate for all platforms."}`;
        break;
      }

      case "repurpose_email": {
        systemPrompt = `You are a content repurposing expert. Convert email content into social media posts.
Return a JSON object with platform keys:
{
  "twitter": { "content": "...(max 280 chars)", "hashtags": ["..."] },
  "linkedin": { "content": "...(max 3000 chars)", "hashtags": ["..."] },
  "instagram": { "content": "...(max 2200 chars)", "hashtags": ["..."] },
  "facebook": { "content": "...(engaging)", "hashtags": ["..."] }
}
Extract key message, adapt tone per platform. Only return valid JSON.`;
        userPrompt = `Repurpose this email into social posts:\n\n${content || ""}`;
        break;
      }

      case "best_time": {
        systemPrompt = `You are a social media timing expert. Recommend optimal posting times.
Return a JSON object:
{
  "recommendations": [
    { "platform": "twitter"|"linkedin"|"instagram"|"facebook", "day": "Monday-Sunday", "time": "HH:MM", "timezone": "UTC", "reason": "..." }
  ],
  "general_tip": "..."
}
Only return valid JSON.`;
        userPrompt = `Recommend best posting times${platform ? ` for ${platform}` : " for all platforms"}.
Consider general best practices for B2B and B2C audiences.`;
        break;
      }

      case "hashtags": {
        systemPrompt = `You are a hashtag strategy expert. Suggest relevant hashtags categorized by reach.
Return a JSON object:
{
  "high_reach": ["#tag1", "#tag2"],
  "niche": ["#tag1", "#tag2"],
  "trending": ["#tag1", "#tag2"],
  "branded": ["#tag1", "#tag2"]
}
5 tags per category max. Only return valid JSON.`;
        userPrompt = `Suggest hashtags for: ${content || topic || ""}
${platform ? `Platform: ${platform}` : ""}`;
        break;
      }

      case "suggest_reply": {
        systemPrompt = `You are a social media community manager. Suggest reply options.
Return a JSON array of 3 reply options:
[
  { "tone": "professional", "reply": "..." },
  { "tone": "friendly", "reply": "..." },
  { "tone": "witty", "reply": "..." }
]
Keep replies concise and on-brand. Only return valid JSON array.`;
        userPrompt = `Suggest replies to this social message:\n"${message_context || content || ""}"`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown use_case: ${use_case}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

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
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
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

    let result;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      result = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      result = { content: aiContent, parse_error: true };
    }

    return new Response(JSON.stringify({ success: true, use_case, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("engage-ai-social error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
