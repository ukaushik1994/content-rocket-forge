import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractPageContent } from "../shared/content-extractor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetitorIntelRequest {
  userId: string;
  website: string;
  maxPages?: number;
  recrawl?: boolean;
}

interface CompetitorProfile {
  description: string;
  market_position: string;
  strengths: string[];
  weaknesses: string[];
  resources: Array<{
    title: string;
    url: string;
    category: string;
  }>;
  notes: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, website, maxPages = 5, recrawl = false }: CompetitorIntelRequest = await req.json();

    if (!userId || !website) {
      throw new Error("Missing required fields: userId, website");
    }

    console.log(`[competitor-intel] Starting analysis for: ${website}`);
    console.log(`[competitor-intel] Max pages: ${maxPages}, Recrawl: ${recrawl}`);

    // Step 1: Discover competitor pages using SERP
    const discoveredUrls = await discoverCompetitorPages(website);
    console.log(`[competitor-intel] Discovered ${discoveredUrls.length} competitor pages`);

    if (discoveredUrls.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No competitor pages found. Please try entering information manually."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Extract content from discovered pages
    const topUrls = discoveredUrls.slice(0, maxPages);
    console.log(`[competitor-intel] Extracting content from ${topUrls.length} pages`);
    
    const extractedPages = await Promise.all(
      topUrls.map(async (url) => {
        const content = await extractPageContent(url, 10000);
        return content ? { url, content } : null;
      })
    );

    const validPages = extractedPages.filter((p) => p !== null);
    console.log(`[competitor-intel] Successfully extracted ${validPages.length} pages`);

    if (validPages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not extract content from any pages. Please try manually."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Use AI to extract competitive intelligence
    const { profile, diagnostics } = await extractCompetitiveIntelligence(
      validPages,
      website
    );

    console.log(`[competitor-intel] ✅ Analysis complete`);

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        diagnostics: {
          ...diagnostics,
          used_serp: true,
          pages_fetched: validPages.length,
          pages_skipped: topUrls.length - validPages.length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[competitor-intel] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to analyze competitor website"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Discover competitor pages using SERP queries
 */
async function discoverCompetitorPages(website: string): Promise<string[]> {
  const urls: string[] = [];
  const domain = new URL(website).hostname;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Competitive intelligence queries
  const queries = [
    `site:${domain} about`,
    `site:${domain} solutions OR products`,
    `site:${domain} case studies OR customers`,
    `site:${domain} pricing OR plans`,
    `site:${domain} features OR capabilities`
  ];

  console.log(`[competitor-intel] Running ${queries.length} SERP queries`);

  for (const query of queries) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/api-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          provider: 'serpstack',
          endpoint: 'search',
          params: { query, num: 5 }
        })
      });

      const data = await response.json();
      
      // Handle rate limits gracefully
      if (response.status === 429 || data.isRateLimited) {
        console.warn(`⚠️ SERP rate limited for query: ${query}`);
        continue;
      }

      if (data.success && data.results) {
        urls.push(...data.results.map((r: any) => r.url).filter(Boolean));
      }
    } catch (error) {
      console.error(`SERP query failed for: ${query}`, error);
    }
  }

  // Filter for domain-relevant URLs
  const relevantUrls = urls.filter(url => {
    const lowerUrl = url.toLowerCase();
    return url.includes(domain) && (
      lowerUrl.includes('/about') ||
      lowerUrl.includes('/product') ||
      lowerUrl.includes('/solution') ||
      lowerUrl.includes('/feature') ||
      lowerUrl.includes('/pricing') ||
      lowerUrl.includes('/case') ||
      lowerUrl.includes('/customer')
    );
  });

  // Remove duplicates and return
  const uniqueUrls = [...new Set(relevantUrls)];
  console.log(`[competitor-intel] Found ${uniqueUrls.length} relevant URLs after filtering`);
  
  return uniqueUrls;
}

/**
 * Extract competitive intelligence using AI
 */
