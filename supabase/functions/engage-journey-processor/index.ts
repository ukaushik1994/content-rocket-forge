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
      .select("*, journey_enrollments!inner(journey_id, contact_id, status)")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!steps || steps.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let processed = 0;

    for (const step of steps) {
      if (step.journey_enrollments?.status !== "active") continue;

      try {
        // Mark step as running
        await supabase.from("journey_steps").update({ status: "running" }).eq("id", step.id);

        // Get the node config
        const { data: node } = await supabase
          .from("journey_nodes")
          .select("*")
          .eq("journey_id", step.journey_enrollments.journey_id)
          .eq("node_id", step.node_id)
          .single();

        if (!node) {
          await supabase.from("journey_steps").update({ status: "failed", error: "Node not found" }).eq("id", step.id);
          continue;
        }

        const journeyId = step.journey_enrollments.journey_id;
        const contactId = step.journey_enrollments.contact_id;

        switch (node.type) {
          case "send_email": {
            const templateId = node.config?.template_id;
            if (templateId) {
              const { data: template } = await supabase
                .from("email_templates")
                .select("*")
                .eq("id", templateId)
                .single();

              if (template) {
                const { data: contact } = await supabase
                  .from("engage_contacts")
                  .select("*")
                  .eq("id", contactId)
                  .single();

                let html = template.body_html;
                let subject = template.subject;
                if (contact) {
                  const vars: Record<string, string> = {
                    first_name: contact.first_name || "",
                    last_name: contact.last_name || "",
                    email: contact.email,
                  };
                  for (const [k, v] of Object.entries(vars)) {
                    html = html.replace(new RegExp(`{{${k}}}`, "g"), v);
                    subject = subject.replace(new RegExp(`{{${k}}}`, "g"), v);
                  }
                }

                await supabase.from("email_messages").insert({
                  workspace_id: step.workspace_id,
                  contact_id: contactId,
                  to_email: contact?.email || "",
                  subject,
                  body_html: html,
                  status: "queued",
                  queued_at: new Date().toISOString(),
                });
              }
            }
            break;
          }

          case "wait": {
            // Wait node: duration is in hours
            const hours = node.config?.duration_hours || 24;
            const nextTime = new Date(Date.now() + hours * 3600000).toISOString();
            // Find next node via edges
            const { data: edges } = await supabase
              .from("journey_edges")
              .select("target_node_id")
              .eq("journey_id", journeyId)
              .eq("source_node_id", step.node_id);

            if (edges && edges.length > 0) {
              await supabase.from("journey_steps").insert({
                workspace_id: step.workspace_id,
                enrollment_id: step.enrollment_id,
                node_id: edges[0].target_node_id,
                status: "pending",
                scheduled_for: nextTime,
                output: {},
              });
            }
            break;
          }

          case "condition": {
            // Simple condition: check contact attribute
            const { data: contact } = await supabase
              .from("engage_contacts")
              .select("*")
              .eq("id", contactId)
              .single();

            const field = node.config?.field || "";
            const op = node.config?.operator || "equals";
            const value = node.config?.value || "";
            let result = false;

            if (contact) {
              const actual = contact.attributes?.[field] || "";
              switch (op) {
                case "equals": result = actual === value; break;
                case "contains": result = String(actual).includes(value); break;
                case "not_equals": result = actual !== value; break;
                default: result = false;
              }
            }

            // Find matching edge
            const { data: edges } = await supabase
              .from("journey_edges")
              .select("target_node_id, condition_label")
              .eq("journey_id", journeyId)
              .eq("source_node_id", step.node_id);

            const matchEdge = edges?.find(e =>
              (result && e.condition_label === "true") ||
              (!result && e.condition_label === "false")
            ) || edges?.[0];

            if (matchEdge) {
              await supabase.from("journey_steps").insert({
                workspace_id: step.workspace_id,
                enrollment_id: step.enrollment_id,
                node_id: matchEdge.target_node_id,
                status: "pending",
                scheduled_for: new Date().toISOString(),
                output: {},
              });
            }
            break;
          }

          case "update_contact": {
            const updates: Record<string, any> = {};
            if (node.config?.set_tag) {
              const { data: contact } = await supabase
                .from("engage_contacts")
                .select("tags")
                .eq("id", contactId)
                .single();
              const tags = contact?.tags || [];
              if (!tags.includes(node.config.set_tag)) {
                updates.tags = [...tags, node.config.set_tag];
              }
            }
            if (Object.keys(updates).length > 0) {
              await supabase.from("engage_contacts").update(updates).eq("id", contactId);
            }
            break;
          }

          case "webhook": {
            const url = node.config?.url;
            if (url) {
              await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact_id: contactId, node_id: step.node_id }),
              });
            }
            break;
          }

          case "end": {
            await supabase.from("journey_enrollments").update({
              status: "completed",
              updated_at: new Date().toISOString(),
            }).eq("id", step.enrollment_id);
            break;
          }
        }

        // Mark step done
        await supabase.from("journey_steps").update({
          status: "done",
          executed_at: new Date().toISOString(),
        }).eq("id", step.id);

        // If not wait/condition/end, advance to next node
        if (!["wait", "condition", "end"].includes(node.type)) {
          const { data: edges } = await supabase
            .from("journey_edges")
            .select("target_node_id")
            .eq("journey_id", journeyId)
            .eq("source_node_id", step.node_id);

          if (edges && edges.length > 0) {
            await supabase.from("journey_steps").insert({
              workspace_id: step.workspace_id,
              enrollment_id: step.enrollment_id,
              node_id: edges[0].target_node_id,
              status: "pending",
              scheduled_for: new Date().toISOString(),
              output: {},
            });
          }
        }

        // Log activity
        await supabase.from("engage_activity_log").insert({
          workspace_id: step.workspace_id,
          contact_id: contactId,
          channel: "journey",
          type: `journey_step_${node.type}`,
          message: `Journey step ${node.type} executed for node ${step.node_id}`,
          payload: { step_id: step.id, node_type: node.type },
        });

        processed++;
      } catch (e) {
        await supabase.from("journey_steps").update({
          status: "failed",
          error: e.message,
          executed_at: new Date().toISOString(),
        }).eq("id", step.id);
      }
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
