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

    // 4. Evaluate automation triggers with rate limiting + audit logging
    try {
      const { data: automations } = await supabase
        .from("engage_automations")
        .select("*")
        .eq("status", "active");

      let automationResults = { evaluated: 0, triggered: 0, rate_limited: 0 };

      if (automations && automations.length > 0) {
        for (const automation of automations) {
          automationResults.evaluated++;
          const trigger = automation.trigger_config || {};
          const actions = automation.actions || [];
          const rateLimit = automation.rate_limit || {};
          const startTime = Date.now();

          // Rate limit check
          if (rateLimit.max_per_day) {
            const dayAgo = new Date(Date.now() - 24 * 3600000).toISOString();
            const { count } = await supabase
              .from("automation_runs")
              .select("*", { count: "exact", head: true })
              .eq("automation_id", automation.id)
              .gte("created_at", dayAgo);

            if ((count || 0) >= rateLimit.max_per_day) {
              automationResults.rate_limited++;
              continue;
            }
          }

          let contactsTriggered: string[] = [];

          if (trigger.type === "tag_added" && trigger.tag) {
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data: events } = await supabase
              .from("engage_events")
              .select("contact_id")
              .eq("workspace_id", automation.workspace_id)
              .eq("type", "tag_added")
              .gte("occurred_at", fiveMinAgo);

            contactsTriggered = (events || []).map((e: any) => e.contact_id);
          }

          if (trigger.type === "segment_entry" && trigger.segment_id) {
            await supabase.rpc("evaluate_segment", { p_segment_id: trigger.segment_id });
            automationResults.triggered++;
          }

          if (trigger.type === "contact_created") {
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data: contacts } = await supabase
              .from("engage_contacts")
              .select("id")
              .eq("workspace_id", automation.workspace_id)
              .gte("created_at", fiveMinAgo);

            contactsTriggered = (contacts || []).map((c: any) => c.id);
          }

          if (trigger.type === "email_opened") {
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data: logs } = await supabase
              .from("engage_activity_log")
              .select("contact_id")
              .eq("workspace_id", automation.workspace_id)
              .eq("type", "email_opened")
              .gte("created_at", fiveMinAgo);

            contactsTriggered = (logs || []).map((l: any) => l.contact_id).filter(Boolean);
          }

          // Execute actions for triggered contacts
          for (const contactId of contactsTriggered) {
            const actionsExecuted: any[] = [];

            // Per-contact rate limit check
            if (rateLimit.max_per_contact_per_day) {
              const dayAgo = new Date(Date.now() - 24 * 3600000).toISOString();
              const { count } = await supabase
                .from("automation_runs")
                .select("*", { count: "exact", head: true })
                .eq("automation_id", automation.id)
                .eq("contact_id", contactId)
                .gte("created_at", dayAgo);

              if ((count || 0) >= rateLimit.max_per_contact_per_day) {
                automationResults.rate_limited++;
                continue;
              }
            }

            try {
              for (const action of actions) {
                if (action.type === "add_tag" && action.tag) {
                  const { data: contact } = await supabase
                    .from("engage_contacts")
                    .select("tags")
                    .eq("id", contactId)
                    .single();
                  const tags = contact?.tags || [];
                  if (!tags.includes(action.tag)) {
                    await supabase.from("engage_contacts")
                      .update({ tags: [...tags, action.tag] })
                      .eq("id", contactId);
                  }
                  actionsExecuted.push({ type: "add_tag", tag: action.tag });
                }

                if (action.type === "remove_tag" && action.tag) {
                  const { data: contact } = await supabase
                    .from("engage_contacts")
                    .select("tags")
                    .eq("id", contactId)
                    .single();
                  const tags = (contact?.tags || []).filter((t: string) => t !== action.tag);
                  await supabase.from("engage_contacts").update({ tags }).eq("id", contactId);
                  actionsExecuted.push({ type: "remove_tag", tag: action.tag });
                }

                if (action.type === "send_email" && action.template_id) {
                  const { data: template } = await supabase
                    .from("email_templates")
                    .select("*")
                    .eq("id", action.template_id)
                    .single();

                  if (template) {
                    const { data: contact } = await supabase
                      .from("engage_contacts")
                      .select("email, first_name, last_name")
                      .eq("id", contactId)
                      .single();

                    if (contact) {
                      let html = template.body_html;
                      let subject = template.subject;
                      const vars: Record<string, string> = { first_name: contact.first_name || "", last_name: contact.last_name || "", email: contact.email };
                      for (const [k, v] of Object.entries(vars)) {
                        html = html.replace(new RegExp(`{{${k}}}`, "g"), v);
                        subject = subject.replace(new RegExp(`{{${k}}}`, "g"), v);
                      }

                      await supabase.from("email_messages").insert({
                        workspace_id: automation.workspace_id,
                        contact_id: contactId,
                        to_email: contact.email,
                        subject,
                        body_html: html,
                        status: "queued",
                        queued_at: new Date().toISOString(),
                      });
                      actionsExecuted.push({ type: "send_email", template_id: action.template_id });
                    }
                  }
                }

                if (action.type === "enroll_journey" && action.journey_id) {
                  await supabase.from("journey_enrollments").insert({
                    workspace_id: automation.workspace_id,
                    journey_id: action.journey_id,
                    contact_id: contactId,
                    status: "active",
                  });
                  actionsExecuted.push({ type: "enroll_journey", journey_id: action.journey_id });
                }

                if (action.type === "update_field" && action.field && action.value !== undefined) {
                  const { data: contact } = await supabase
                    .from("engage_contacts")
                    .select("attributes")
                    .eq("id", contactId)
                    .single();
                  const attrs = contact?.attributes || {};
                  attrs[action.field] = action.value;
                  await supabase.from("engage_contacts").update({ attributes: attrs }).eq("id", contactId);
                  actionsExecuted.push({ type: "update_field", field: action.field });
                }

                if (action.type === "webhook" && action.url) {
                  await fetch(action.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ automation_id: automation.id, contact_id: contactId, trigger }),
                  });
                  actionsExecuted.push({ type: "webhook", url: action.url });
                }

                // Wait action: just a delay marker, skipped in automation context
                if (action.type === "wait") {
                  actionsExecuted.push({ type: "wait", duration: action.duration, unit: action.unit });
                }
              }

              // Log automation run
              const durationMs = Date.now() - startTime;
              await supabase.from("automation_runs").insert({
                workspace_id: automation.workspace_id,
                automation_id: automation.id,
                contact_id: contactId,
                trigger_event: trigger,
                actions_executed: actionsExecuted,
                status: "success",
                duration_ms: durationMs,
              });

              automationResults.triggered++;
            } catch (actionErr: any) {
              // Log failed run
              await supabase.from("automation_runs").insert({
                workspace_id: automation.workspace_id,
                automation_id: automation.id,
                contact_id: contactId,
                trigger_event: trigger,
                actions_executed: actionsExecuted,
                status: "failed",
                error: actionErr.message,
                duration_ms: Date.now() - startTime,
              });
            }
          }

          // Update automation last triggered
          if (contactsTriggered.length > 0) {
            await supabase.from("engage_automations").update({
              updated_at: new Date().toISOString(),
            }).eq("id", automation.id);
          }
        }
      }

      results.automations = automationResults;
    } catch (e: any) {
      results.automations = { error: e.message };
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