async function extractCompetitiveIntelligence(
  pages: Array<{ url: string; content: any }>,
  website: string
): Promise<{
  profile: CompetitorProfile;
  diagnostics: any;
}> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.warn('[competitor-intel] No LOVABLE_API_KEY, using fallback');
    return createFallbackProfile(website, pages);
  }

  // Build content summary from pages
  const pageTexts = pages.map((p, i) => {
    return `[Page ${i + 1}: ${p.url}]
Title: ${p.content.title}
Meta: ${p.content.metaDescription}
Headings: ${p.content.headings.join(", ")}
Content: ${p.content.mainText.substring(0, 3000)}
`;
  });

  const prompt = `You are a competitive intelligence analyst. Analyze the following pages from a competitor's website and extract structured competitive insights.

COMPETITOR WEBSITE: ${website}

CONTENT FROM PAGES:
${pageTexts.join("\n\n---\n\n")}

Extract the following competitive intelligence in JSON format:

1. description: 2-3 sentence overview of what this competitor does and their value proposition
2. market_position: Their market positioning. Choose ONE from: "Market Leader", "Strong Challenger", "Niche Player", "Emerging Competitor", "Disruptor"
3. strengths: Array of 3-5 competitive strengths/advantages (e.g., "Enterprise-grade security", "24/7 support", "AI-powered automation")
4. weaknesses: Array of 3-5 weaknesses or gaps (e.g., "Limited integrations", "Complex pricing", "No mobile app")
5. resources: Array of detected resources with:
   - title: Resource name (e.g., "Product Documentation", "Case Studies")
   - url: Full URL
   - category: Choose from: 'website' | 'documentation' | 'case_studies' | 'social_media' | 'marketing' | 'other'
6. notes: A brief competitive intelligence summary (2-3 sentences) highlighting key insights about this competitor and how they differentiate

IMPORTANT:
- Focus on COMPETITIVE angles - what makes them strong, where they fall short
- Strengths should be specific competitive advantages, not generic statements
- Weaknesses should be actual gaps or limitations in their offering
- Market position should reflect their actual standing in the market
- Notes should provide actionable competitive intelligence

Return ONLY valid JSON in this exact format:
{
  "description": "string",
  "market_position": "string",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "resources": [
    {
      "title": "string",
      "url": "string",
      "category": "website|documentation|case_studies|social_media|marketing|other"
    }
  ],
  "notes": "string"
}`;

  try {
    console.log('[competitor-intel] Calling AI for competitive intelligence extraction');
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp",
        messages: [
          { 
            role: "system", 
            content: "You are a competitive intelligence analyst. Return only valid JSON with actionable competitive insights." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.error(`AI extraction failed: ${response.status}`);
      return createFallbackProfile(website, pages);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log('[competitor-intel] AI response received, parsing...');
    
    // Extract JSON from response (may be wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const extracted = JSON.parse(jsonStr);

    // Validate and build final profile
    const profile: CompetitorProfile = {
      description: extracted.description || `Competitor analysis for ${website}`,
      market_position: extracted.market_position || "Unknown",
      strengths: Array.isArray(extracted.strengths) ? extracted.strengths : [],
      weaknesses: Array.isArray(extracted.weaknesses) ? extracted.weaknesses : [],
      resources: Array.isArray(extracted.resources) ? extracted.resources : [
        { title: "Website", url: website, category: "website" }
      ],
      notes: extracted.notes || "No additional notes available"
    };

    console.log('[competitor-intel] ✅ Successfully extracted competitive intelligence');

    const diagnostics = {
      used_sitemap: false,
      ai_calls: 1,
      cache_hit: false
    };

    return { profile, diagnostics };

  } catch (error: any) {
    console.error("[competitor-intel] AI extraction error:", error);
    return createFallbackProfile(website, pages);
  }
}

/**
 * Create fallback profile when AI extraction fails
 */
function createFallbackProfile(
  website: string, 
  pages: Array<{ url: string; content: any }>
): {
  profile: CompetitorProfile;
  diagnostics: any;
} {
  console.log('[competitor-intel] Creating fallback profile');
  
  return {
    profile: {
      description: `Competitor analysis in progress for ${website}. Please review and add details manually.`,
      market_position: "Unknown",
      strengths: [],
      weaknesses: [],
      resources: [
        { title: "Website", url: website, category: "website" },
        ...pages.slice(0, 3).map(p => ({
          title: p.content.title || "Discovered Page",
          url: p.url,
          category: "other" as const
        }))
      ],
      notes: "AI extraction unavailable. Please add competitive intelligence manually."
    },
    diagnostics: {
      used_sitemap: false,
      ai_calls: 0,
      cache_hit: false
    }
  };
}
