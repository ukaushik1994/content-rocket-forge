import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { extractPageContent } from "../shared/content-extractor.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
const SERPSTACK_KEY = Deno.env.get("SERPSTACK_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface BrandIntelRequest {
  userId: string;
  website: string;
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
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { website } = body;
    const userIdFromBody = body.userId ?? body.user_id;

    if (userIdFromBody && userIdFromBody !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!website) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required field: website' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[brand-intel] Starting brand extraction for: ${website}`);

    // Step 1: Discover brand-relevant pages
    const discoveredUrls = await discoverBrandPages(website);
    console.log(`[brand-intel] Discovered ${discoveredUrls.length} brand-related URLs`);

    // Always include the homepage
    const domain = new URL(website).origin;
    const urlsToFetch = [website, ...discoveredUrls.filter(u => u !== website)].slice(0, 6);

    // Step 2: Extract content from pages
    const extractedPages = await Promise.all(
      urlsToFetch.map(async (url) => {
        const content = await extractPageContent(url, 10000);
        return content ? { url, content } : null;
      })
    );

    const validPages = extractedPages.filter((p) => p !== null);
    console.log(`[brand-intel] Extracted content from ${validPages.length} pages`);

    if (validPages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not extract content from any pages." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Extract CSS/visual data from homepage HTML
    const homepageHtml = await fetchRawHtml(website);
    const visualHints = extractVisualHints(homepageHtml);

    // Step 4: Use AI to extract brand guidelines
    const brandData = await extractBrandData(validPages, website, visualHints);

    return new Response(
      JSON.stringify({
        success: true,
        brandGuidelines: brandData,
        metadata: {
          sourceUrls: validPages.map((p) => p!.url),
          pagesAnalyzed: validPages.length,
          extractionDate: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[brand-intel] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Discover brand-related pages using SERP
 */
async function discoverBrandPages(website: string): Promise<string[]> {
  const urls: string[] = [];
  const domain = new URL(website).hostname;

  const queries = [
    `site:${domain} brand OR style-guide OR guidelines`,
    `site:${domain} about OR about-us OR our-story`,
  ];

  try {
    for (const query of queries) {
      if (SERP_API_KEY) {
        const response = await fetch(
          `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}&num=5`
        );
        const data = await response.json();
        urls.push(...(data.organic_results || []).map((r: any) => r.link).filter(Boolean));
      } else if (SERPSTACK_KEY) {
        const response = await fetch(
          `http://api.serpstack.com/search?access_key=${SERPSTACK_KEY}&query=${encodeURIComponent(query)}&num=5`
        );
        const data = await response.json();
        urls.push(...(data.organic_results || []).map((r: any) => r.url).filter(Boolean));
      }
    }
  } catch (error) {
    console.error("[brand-intel] SERP error:", error);
  }

  // Also try common brand page paths directly
  const commonPaths = ['/about', '/about-us', '/brand', '/style-guide', '/our-story', '/mission'];
  const origin = new URL(website).origin;
  for (const path of commonPaths) {
    try {
      const testUrl = `${origin}${path}`;
      const resp = await fetch(testUrl, { method: 'HEAD', redirect: 'follow' });
      if (resp.ok) {
        urls.push(testUrl);
      }
    } catch {
      // skip
    }
  }

  return [...new Set(urls)];
}

/**
 * Fetch raw HTML for visual hint extraction
 */
async function fetchRawHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandIntelBot/1.0)' }
    });
    if (!response.ok) return '';
    const html = await response.text();
    return html.length > 500000 ? html.substring(0, 500000) : html;
  } catch {
    return '';
  }
}

/**
 * Extract visual hints from raw HTML (colors, fonts, meta tags)
 */
function extractVisualHints(html: string): string {
  if (!html) return 'No visual data available.';

  const hints: string[] = [];

  // Extract theme-color meta tag
  const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
  if (themeColorMatch) hints.push(`Theme color: ${themeColorMatch[1]}`);

  // Extract OG image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) hints.push(`OG image (possible logo): ${ogImageMatch[1]}`);

  // Extract font references from link tags
  const fontMatches = html.matchAll(/fonts\.googleapis\.com\/css[^"']*family=([^"'&]+)/gi);
  for (const match of fontMatches) {
    hints.push(`Google Font: ${decodeURIComponent(match[1]).replace(/\+/g, ' ')}`);
  }

  // Extract inline CSS color values (look for brand-like patterns)
  const cssColorMatches = html.matchAll(/--(?:primary|brand|main|accent|secondary)[^:]*:\s*([^;]+)/gi);
  for (const match of cssColorMatches) {
    hints.push(`CSS variable: ${match[0].trim()}`);
  }

  // Extract favicon for brand presence
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);
  if (faviconMatch) hints.push(`Favicon: ${faviconMatch[1]}`);

  return hints.length > 0 ? hints.join('\n') : 'No specific visual hints found in HTML.';
}

/**
 * Extract brand guidelines using AI
 */
async function extractBrandData(
  pages: Array<{ url: string; content: any }>,
  website: string,
  visualHints: string
): Promise<any> {
  const pageTexts = pages.map((p, i) => {
    return `[Page ${i + 1}: ${p.url}]
Title: ${p.content.title}
Meta: ${p.content.metaDescription}
Headings: ${p.content.headings.join(", ")}
Content: ${p.content.mainText.slice(0, 3000)}
Lists: ${(p.content.lists || []).slice(0, 10).join("; ")}
CTAs: ${(p.content.ctaText || []).join(", ")}
Statistics: ${(p.content.statistics || []).join(", ")}`;
  });

  const prompt = `You are a brand identity extraction specialist. Analyze this website's content and visual data to extract comprehensive brand guidelines.

WEBSITE: ${website}

VISUAL DATA FROM HTML:
${visualHints}

CONTENT FROM ${pages.length} PAGES:
${pageTexts.join("\n\n---\n\n")}

Extract ALL of the following brand data. For fields you can't find directly, infer intelligently from the writing style, tone, and messaging.

Return ONLY valid JSON in this exact format:
{
  "primaryColor": "#hex color (from CSS variables, theme-color meta, or dominant brand color visible in content/design references. Default: #3B82F6)",
  "secondaryColor": "#hex color (complementary to primary. Default: #10B981)",
  "accentColor": "#hex color (accent/highlight color. Default: #F59E0B)",
  "neutralColor": "#hex color (neutral/gray tone. Default: #6B7280)",
  "fontFamily": "Primary font family (from Google Fonts links, CSS references, or inferred from brand style. Default: Inter)",
  "secondaryFontFamily": "Secondary/body font (Default: system-ui)",
  "tone": ["3-6 brand voice descriptors, e.g., 'Professional', 'Innovative', 'Approachable', 'Bold'"],
  "keywords": ["8-15 brand keywords extracted from headings, meta descriptions, and repeated themes"],
  "brandPersonality": "2-3 sentence description of the brand's personality and character",
  "missionStatement": "Company mission statement (extract directly if found, otherwise infer from about page)",
  "doUse": ["5-8 writing/brand rules the brand follows, e.g., 'Use active voice', 'Lead with benefits', 'Include data-backed claims'"],
  "dontUse": ["5-8 things the brand avoids, e.g., 'Avoid jargon', 'Don't use passive voice', 'Never make unsubstantiated claims'"],
  "logoUsageNotes": "Notes about logo presence and usage (e.g., 'Logo appears in header with wordmark', 'Uses icon-only logo in favicon')",
  "imageryGuidelines": "Description of imagery style used (e.g., 'Clean product screenshots', 'Diverse team photos', 'Abstract geometric illustrations')",
  "targetAudience": "Primary target audience description (e.g., 'B2B SaaS companies with 50-500 employees looking for HR automation')",
  "brandStory": "3-5 sentence brand story/narrative extracted from about page or company description",
  "brandValues": "Core values as comma-separated string (e.g., 'Innovation, Transparency, Customer Success, Integrity')",
  "confidenceScores": {
    "colors": 0.0-1.0,
    "fonts": 0.0-1.0,
    "tone": 0.0-1.0,
    "keywords": 0.0-1.0,
    "mission": 0.0-1.0,
    "overall": 0.0-1.0
  }
}

EXTRACTION RULES:
1. Colors: Prioritize CSS custom properties, theme-color meta, then infer from brand mentions
2. Fonts: Extract from Google Fonts links, CSS font-family references, or infer from brand style
3. Tone: Analyze the actual writing style - is it formal, casual, technical, playful?
4. Keywords: Extract recurring themes from headings, meta tags, and body copy
5. Do/Don't: Infer writing rules from the actual content style
6. Brand story: Prefer content from /about pages
7. If a field cannot be determined at all, use the provided defaults
8. Confidence: 1.0 = explicitly found, 0.7 = strongly inferred, 0.4 = guessed from context`;

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
          { role: "system", content: "You are a brand identity extraction specialist. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[brand-intel] AI API error:", response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const extracted = JSON.parse(jsonStr);

    // Apply defaults for any missing fields
    return {
      primaryColor: extracted.primaryColor || "#3B82F6",
      secondaryColor: extracted.secondaryColor || "#10B981",
      accentColor: extracted.accentColor || "#F59E0B",
      neutralColor: extracted.neutralColor || "#6B7280",
      fontFamily: extracted.fontFamily || "Inter",
      secondaryFontFamily: extracted.secondaryFontFamily || "system-ui",
      tone: Array.isArray(extracted.tone) ? extracted.tone : ["Professional", "Innovative"],
      keywords: Array.isArray(extracted.keywords) ? extracted.keywords : [],
      brandPersonality: extracted.brandPersonality || "",
      missionStatement: extracted.missionStatement || "",
      doUse: Array.isArray(extracted.doUse) ? extracted.doUse : [],
      dontUse: Array.isArray(extracted.dontUse) ? extracted.dontUse : [],
      logoUsageNotes: extracted.logoUsageNotes || "Logo present in header",
      imageryGuidelines: extracted.imageryGuidelines || "",
      targetAudience: extracted.targetAudience || "",
      brandStory: extracted.brandStory || "",
      brandValues: extracted.brandValues || "",
      confidenceScores: extracted.confidenceScores || { overall: 0.5 }
    };
  } catch (error) {
    console.error("[brand-intel] AI extraction error:", error);
    
    // Return sensible defaults
    return {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      neutralColor: "#6B7280",
      fontFamily: "Inter",
      secondaryFontFamily: "system-ui",
      tone: ["Professional"],
      keywords: [],
      brandPersonality: "",
      missionStatement: "",
      doUse: [],
      dontUse: [],
      logoUsageNotes: "Logo present in header",
      imageryGuidelines: "",
      targetAudience: "",
      brandStory: "",
      brandValues: "",
      confidenceScores: { overall: 0.3 }
    };
  }
}
