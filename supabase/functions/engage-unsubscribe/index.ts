import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || url.searchParams.get("contact_id");

  if (!token) {
    return new Response(htmlPage("Invalid Link", "No unsubscribe token provided."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: contact, error } = await supabase
      .from("engage_contacts")
      .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
      .eq("id", token)
      .select("email")
      .single();

    if (error || !contact) {
      return new Response(htmlPage("Not Found", "Contact not found or already unsubscribed."), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Log activity
    await supabase.from("engage_activity_log").insert({
      workspace_id: (await supabase.from("engage_contacts").select("workspace_id").eq("id", token).single()).data?.workspace_id,
      contact_id: token,
      channel: "email",
      type: "unsubscribed",
      message: `Contact ${contact.email} unsubscribed`,
      payload: {},
    });

    return new Response(htmlPage("Unsubscribed", `You (${contact.email}) have been successfully unsubscribed. You will no longer receive emails from us.`), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return new Response(htmlPage("Error", "Something went wrong. Please try again later."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
});

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa}
.card{background:#fff;border-radius:12px;padding:48px;max-width:420px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.08)}
h1{margin:0 0 16px;font-size:24px;color:#111}p{margin:0;color:#555;line-height:1.6}</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}
