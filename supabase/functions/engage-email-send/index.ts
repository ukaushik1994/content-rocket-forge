import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getApiKey } from "../shared/apiKeyService.ts";
import { notifyUser, getWorkspaceOwnerId } from "../shared/notifyUser.ts";

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

async function sendViaResend(
  resendKey: string,
  fromName: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  bodyHtml: string,
  unsubHeaders: Record<string, string>
): Promise<{ id: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject,
      html: bodyHtml,
      headers: unsubHeaders,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errBody}`);
  }

  return await res.json();
}

function buildUnsubHeaders(baseUrl: string, contactId: string | null): { headers: Record<string, string>; html: string } {
  if (!contactId) return { headers: {}, html: "" };
  const unsubUrl = `${baseUrl}/functions/v1/engage-unsubscribe?contact_id=${contactId}`;
  return {
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `<p style="font-size:11px;color:#999;margin-top:24px;text-align:center;"><a href="${unsubUrl}" style="color:#999;">Unsubscribe</a></p>`,
  };
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

    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    let body: any = {};
    try { body = await req.json(); } catch { /* empty body is fine for queue processing */ }

    // ─── Quick Send Path ───
    // When called with quick_send=true, insert messages and send immediately
    if (body.quick_send && body.to_emails?.length > 0) {
      const workspaceId = body.workspace_id;
      const resendKey = await getResendKey(supabase, workspaceId);
      
      if (!resendKey) {
        return new Response(JSON.stringify({
          error: "no_resend_key",
          message: "No Resend API key configured. Add your Resend API key in Settings → API Keys to send emails.",
        }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const providerSettings = await getProviderSettings(supabase, workspaceId);
      const fromName = providerSettings?.from_name || "Engage";
      const fromEmail = providerSettings?.from_email || "noreply@example.com";

      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const toEmail of body.to_emails) {
        try {
          // Insert as queued first for audit trail
          const { data: msg } = await supabase.from("email_messages").insert({
            workspace_id: workspaceId,
            to_email: toEmail,
            subject: body.subject,
            body_html: body.body_html || "",
            status: "queued",
          }).select("id").single();

          const resData = await sendViaResend(resendKey, fromName, fromEmail, toEmail, body.subject, body.body_html || "", {});

          await supabase.from("email_messages").update({
            status: "sent", sent_at: new Date().toISOString(), provider_message_id: resData.id,
          }).eq("id", msg.id);

          await supabase.from("engage_activity_log").insert({
            workspace_id: workspaceId, channel: "email",
            type: "email_sent", message: `Quick email sent to ${toEmail}: ${body.subject}`,
            payload: { message_id: msg.id },
          });

          sent++;
        } catch (e) {
          failed++;
          errors.push(`${toEmail}: ${e.message}`);
        }
      }

      return new Response(JSON.stringify({ sent, failed, errors }), {
        status: failed > 0 && sent === 0 ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Queue Processing Path ───
    // Process queued messages from the email_messages table
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
    const settingsCache = new Map<string, any>();
    const keyCache = new Map<string, string | null>();

    for (const msg of messages) {
      try {
        // Get provider settings for this workspace (cached)
        let providerSettings = settingsCache.get(msg.workspace_id);
        if (providerSettings === undefined) {
          providerSettings = await getProviderSettings(supabase, msg.workspace_id);
          settingsCache.set(msg.workspace_id, providerSettings);
        }

        // Cache Resend key per workspace
        let resendKey = keyCache.get(msg.workspace_id);
        if (resendKey === undefined) {
          resendKey = await getResendKey(supabase, msg.workspace_id);
          keyCache.set(msg.workspace_id, resendKey);
        }

        if (!resendKey) {
          // No key — fail with clear message instead of faking delivery
          await supabase.from("email_messages").update({
            status: "failed",
            error: "No Resend API key configured. Add your key in Settings → API Keys.",
          }).eq("id", msg.id);
          if (msg.campaign_id) campaignIds.add(msg.campaign_id);
          failed++;
          continue;
        }

        const fromName = providerSettings?.from_name || "Engage";
        const fromEmail = providerSettings?.from_email || "noreply@example.com";

        // Build email body with unsubscribe link
        let bodyHtml = msg.body_html || "";
        const unsub = buildUnsubHeaders(baseUrl, msg.contact_id);

        if (msg.contact_id) {
          const unsubLink = `${baseUrl}/functions/v1/engage-unsubscribe?contact_id=${msg.contact_id}`;
          bodyHtml = bodyHtml.replace(/\{\{unsubscribe_link\}\}/g, unsubLink);
          if (!bodyHtml.includes(unsubLink)) {
            bodyHtml += unsub.html;
          }
        }

        const resData = await sendViaResend(resendKey, fromName, fromEmail, msg.to_email, msg.subject, bodyHtml, unsub.headers);

        await supabase.from("email_messages").update({
          status: "sent", sent_at: new Date().toISOString(), provider_message_id: resData.id,
        }).eq("id", msg.id);

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
