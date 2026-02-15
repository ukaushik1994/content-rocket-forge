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
