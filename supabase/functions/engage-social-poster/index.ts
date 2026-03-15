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

    // Pick due scheduled posts
    const { data: posts, error: fetchErr } = await supabase
      .from("social_posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .limit(20);

    if (fetchErr) throw fetchErr;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let processed = 0;

    for (const post of posts) {
      // Get targets for this post
      const { data: targets } = await supabase
        .from("social_post_targets")
        .select("*")
        .eq("post_id", post.id)
        .eq("status", "scheduled");

      let allPosted = true;

      for (const target of (targets || [])) {
        // Check if account exists
        const { data: account } = await supabase
          .from("social_accounts")
          .select("*")
          .eq("id", target.account_id)
          .single();

        if (account) {
          // Social API integration not yet implemented — save as pending
          await supabase.from("social_post_targets").update({
            status: "pending_integration",
            error: "Social publishing integration coming soon. Post saved as draft.",
          }).eq("id", target.id);
          allPosted = false;
        } else {
          await supabase.from("social_post_targets").update({
            status: "failed",
            error: "No connected account found",
          }).eq("id", target.id);
          allPosted = false;
        }
      }

      await supabase.from("social_posts").update({
        status: allPosted ? "posted" : "pending_integration",
      }).eq("id", post.id);

      // Log activity
      await supabase.from("engage_activity_log").insert({
        workspace_id: post.workspace_id,
        channel: "social",
        type: allPosted ? "social_posted" : "social_pending",
        message: `Social post ${allPosted ? "published" : "queued for retry"}: ${post.content.substring(0, 60)}`,
        payload: { post_id: post.id },
      });

      processed++;
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
