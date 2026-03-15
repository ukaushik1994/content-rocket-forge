import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getApiKey } from "../shared/apiKeyService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getResendKey(supabase: any, workspaceId: string): Promise<string | null> {
  const envKey = Deno.env.get("RESEND_API_KEY");
  if (envKey) return envKey;

  try {
    const { data: owner } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("role", "owner")
      .limit(1)
      .single();

    if (!owner?.user_id) return null;

    // Use shared decryption service instead of returning raw encrypted key
    const decryptedKey = await getApiKey("resend", owner.user_id);
    return decryptedKey;
  } catch (e) {
    console.error("Error looking up Resend key from api_keys:", e);
    return null;
  }
}

async function getProviderSettings(supabase: any, workspaceId: string) {
  try {
    const { data } = await supabase
      .from("email_provider_settings")
      .select("provider, config, from_name, from_email")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .single();
    return data;
  } catch {
    return null;
  }
}

async function updateCampaignStats(supabase: any, campaignId: string) {
  if (!campaignId) return;
  try {
    const { data: messages } = await supabase
      .from("email_messages")
      .select("status")
      .eq("campaign_id", campaignId);

    if (!messages) return;

    const stats = {
      sent: messages.filter((m: any) => m.status === "sent").length,
      delivered: messages.filter((m: any) => m.status === "delivered").length,
      failed: messages.filter((m: any) => m.status === "failed").length,
      opened: 0,
      clicked: 0,
      bounced: 0,
    };

    const allDone = messages.every((m: any) => m.status !== "queued");

    await supabase.from("email_campaigns").update({
      stats,
      ...(allDone ? { status: "complete", completed_at: new Date().toISOString() } : {}),
    }).eq("id", campaignId);
  } catch (e) {
    console.error("Error updating campaign stats:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch queued messages WITHOUT requiring email_provider_settings join
    const { data: messages, error: fetchErr } = await supabase
      .from("email_messages")
      .select("*")
      .eq("status", "queued")
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sent = 0;
    let failed = 0;
    const campaignIds = new Set<string>();

    // Cache provider settings per workspace to avoid repeated lookups
    const settingsCache = new Map<string, any>();

    const baseUrl = Deno.env.get("SUPABASE_URL")!;

    for (const msg of messages) {
      try {
        // Get provider settings for this workspace (cached)
        let providerSettings = settingsCache.get(msg.workspace_id);
        if (providerSettings === undefined) {
          providerSettings = await getProviderSettings(supabase, msg.workspace_id);
          settingsCache.set(msg.workspace_id, providerSettings);
        }

        const resendKey = await getResendKey(supabase, msg.workspace_id);

        // Determine sender info
        const fromName = providerSettings?.from_name || "Engage";
        const fromEmail = providerSettings?.from_email || "noreply@example.com";

        // Inject unsubscribe link if contact_id exists
        let bodyHtml = msg.body_html || "";
        if (msg.contact_id) {
          const unsubLink = `${baseUrl}/functions/v1/engage-unsubscribe?contact_id=${msg.contact_id}`;
          bodyHtml = bodyHtml.replace(/\{\{unsubscribe_link\}\}/g, unsubLink);
          if (!bodyHtml.includes(unsubLink)) {
            bodyHtml += `<p style="font-size:11px;color:#999;margin-top:24px;text-align:center;"><a href="${unsubLink}" style="color:#999;">Unsubscribe</a></p>`;
          }
        }

        // Build List-Unsubscribe headers for compliance (RFC 2369/8058)
        const unsubHeaders: Record<string, string> = {};
        if (msg.contact_id) {
          const unsubUrl = `${baseUrl}/functions/v1/engage-unsubscribe?contact_id=${msg.contact_id}`;
          unsubHeaders["List-Unsubscribe"] = `<${unsubUrl}>`;
          unsubHeaders["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        }

        if (resendKey) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: `${fromName} <${fromEmail}>`,
              to: [msg.to_email],
              subject: msg.subject,
              html: bodyHtml,
              headers: unsubHeaders,
            }),
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Resend error: ${errBody}`);
          }

          const resData = await res.json();
          await supabase.from("email_messages").update({
            status: "sent", sent_at: new Date().toISOString(), provider_message_id: resData.id,
          }).eq("id", msg.id);
        } else {
          // No Resend key — mark as sent (mock delivery for dev/demo)
          console.warn(`No Resend key for workspace ${msg.workspace_id}, marking as sent without delivery`);
          await supabase.from("email_messages").update({
            status: "sent", sent_at: new Date().toISOString(),
          }).eq("id", msg.id);
        }

        await supabase.from("engage_activity_log").insert({
          workspace_id: msg.workspace_id, contact_id: msg.contact_id, channel: "email",
          type: "email_sent", message: `Email sent to ${msg.to_email}: ${msg.subject}`,
          payload: { message_id: msg.id, campaign_id: msg.campaign_id },
        });

        if (msg.campaign_id) campaignIds.add(msg.campaign_id);
        sent++;
      } catch (e) {
        await supabase.from("email_messages").update({ status: "failed", error: e.message }).eq("id", msg.id);
        if (msg.campaign_id) campaignIds.add(msg.campaign_id);
        failed++;
      }
    }

    for (const cid of campaignIds) {
      await updateCampaignStats(supabase, cid);
    }

    return new Response(JSON.stringify({ processed: messages.length, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
