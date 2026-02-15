import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const headers = {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };

    const supabase = createClient(baseUrl, serviceKey);
    const results: Record<string, any> = {};

    // 1. Process queued emails
    const emailRes = await fetch(`${baseUrl}/functions/v1/engage-email-send`, {
      method: "POST",
      headers,
    });
    results.email = await emailRes.json();

    // 2. Process journey steps
    const journeyRes = await fetch(`${baseUrl}/functions/v1/engage-journey-processor`, {
      method: "POST",
      headers,
    });
    results.journey = await journeyRes.json();

    // 3. Process social posts
    const socialRes = await fetch(`${baseUrl}/functions/v1/engage-social-poster`, {
      method: "POST",
      headers,
    });
    results.social = await socialRes.json();

    // 4. Evaluate automation triggers
    try {
      const { data: automations } = await supabase
        .from("engage_automations")
        .select("*")
        .eq("status", "active");

      let automationResults = { evaluated: 0, triggered: 0 };

      if (automations && automations.length > 0) {
        for (const automation of automations) {
          automationResults.evaluated++;
          const trigger = automation.trigger_config || {};
          const actions = automation.actions || [];

          if (trigger.type === "tag_added" && trigger.tag) {
            // Check for recent tag_added events (last 5 min)
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data: events } = await supabase
              .from("engage_events")
              .select("contact_id")
              .eq("workspace_id", automation.workspace_id)
              .eq("type", "tag_added")
              .gte("occurred_at", fiveMinAgo);

            if (events && events.length > 0) {
              for (const event of events) {
                for (const action of actions) {
                  if (action.type === "add_tag" && action.tag) {
                    await supabase.rpc("evaluate_segment", { p_segment_id: action.tag });
                  }
                }
                automationResults.triggered++;
              }
            }
          }

          if (trigger.type === "segment_entry" && trigger.segment_id) {
            // Re-evaluate segment to catch new entries
            await supabase.rpc("evaluate_segment", { p_segment_id: trigger.segment_id });
            automationResults.triggered++;
          }
        }
      }

      results.automations = automationResults;
    } catch (e) {
      results.automations = { error: e.message };
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});