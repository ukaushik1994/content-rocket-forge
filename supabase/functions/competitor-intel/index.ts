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
    description?: string;
  }>;
  notes: string;
  
  // Extended fields
  company_size?: string;
  founded_year?: string;
  headquarters?: string;
  funding_stage?: string;
  employee_count?: string;
  customer_count?: string;
  product_categories?: string[];
  key_features?: string[];
  integrations_count?: number;
  technology_stack?: string[];
  deployment_options?: string[];
  pricing_model?: string;
  pricing_tiers?: Array<{ name: string; price?: string; features?: string[] }>;
  has_free_trial?: boolean;
  has_free_plan?: boolean;
  target_industries?: string[];
  target_company_size?: string[];
  primary_use_cases?: string[];
  ideal_customer_profile?: string;
  notable_customers?: string[];
  case_study_count?: number;
  testimonial_highlights?: string[];
  awards_certifications?: string[];
  partnerships?: string[];
  unique_value_propositions?: string[];
  competitive_moats?: string[];
  key_differentiators?: string[];
  recent_developments?: string[];
  growth_indicators?: string;
  market_sentiment?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { userId, website, maxPages = 10, recrawl = false }: CompetitorIntelRequest = await req.json();

    if (!userId || !website) {
      throw new Error("Missing required fields: userId, website");
    }

    console.log(`[competitor-intel] Starting analysis for: ${website}`);
    console.log(`[competitor-intel] Max pages: ${maxPages}, Recrawl: ${recrawl}`);

    // Step 1: Discover competitor pages using enhanced SERP queries
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

    const extractionTime = Date.now() - startTime;
    console.log(`[competitor-intel] ✅ Analysis complete in ${extractionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        diagnostics: {
          ...diagnostics,
          used_serp: true,
          pages_fetched: validPages.length,
          pages_skipped: topUrls.length - validPages.length,
          extraction_time_ms: extractionTime
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
 * Enhanced competitor page discovery with more targeted queries
 */
async function discoverCompetitorPages(website: string): Promise<string[]> {
  const urls: string[] = [];
  const domain = new URL(website).hostname;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Enhanced competitive intelligence queries (12 targeted queries)
  const queries = [
    `site:${domain} about OR company OR team`,
    `site:${domain} products OR solutions OR platform`,
    `site:${domain} pricing OR plans OR cost`,
    `site:${domain} features OR capabilities`,
    `site:${domain} case studies OR customers OR testimonials`,
    `site:${domain} integrations OR partners`,
    `site:${domain} documentation OR API OR developer`,
    `site:${domain} industries OR use cases`,
    `site:${domain} enterprise OR security OR compliance`,
    `site:${domain} reviews OR comparison`,
    `site:${domain} news OR press OR blog`,
    `site:${domain} careers OR jobs`
  ];

  console.log(`[competitor-intel] Running ${queries.length} enhanced SERP queries`);

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

  // Enhanced URL filtering with priority scoring
  const scoredUrls = urls.map(url => ({
    url,
    score: calculateUrlRelevanceScore(url, domain)
  }));

  // Filter and sort by relevance
  const relevantUrls = scoredUrls
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.url);

  // Remove duplicates
  const uniqueUrls = [...new Set(relevantUrls)];
  console.log(`[competitor-intel] Found ${uniqueUrls.length} relevant URLs after filtering`);
  
  return uniqueUrls;
}

/**
 * Calculate URL relevance score for prioritization
 */
function calculateUrlRelevanceScore(url: string, domain: string): number {
  if (!url.includes(domain)) return 0;
  
  const lowerUrl = url.toLowerCase();
  let score = 1;
  
  // Exclude unwanted pages
  if (lowerUrl.includes('/terms') || lowerUrl.includes('/privacy') || 
      lowerUrl.includes('/cookie') || lowerUrl.includes('/legal')) {
    return 0;
  }
  
  // High priority pages
  if (lowerUrl.includes('/pricing')) score += 10;
  if (lowerUrl.includes('/features')) score += 8;
  if (lowerUrl.includes('/about')) score += 7;
  if (lowerUrl.includes('/product')) score += 8;
  
  // Medium priority
  if (lowerUrl.includes('/case')) score += 6;
  if (lowerUrl.includes('/customer')) score += 6;
  if (lowerUrl.includes('/integration')) score += 5;
  if (lowerUrl.includes('/solution')) score += 7;
  
  // Lower priority but useful
  if (lowerUrl.includes('/blog')) score += 3;
  if (lowerUrl.includes('/news')) score += 3;
  if (lowerUrl.includes('/career')) score += 2;
  
  return score;
}

/**
 * Extract competitive intelligence using enhanced AI prompt
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
    return createEnhancedFallbackProfile(website, pages);
  }

  // Build enhanced content summary from pages
  const pageTexts = pages.map((p, i) => {
    return `[Page ${i + 1}: ${p.url}]
Title: ${p.content.title}
Meta: ${p.content.metaDescription}
Headings: ${p.content.headings.join(" | ")}
Content: ${p.content.mainText.substring(0, 4000)}
`;
  });

  const prompt = `You are an expert competitive intelligence analyst conducting deep research on a competitor.

COMPETITOR: ${website}

EXTRACTED CONTENT FROM ${validPages.length} PAGES:
${pageTexts.join("\n\n---PAGE BREAK---\n\n")}

TASK: Extract comprehensive, actionable competitive intelligence in the following JSON structure.

CRITICAL INSTRUCTIONS:
- Be SPECIFIC and CONCRETE - provide actual examples, numbers, and quotes
- Extract QUANTIFIABLE data whenever possible (numbers, percentages, counts)
- Identify UNIQUE characteristics - what makes them different
- Find EVIDENCE - ground insights in actual content from pages
- Be COMPETITIVE-FOCUSED - think about how we can compete against them

EVIDENCE-BASED EXTRACTION RULES:
1. ONLY extract data that has supporting evidence in the provided content
2. Use "Unknown" or null for data not found
3. Quote or reference specific pages when making claims
4. Prioritize quantifiable data (numbers, percentages, counts)
5. Identify patterns across multiple pages
6. Extract exact text for testimonials, pricing, features
7. Note confidence level in extraction quality

Return ONLY valid JSON in this exact format:

{
  "description": "2-3 sentence overview with specific value proposition",
  "market_position": "Market Leader|Strong Challenger|Niche Player|Emerging Competitor|Disruptor",
  
  "company_size": "1-10|11-50|51-200|201-500|501-1000|1000+|Unknown",
  "founded_year": "YYYY or 'Unknown'",
  "headquarters": "City, Country or 'Unknown'",
  "funding_stage": "Bootstrapped|Seed|Series A|Series B|Series C|Public|Unknown",
  "employee_count": "Approximate count or range found in content",
  "customer_count": "e.g., '5,000+ customers' or null",
  
  "product_categories": ["Category1", "Category2"],
  "key_features": ["Specific feature with brief description"],
  "integrations_count": 50,
  "technology_stack": ["Tech1", "Tech2"],
  "deployment_options": ["Cloud", "On-Premise", "Hybrid"],
  
  "pricing_model": "Freemium|Subscription|Usage-Based|Per-Seat|Enterprise|Tiered|Unknown",
  "pricing_tiers": [
    {
      "name": "Starter",
      "price": "$29/month",
      "features": ["Feature 1", "Feature 2"]
    }
  ],
  "has_free_trial": true,
  "has_free_plan": false,
  
  "target_industries": ["Healthcare", "Finance"],
  "target_company_size": ["SMB", "Mid-Market", "Enterprise"],
  "primary_use_cases": ["Specific use case description"],
  "ideal_customer_profile": "Who they serve best based on content",
  
  "notable_customers": ["Company1", "Company2"],
  "case_study_count": 10,
  "testimonial_highlights": ["Actual customer quote"],
  "awards_certifications": ["SOC 2", "ISO 27001"],
  "partnerships": ["Partner1", "Partner2"],
  
  "strengths": [
    "SPECIFIC competitive advantage with evidence: 'Enterprise-grade security with SOC 2 Type II compliance mentioned on security page'"
  ],
  "weaknesses": [
    "SPECIFIC gap or limitation with evidence: 'No mobile app mentioned anywhere on site'"
  ],
  "unique_value_propositions": ["What they claim makes them unique"],
  "competitive_moats": ["What makes them defensible"],
  "key_differentiators": ["How they differentiate vs competitors"],
  
  "recent_developments": ["Recent announcement or development from news/blog"],
  "growth_indicators": "Rapidly growing|Stable|Mature|Declining|Unknown",
  "market_sentiment": "Overall sentiment from content tone",
  
  "resources": [
    {
      "title": "Exact page title",
      "url": "Full URL",
      "category": "website|documentation|case_studies|pricing|features|comparison|social_media|marketing|other",
      "description": "What this resource contains"
    }
  ],
  
  "notes": "Comprehensive intelligence summary in markdown format with sections:\\n## Executive Summary\\nBrief 2-3 sentence overview\\n\\n## Key Competitive Insights\\n- Insight 1 with evidence\\n- Insight 2 with evidence\\n\\n## Strategic Recommendations\\n- How to compete against their strengths\\n- How to exploit their weaknesses\\n\\n## Open Questions\\n- What we couldn't determine and need to research manually"
}`;

  try {
    console.log('[competitor-intel] Calling AI for enhanced competitive intelligence extraction');
    
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
            content: "You are an expert competitive intelligence analyst. Return only valid JSON with comprehensive, actionable, and evidence-based competitive insights. Be specific and quantitative." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      console.error(`AI extraction failed: ${response.status}`);
      return createEnhancedFallbackProfile(website, pages);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log('[competitor-intel] AI response received, parsing...');
    
    // Enhanced JSON extraction (handle markdown wrapping)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const directMatch = content.match(/\{[\s\S]*\}/);
      if (directMatch) {
        jsonStr = directMatch[0];
      }
    }
    
    const extracted = JSON.parse(jsonStr);

    // Build validated profile with all fields
    const profile: CompetitorProfile = {
      description: extracted.description || `Competitor analysis for ${website}`,
      market_position: extracted.market_position || "Unknown",
      strengths: Array.isArray(extracted.strengths) ? extracted.strengths : [],
      weaknesses: Array.isArray(extracted.weaknesses) ? extracted.weaknesses : [],
      resources: Array.isArray(extracted.resources) ? extracted.resources : [
        { title: "Website", url: website, category: "website" }
      ],
      notes: extracted.notes || "No additional notes available",
      
      // Company intelligence
      company_size: extracted.company_size,
      founded_year: extracted.founded_year,
      headquarters: extracted.headquarters,
      funding_stage: extracted.funding_stage,
      employee_count: extracted.employee_count,
      customer_count: extracted.customer_count,
      
      // Product intelligence
      product_categories: extracted.product_categories,
      key_features: extracted.key_features,
      integrations_count: extracted.integrations_count,
      technology_stack: extracted.technology_stack,
      deployment_options: extracted.deployment_options,
      
      // Pricing intelligence
      pricing_model: extracted.pricing_model,
      pricing_tiers: extracted.pricing_tiers,
      has_free_trial: extracted.has_free_trial,
      has_free_plan: extracted.has_free_plan,
      
      // Target market
      target_industries: extracted.target_industries,
      target_company_size: extracted.target_company_size,
      primary_use_cases: extracted.primary_use_cases,
      ideal_customer_profile: extracted.ideal_customer_profile,
      
      // Social proof
      notable_customers: extracted.notable_customers,
      case_study_count: extracted.case_study_count,
      testimonial_highlights: extracted.testimonial_highlights,
      awards_certifications: extracted.awards_certifications,
      partnerships: extracted.partnerships,
      
      // Competitive differentiation
      unique_value_propositions: extracted.unique_value_propositions,
      competitive_moats: extracted.competitive_moats,
      key_differentiators: extracted.key_differentiators,
      
      // Market insights
      recent_developments: extracted.recent_developments,
      growth_indicators: extracted.growth_indicators,
      market_sentiment: extracted.market_sentiment
    };

    // Calculate quality metrics
    const qualityMetrics = calculateQualityMetrics(profile);
    
    console.log(`[competitor-intel] ✅ Successfully extracted competitive intelligence`);
    console.log(`[competitor-intel] Quality: ${qualityMetrics.quality_rating} (${qualityMetrics.completeness_score}% complete)`);

    const diagnostics = {
      used_sitemap: false,
      ai_calls: 1,
      cache_hit: false,
      ...qualityMetrics
    };

    return { profile, diagnostics };

  } catch (error: any) {
    console.error("[competitor-intel] AI extraction error:", error);
    return createEnhancedFallbackProfile(website, pages);
  }
}

/**
 * Calculate quality metrics for extracted profile
 */
function calculateQualityMetrics(profile: CompetitorProfile) {
  const allFields = [
    'description', 'market_position', 'strengths', 'weaknesses', 'resources', 'notes',
    'company_size', 'founded_year', 'headquarters', 'funding_stage', 'employee_count', 'customer_count',
    'product_categories', 'key_features', 'integrations_count', 'technology_stack', 'deployment_options',
    'pricing_model', 'pricing_tiers', 'has_free_trial', 'has_free_plan',
    'target_industries', 'target_company_size', 'primary_use_cases', 'ideal_customer_profile',
    'notable_customers', 'case_study_count', 'testimonial_highlights', 'awards_certifications', 'partnerships',
    'unique_value_propositions', 'competitive_moats', 'key_differentiators',
    'recent_developments', 'growth_indicators', 'market_sentiment'
  ];
  
  let fieldsExtracted = 0;
  const fieldsMissing: string[] = [];
  
  for (const field of allFields) {
    const value = (profile as any)[field];
    if (value !== undefined && value !== null && value !== 'Unknown' && 
        (!Array.isArray(value) || value.length > 0)) {
      fieldsExtracted++;
    } else {
      fieldsMissing.push(field);
    }
  }
  
  const completenessScore = Math.round((fieldsExtracted / allFields.length) * 100);
  
  // Confidence score based on specific high-value fields
  let confidenceScore = 50;
  if (profile.pricing_model && profile.pricing_model !== 'Unknown') confidenceScore += 10;
  if (profile.key_features && profile.key_features.length >= 5) confidenceScore += 10;
  if (profile.customer_count) confidenceScore += 10;
  if (profile.notable_customers && profile.notable_customers.length > 0) confidenceScore += 10;
  if (profile.strengths.length >= 5) confidenceScore += 5;
  if (profile.weaknesses.length >= 5) confidenceScore += 5;
  
  // Quality rating
  let quality_rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (completenessScore >= 75) quality_rating = 'excellent';
  else if (completenessScore >= 60) quality_rating = 'good';
  else if (completenessScore >= 40) quality_rating = 'fair';
  else quality_rating = 'poor';
  
  return {
    completeness_score: completenessScore,
    confidence_score: Math.min(confidenceScore, 100),
    fields_extracted: fieldsExtracted,
    fields_missing: fieldsMissing,
    pricing_found: !!(profile.pricing_model && profile.pricing_model !== 'Unknown'),
    quantitative_data_found: !!(profile.customer_count || profile.employee_count || profile.integrations_count),
    quality_rating
  };
}

/**
 * Create enhanced fallback profile with smarter defaults
 */
function createEnhancedFallbackProfile(
  website: string, 
  pages: Array<{ url: string; content: any }>
): {
  profile: CompetitorProfile;
  diagnostics: any;
} {
  console.log('[competitor-intel] Creating enhanced fallback profile');
  
  // Extract basic info from page content
  const allText = pages.map(p => p.content.mainText).join(' ');
  const allHeadings = pages.flatMap(p => p.content.headings);
  
  // Try to infer features from headings
  const inferredFeatures = allHeadings
    .filter(h => h.length < 100 && (h.toLowerCase().includes('feature') || h.toLowerCase().includes('capability')))
    .slice(0, 5);
  
  // Categorize resources by URL
  const resources = pages.slice(0, 5).map(p => {
    const url = p.url.toLowerCase();
    let category = 'other';
    if (url.includes('/pricing')) category = 'pricing';
    else if (url.includes('/feature')) category = 'features';
    else if (url.includes('/case')) category = 'case_studies';
    else if (url.includes('/doc')) category = 'documentation';
    else if (url.includes('/about')) category = 'website';
    
    return {
      title: p.content.title || "Discovered Page",
      url: p.url,
      category,
      description: p.content.metaDescription || undefined
    };
  });
  
  return {
    profile: {
      description: `Competitive analysis in progress for ${website}. AI extraction unavailable - basic information extracted from ${pages.length} pages.`,
      market_position: "Unknown",
      strengths: [],
      weaknesses: [],
      resources,
      notes: "## Data Collection Status\n\nAI extraction was unavailable. Please review the discovered pages and add detailed competitive intelligence manually.\n\n## Discovered Resources\n\nSuccessfully discovered and extracted content from " + pages.length + " pages. Review the resources section for available pages.",
      key_features: inferredFeatures.length > 0 ? inferredFeatures : undefined
    },
    diagnostics: {
      used_sitemap: false,
      ai_calls: 0,
      cache_hit: false,
      completeness_score: 20,
      confidence_score: 30,
      fields_extracted: 4,
      quality_rating: 'poor' as const
    }
  };
}
