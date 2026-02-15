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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pick pending steps that are due
    const { data: steps, error: fetchErr } = await supabase
      .from("journey_steps")
      .select("*, journey_enrollments!inner(journey_id, contact_id, status, workspace_id)")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!steps || steps.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let processed = 0;
    let skipped = 0;

    for (const step of steps) {
      if (step.journey_enrollments?.status !== "active") continue;

      const journeyId = step.journey_enrollments.journey_id;
      const contactId = step.journey_enrollments.contact_id;
      const workspaceId = step.journey_enrollments.workspace_id || step.workspace_id;

      try {
        // Mark step as running
        await supabase.from("journey_steps").update({ status: "running" }).eq("id", step.id);

        // Get the node config
        const { data: node } = await supabase
          .from("journey_nodes")
          .select("*")
          .eq("journey_id", journeyId)
          .eq("node_id", step.node_id)
          .single();

        if (!node) {
          await supabase.from("journey_steps").update({ status: "failed", error: "Node not found" }).eq("id", step.id);
          continue;
        }

        // Get journey config for scheduling/suppression
        const { data: journey } = await supabase
          .from("journeys")
          .select("scheduling_config, suppression_rules")
          .eq("id", journeyId)
          .single();

        const schedulingConfig = journey?.scheduling_config || {};
        const suppressionRules = journey?.suppression_rules || {};

        // --- SUPPRESSION CHECK ---
        if (suppressionRules.skip_unsubscribed) {
          const { data: contact } = await supabase
            .from("engage_contacts")
            .select("unsubscribed")
            .eq("id", contactId)
            .single();

          if (contact?.unsubscribed) {
            await supabase.from("journey_steps").update({
              status: "done",
              output: { skipped: true, reason: "contact_unsubscribed" },
              executed_at: new Date().toISOString(),
            }).eq("id", step.id);
            skipped++;
            continue;
          }
        }

        // --- SCHEDULING WINDOW CHECK ---
        if (schedulingConfig.send_window_enabled && node.type === "send_email") {
          const startHour = schedulingConfig.send_window_start || 9;
          const endHour = schedulingConfig.send_window_end || 18;
          const now = new Date();
          const currentHour = now.getUTCHours(); // Simplified: use UTC

          if (currentHour < startHour || currentHour >= endHour) {
            // Reschedule to next valid window
            const nextSend = new Date();
            if (currentHour >= endHour) {
              nextSend.setUTCDate(nextSend.getUTCDate() + 1);
            }
            nextSend.setUTCHours(startHour, 0, 0, 0);

            await supabase.from("journey_steps").update({
              status: "pending",
              scheduled_for: nextSend.toISOString(),
            }).eq("id", step.id);
            skipped++;
            continue;
          }
        }

        // --- FREQUENCY CAP CHECK ---
        if (schedulingConfig.frequency_cap_enabled && node.type === "send_email") {
          const maxPerDay = schedulingConfig.max_emails_per_day || 3;
          const dayAgo = new Date(Date.now() - 24 * 3600000).toISOString();

          const { count } = await supabase
            .from("email_messages")
            .select("*", { count: "exact", head: true })
            .eq("contact_id", contactId)
            .gte("queued_at", dayAgo);

          if ((count || 0) >= maxPerDay) {
            // Reschedule to tomorrow
            const tomorrow = new Date(Date.now() + 24 * 3600000);
            await supabase.from("journey_steps").update({
              status: "pending",
              scheduled_for: tomorrow.toISOString(),
              output: { delayed: true, reason: "frequency_cap" },
            }).eq("id", step.id);
            skipped++;
            continue;
          }
        }

        // --- EXECUTE NODE ---
        switch (node.type) {
          case "send_email": {
            const templateId = node.config?.template_id;
            if (templateId) {
              const { data: template } = await supabase.from("email_templates").select("*").eq("id", templateId).single();
              if (template) {
                const { data: contact } = await supabase.from("engage_contacts").select("*").eq("id", contactId).single();
                let html = template.body_html;
                let subject = template.subject;
                if (contact) {
                  const vars: Record<string, string> = { first_name: contact.first_name || "", last_name: contact.last_name || "", email: contact.email };
                  for (const [k, v] of Object.entries(vars)) {
                    html = html.replace(new RegExp(`{{${k}}}`, "g"), v);
                    subject = subject.replace(new RegExp(`{{${k}}}`, "g"), v);
                  }
                }
                await supabase.from("email_messages").insert({
                  workspace_id: workspaceId, contact_id: contactId, to_email: contact?.email || "",
                  subject, body_html: html, status: "queued", queued_at: new Date().toISOString(),
                });
              }
            }
            break;
          }

          case "wait": {
            const duration = parseInt(node.config?.duration || "1", 10);
            const unit = node.config?.unit || "days";
            let ms = duration * 3600000; // default hours
            if (unit === "days") ms = duration * 86400000;
            if (unit === "minutes") ms = duration * 60000;
            const nextTime = new Date(Date.now() + ms).toISOString();

            const { data: edges } = await supabase.from("journey_edges").select("target_node_id").eq("journey_id", journeyId).eq("source_node_id", step.node_id);
            if (edges && edges.length > 0) {
              await supabase.from("journey_steps").insert({
                workspace_id: workspaceId, enrollment_id: step.enrollment_id,
                node_id: edges[0].target_node_id, status: "pending", scheduled_for: nextTime, output: {},
              });
            }
            break;
          }

          case "condition": {
            const { data: contact } = await supabase.from("engage_contacts").select("*").eq("id", contactId).single();
            const field = node.config?.field || "";
            const op = node.config?.operator || "equals";
            const value = node.config?.value || "";
            let result = false;
            if (contact) {
              const actual = contact.attributes?.[field] || (contact as any)[field] || "";
              switch (op) {
                case "equals": result = actual === value; break;
                case "contains": result = String(actual).includes(value); break;
                case "not_equals": result = actual !== value; break;
                case "gt": result = Number(actual) > Number(value); break;
                case "lt": result = Number(actual) < Number(value); break;
                case "includes": result = Array.isArray(actual) && actual.includes(value); break;
                default: result = false;
              }
            }

            const { data: edges } = await supabase.from("journey_edges").select("target_node_id, condition_label").eq("journey_id", journeyId).eq("source_node_id", step.node_id);
            const yesLabels = ["true", "yes", "Yes"];
            const noLabels = ["false", "no", "No"];
            const matchEdge = edges?.find(e =>
              (result && yesLabels.includes(e.condition_label || "")) ||
              (!result && noLabels.includes(e.condition_label || ""))
            ) || edges?.[0];

            if (matchEdge) {
              await supabase.from("journey_steps").insert({
                workspace_id: workspaceId, enrollment_id: step.enrollment_id,
                node_id: matchEdge.target_node_id, status: "pending", scheduled_for: new Date().toISOString(), output: { condition_result: result },
              });
            }
            break;
          }

          case "update_contact": {
            const updates: Record<string, any> = {};
            if (node.config?.set_tag) {
              const { data: contact } = await supabase.from("engage_contacts").select("tags").eq("id", contactId).single();
              const tags = contact?.tags || [];
              if (!tags.includes(node.config.set_tag)) updates.tags = [...tags, node.config.set_tag];
            }
            if (node.config?.set_field && node.config?.set_value) {
              const { data: contact } = await supabase.from("engage_contacts").select("attributes").eq("id", contactId).single();
              const attrs = contact?.attributes || {};
              attrs[node.config.set_field] = node.config.set_value;
              updates.attributes = attrs;
            }
            if (Object.keys(updates).length > 0) {
              await supabase.from("engage_contacts").update(updates).eq("id", contactId);
            }
            break;
          }

          case "webhook": {
            const url = node.config?.url;
            if (url) {
              const { data: contact } = await supabase.from("engage_contacts").select("email, first_name, last_name, attributes").eq("id", contactId).single();
              await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact_id: contactId, node_id: step.node_id, contact, journey_id: journeyId }),
              });
            }
            break;
          }

          case "end": {
            await supabase.from("journey_enrollments").update({
              status: "completed", updated_at: new Date().toISOString(),
            }).eq("id", step.enrollment_id);
            break;
          }
        }

        // Mark step done
        await supabase.from("journey_steps").update({
          status: "done", executed_at: new Date().toISOString(),
        }).eq("id", step.id);

        // Advance to next node (for non-branching types)
        if (!["wait", "condition", "end"].includes(node.type)) {
          const { data: edges } = await supabase.from("journey_edges").select("target_node_id").eq("journey_id", journeyId).eq("source_node_id", step.node_id);
          if (edges && edges.length > 0) {
            await supabase.from("journey_steps").insert({
              workspace_id: workspaceId, enrollment_id: step.enrollment_id,
              node_id: edges[0].target_node_id, status: "pending", scheduled_for: new Date().toISOString(), output: {},
            });
          }
        }

        // Log activity
        await supabase.from("engage_activity_log").insert({
          workspace_id: workspaceId, contact_id: contactId, channel: "journey",
          type: `journey_step_${node.type}`, message: `Journey step ${node.type} executed for node ${step.node_id}`,
          payload: { step_id: step.id, node_type: node.type, journey_id: journeyId },
        });

        processed++;
      } catch (e) {
        await supabase.from("journey_steps").update({
          status: "failed", error: e.message, executed_at: new Date().toISOString(),
        }).eq("id", step.id);
      }
    }

    return new Response(JSON.stringify({ processed, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
