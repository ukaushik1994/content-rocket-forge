import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { use_case, topic, tone, cta, length, body_html, subject, platform, content } = body;

    // Get user's AI provider
    const { data: provider } = await supabase
      .from("ai_service_providers")
      .select("provider, api_key")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("priority", { ascending: true })
      .limit(1)
      .single();

    if (!provider) {
      return new Response(JSON.stringify({ error: "No AI provider configured. Please set up an AI provider in Settings." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (use_case) {
      case "email_body": {
        systemPrompt = `You are an expert email marketing copywriter. Generate professional HTML email content. 
Return ONLY valid HTML (no markdown, no code fences). Use inline styles for compatibility.
The HTML should be responsive and clean.`;
        userPrompt = `Write an email about: ${topic || "general update"}
Tone: ${tone || "professional"}
${cta ? `Call to action: ${cta}` : ""}
${length ? `Target length: ${length}` : "Keep it concise but compelling."}
Include {{first_name}} and {{unsubscribe_link}} template variables where appropriate.`;
        break;
      }

      case "improve_email": {
        systemPrompt = `You are an expert email copywriter. Improve the given email HTML while maintaining its structure. 
Make it more engaging, clear, and conversion-focused. Return ONLY valid HTML.`;
        userPrompt = `Improve this email:\n\n${body_html}\n\n${tone ? `Desired tone: ${tone}` : ""}`;
        break;
      }

      case "subject_lines": {
        systemPrompt = `You are an email marketing expert specializing in subject lines.
Return a JSON array of exactly 5 subject line objects.
Each object: { "subject": "...", "confidence": "high"|"medium"|"low", "reason": "..." }
Confidence = predicted engagement level. Only return valid JSON array, nothing else.`;
        userPrompt = `Generate 5 subject line variations for this email:\n\nSubject context: ${subject || ""}\nBody preview: ${(body_html || "").replace(/<[^>]*>/g, "").substring(0, 500)}`;
        break;
      }

      case "deliverability_check": {
        systemPrompt = `You are an email deliverability expert. Analyze the given email for spam triggers, 
readability, and compliance. Return a JSON object:
{
  "score": 0-100,
  "issues": [{ "severity": "high"|"medium"|"low", "issue": "...", "fix": "..." }],
  "summary": "..."
}
Only return valid JSON, nothing else.`;
        userPrompt = `Analyze this email for deliverability:\n\nSubject: ${subject || ""}\nBody:\n${body_html || ""}`;
        break;
      }

      case "social_post": {
        systemPrompt = `You are a social media expert. Generate engaging posts optimized for specific platforms.
Return a JSON object with platform-specific content:
{
  "twitter": "...(max 280 chars)",
  "linkedin": "...(max 3000 chars, professional tone)",
  "instagram": "...(max 2200 chars, with emoji)",
  "facebook": "...(engaging, conversational)"
}
Only return valid JSON, nothing else.`;
        userPrompt = `Create social posts about: ${topic || content || ""}
Tone: ${tone || "engaging"}
${platform ? `Focus on: ${platform}` : "Generate for all platforms."}`;
        break;
      }

      case "hashtags": {
        systemPrompt = `You are a social media expert. Suggest relevant hashtags.
Return a JSON object:
{
  "high_reach": ["#tag1", "#tag2", ...],
  "niche": ["#tag1", "#tag2", ...],
  "trending": ["#tag1", "#tag2", ...],
  "branded": ["#tag1", "#tag2", ...]
}
Only return valid JSON, nothing else.`;
        userPrompt = `Suggest hashtags for this post:\n${content || topic || ""}\n${platform ? `Platform: ${platform}` : ""}`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown use_case: ${use_case}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Call ai-proxy
    const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: provider.provider,
        endpoint: "chat",
        apiKey: provider.api_key,
        params: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
      }),
    });

    const aiData = await aiRes.json();

    if (!aiRes.ok || aiData.error) {
      return new Response(JSON.stringify({ error: aiData.error || "AI request failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract content from AI response
    let aiContent = "";
    const responseData = aiData.data || aiData;
    
    if (responseData.data?.choices?.[0]?.message?.content) {
      aiContent = responseData.data.choices[0].message.content;
    } else if (responseData.data?.content?.[0]?.text) {
      aiContent = responseData.data.content[0].text;
    } else if (responseData.choices?.[0]?.message?.content) {
      aiContent = responseData.choices[0].message.content;
    } else if (responseData.content?.[0]?.text) {
      aiContent = responseData.content[0].text;
    } else if (typeof responseData === "string") {
      aiContent = responseData;
    }

    // Parse JSON responses for structured use cases
    let result: any = { content: aiContent };
    
    if (["subject_lines", "deliverability_check", "social_post", "hashtags"].includes(use_case)) {
      try {
        // Extract JSON from potential markdown code fences
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
        result = JSON.parse(jsonMatch[1]!.trim());
      } catch {
        result = { content: aiContent, parse_error: true };
      }
    }

    return new Response(JSON.stringify({ success: true, use_case, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("engage-ai-writer error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
