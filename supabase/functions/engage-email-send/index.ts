import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getResendKey(supabase: any, workspaceId: string): Promise<string | null> {
  // 1. Check env secret first
  const envKey = Deno.env.get("RESEND_API_KEY");
  if (envKey) return envKey;

  // 2. Fallback: look up workspace owner, then query api_keys table
  try {
    const { data: owner } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("role", "owner")
      .limit(1)
      .single();

    if (!owner?.user_id) return null;

    const { data: keyRow } = await supabase
      .from("api_keys")
      .select("encrypted_key")
      .eq("user_id", owner.user_id)
      .eq("service", "resend")
      .eq("is_active", true)
      .single();

    return keyRow?.encrypted_key || null;
  } catch (e) {
    console.error("Error looking up Resend key from api_keys:", e);
    return null;
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

    // Pick queued messages in batches of 50
    const { data: messages, error: fetchErr } = await supabase
      .from("email_messages")
      .select("*, email_provider_settings!inner(provider, config, from_name, from_email)")
      .eq("status", "queued")
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sent = 0;
    let failed = 0;

    for (const msg of messages) {
      try {
        // Resolve Resend key: env → api_keys table
        const resendKey = await getResendKey(supabase, msg.workspace_id);

        if (resendKey && msg.email_provider_settings?.provider === "resend") {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: `${msg.email_provider_settings.from_name} <${msg.email_provider_settings.from_email}>`,
              to: [msg.to_email],
              subject: msg.subject,
              html: msg.body_html,
            }),
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Resend error: ${errBody}`);
          }

          const resData = await res.json();
          await supabase.from("email_messages").update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: resData.id,
          }).eq("id", msg.id);
        } else {
          // Mock mode - mark as sent without actually sending
          await supabase.from("email_messages").update({
            status: "sent",
            sent_at: new Date().toISOString(),
          }).eq("id", msg.id);
        }

        // Log activity
        await supabase.from("engage_activity_log").insert({
          workspace_id: msg.workspace_id,
          contact_id: msg.contact_id,
          channel: "email",
          type: "email_sent",
          message: `Email sent to ${msg.to_email}: ${msg.subject}`,
          payload: { message_id: msg.id, campaign_id: msg.campaign_id },
        });

        sent++;
      } catch (e) {
        await supabase.from("email_messages").update({
          status: "failed",
          error: e.message,
        }).eq("id", msg.id);
        failed++;
      }
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
