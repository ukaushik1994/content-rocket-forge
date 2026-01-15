import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { extractPageContent } from "../shared/content-extractor.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
const SERPSTACK_KEY = Deno.env.get("SERPSTACK_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface DiscoverRequest {
  userId: string;
  companyName: string;
  website: string;
  maxPages?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const body: Partial<DiscoverRequest> & Record<string, unknown> = await req.json();
    const { companyName, website, maxPages = 5 } = body as any;
    const userIdFromBody = (body as any).userId ?? (body as any).user_id;

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userIdFromBody && userIdFromBody !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!companyName || !website) {
      throw new Error("Missing required fields: companyName, website");
    }


    console.log(`[company-intel] Starting discovery for: ${companyName} (${website})`);

    // Step 1: Discover company pages using SERP
    const discoveredUrls = await discoverCompanyPages(companyName, website);
    console.log(`[company-intel] Discovered ${discoveredUrls.length} URLs`);

    if (discoveredUrls.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No company pages found. Please try entering information manually."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Extract content from top pages
    const topUrls = discoveredUrls.slice(0, maxPages);
    const extractedPages = await Promise.all(
      topUrls.map(async (url) => {
        const content = await extractPageContent(url, 10000);
        return content ? { url, content } : null;
      })
    );

    const validPages = extractedPages.filter((p) => p !== null);
    console.log(`[company-intel] Extracted content from ${validPages.length} pages`);

    if (validPages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not extract content from any pages. Please try manually."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Use AI to extract structured company information
    const companyData = await extractCompanyData(validPages, companyName, website);

    return new Response(
      JSON.stringify({
        success: true,
        companyInfo: companyData.companyInfo,
        metadata: {
          sourceUrls: validPages.map((p) => p.url),
          confidenceScores: companyData.confidenceScores,
          pagesAnalyzed: validPages.length,
          extractionDate: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[company-intel] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Discover company pages using SERP
 */
async function discoverCompanyPages(companyName: string, website: string): Promise<string[]> {
  const urls: string[] = [];
  const domain = new URL(website).hostname;

  // Query 1: "{companyName}" about us
  const query1 = `"${companyName}" about us`;
  
  // Query 2: site:{website} about
  const query2 = `site:${domain} about`;

  try {
    // Try SerpApi first
    if (SERP_API_KEY) {
      const results1 = await querySerpApi(query1);
      const results2 = await querySerpApi(query2);
      urls.push(...results1, ...results2);
    }
    // Fallback to Serpstack
    else if (SERPSTACK_KEY) {
      const results1 = await querySerpstack(query1);
      const results2 = await querySerpstack(query2);
      urls.push(...results1, ...results2);
    }
  } catch (error) {
    console.error("[company-intel] SERP error:", error);
  }

  // Filter for relevant URLs
  const relevantUrls = urls.filter((url) => {
    const lowerUrl = url.toLowerCase();
    return (
      url.includes(domain) &&
      (lowerUrl.includes("/about") ||
        lowerUrl.includes("/company") ||
        lowerUrl.includes("/our-story") ||
        lowerUrl.includes("/mission") ||
        lowerUrl.includes("/team"))
    );
  });

  // Remove duplicates
  return [...new Set(relevantUrls)];
}

async function querySerpApi(query: string): Promise<string[]> {
  const response = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}&num=10`
  );
  const data = await response.json();
  return (data.organic_results || []).map((r: any) => r.link).filter(Boolean);
}

async function querySerpstack(query: string): Promise<string[]> {
  const response = await fetch(
    `http://api.serpstack.com/search?access_key=${SERPSTACK_KEY}&query=${encodeURIComponent(query)}&num=10`
  );
  const data = await response.json();
  return (data.organic_results || []).map((r: any) => r.url).filter(Boolean);
}

/**
 * Extract structured company data using AI
 */
async function extractCompanyData(
  pages: Array<{ url: string; content: any }>,
  companyName: string,
  website: string
): Promise<{
  companyInfo: any;
  confidenceScores: Record<string, number>;
}> {
  // Build content text from pages
  const pageTexts = pages.map((p, i) => {
    return `[Page ${i + 1}: ${p.url}]
Title: ${p.content.title}
Meta: ${p.content.metaDescription}
Headings: ${p.content.headings.join(", ")}
Content: ${p.content.mainText}
`;
  });

  const prompt = `You are analyzing company information from their website.

CONTENT FROM PAGES:
${pageTexts.join("\n\n---\n\n")}

Extract the following structured data about the company:

1. Company Name: Official company name (default to "${companyName}" if not found)
2. Description: 2-3 sentence overview of what the company does
3. Industry: Primary industry/sector (e.g., "SaaS", "Healthcare", "E-commerce", "Technology")
4. Founded: Year founded (YYYY format only, e.g., "2023"). If not found, use current year.
5. Size: Company size category - choose one: "Startup (1-10)", "Small (11-50)", "Medium (51-200)", "Large (201+)". If not found, use "Startup (1-10)".
6. Mission: Mission statement (1-2 sentences). If not explicitly stated, derive from company description.
7. Values: Core company values (array of 3-5 values). Common values: Innovation, Integrity, Customer Focus, Excellence, Collaboration.
8. Logo URL: Direct URL to company logo image (from meta tags or images)

For each field, also provide a confidence score (0.0 to 1.0):
- 1.0 = explicitly stated on the page
- 0.8 = strongly implied
- 0.5 = inferred from context
- 0.3 = guessed

Return ONLY valid JSON in this exact format:
{
  "name": "string",
  "description": "string",
  "industry": "string",
  "founded": "YYYY",
  "size": "string",
  "mission": "string",
  "values": ["string", "string"],
  "logoUrl": "string or null",
  "confidenceScores": {
    "name": 0.0-1.0,
    "description": 0.0-1.0,
    "industry": 0.0-1.0,
    "founded": 0.0-1.0,
    "size": 0.0-1.0,
    "mission": 0.0-1.0,
    "values": 0.0-1.0
  }
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a company information extraction specialist. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[company-intel] AI API error:", response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON from response (may be wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const extracted = JSON.parse(jsonStr);

    // Build final company info with defaults
    const companyInfo = {
      id: crypto.randomUUID(),
      name: extracted.name || companyName,
      description: extracted.description || "",
      industry: extracted.industry || "Technology",
      founded: extracted.founded || new Date().getFullYear().toString(),
      size: extracted.size || "Startup (1-10)",
      mission: extracted.mission || extracted.description || "",
      values: Array.isArray(extracted.values) ? extracted.values : ["Innovation", "Excellence", "Integrity"],
      website,
      logoUrl: extracted.logoUrl || null
    };

    const confidenceScores = extracted.confidenceScores || {
      name: 0.5,
      description: 0.5,
      industry: 0.5,
      founded: 0.3,
      size: 0.3,
      mission: 0.5,
      values: 0.5
    };

    return { companyInfo, confidenceScores };
  } catch (error) {
    console.error("[company-intel] AI extraction error:", error);
    
    // Return fallback data
    return {
      companyInfo: {
        id: crypto.randomUUID(),
        name: companyName,
        description: `${companyName} is a company providing innovative solutions.`,
        industry: "Technology",
        founded: new Date().getFullYear().toString(),
        size: "Startup (1-10)",
        mission: `Our mission is to deliver exceptional value to our customers.`,
        values: ["Innovation", "Excellence", "Integrity"],
        website,
        logoUrl: null
      },
      confidenceScores: {
        name: 1.0,
        description: 0.3,
        industry: 0.3,
        founded: 0.3,
        size: 0.3,
        mission: 0.3,
        values: 0.3
      }
    };
  }
}
