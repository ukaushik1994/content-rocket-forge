import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_FIELDS = ["email", "first_name", "last_name", "tags", "created_at", "unsubscribed"];
const VALID_OPERATORS = ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "includes", "not_includes", "gt", "lt", "after", "before", "is_empty", "is_not_empty"];

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

    const { description } = await req.json();
    if (!description) {
      return new Response(JSON.stringify({ error: "Missing description" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    const systemPrompt = `You convert natural language segment descriptions into structured JSON rules.

Available fields: ${VALID_FIELDS.join(", ")}
Available operators: ${VALID_OPERATORS.join(", ")}

Field notes:
- "email", "first_name", "last_name" are text fields (use equals, contains, starts_with, ends_with, not_equals)
- "tags" is an array field (use includes, not_includes, is_empty, is_not_empty)
- "created_at" is a timestamp (use gt/after for "after date", lt/before for "before date")
- "unsubscribed" is boolean (use equals with "true" or "false")

Return ONLY a valid JSON object:
{
  "match": "all" | "any",
  "rules": [
    { "field": "...", "operator": "...", "value": "..." }
  ]
}
No explanation, no code fences, just the JSON object.`;

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
            { role: "user", content: `Convert this to segment rules: "${description}"` },
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
      }),
    });

    const aiData = await aiRes.json();

    // Extract content
    let aiContent = "";
    const rd = aiData.data || aiData;
    if (rd.data?.choices?.[0]?.message?.content) aiContent = rd.data.choices[0].message.content;
    else if (rd.data?.content?.[0]?.text) aiContent = rd.data.content[0].text;
    else if (rd.choices?.[0]?.message?.content) aiContent = rd.choices[0].message.content;
    else if (rd.content?.[0]?.text) aiContent = rd.content[0].text;

    // Parse and validate
    let definition;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      definition = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: aiContent }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate fields and operators
    if (definition.rules) {
      definition.rules = definition.rules.filter((r: any) =>
        VALID_FIELDS.includes(r.field) && VALID_OPERATORS.includes(r.operator) && r.value !== undefined
      );
    }

    if (!definition.match) definition.match = "all";

    return new Response(JSON.stringify({ success: true, definition }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("engage-ai-segments error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
