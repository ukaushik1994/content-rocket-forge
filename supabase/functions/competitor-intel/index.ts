import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { extractPageContent } from "../shared/content-extractor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetitorIntelRequest {
  userId: string;
  website: string;
  competitorId?: string;
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
    const { userId, website, competitorId, maxPages = 10, recrawl = false }: CompetitorIntelRequest = await req.json();

    if (!userId || !website) {
      throw new Error("Missing required fields: userId, website");
    }

    console.log(`[competitor-intel] Starting analysis for: ${website}`);
    console.log(`[competitor-intel] Competitor ID: ${competitorId || 'N/A'}`);
    console.log(`[competitor-intel] Max pages: ${maxPages}, Recrawl: ${recrawl}`);

    // Step 1: Discover competitor pages using enhanced SERP queries
    let discoveredUrls = await discoverCompetitorPages(website);
    console.log(`[competitor-intel] Discovered ${discoveredUrls.length} competitor pages via SERP`);

    // Step 1b: Fallback to direct URL crawling if SERP failed
    if (discoveredUrls.length === 0) {
      console.log(`[competitor-intel] ⚠️ SERP failed - switching to direct URL crawling fallback`);
      discoveredUrls = await fallbackDirectCrawl(website);
      console.log(`[competitor-intel] Fallback crawling found ${discoveredUrls.length} URLs`);
    }

    if (discoveredUrls.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not discover competitor pages. The website may be blocking automated access. Please try entering information manually."
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

    // Save intelligence data to database if we have a competitorId
    if (competitorId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('[competitor-intel] ⚠️ Missing Supabase credentials - cannot save to database');
          console.error('[competitor-intel] SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
          console.error('[competitor-intel] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
        } else {
          console.log('[competitor-intel] 💾 Saving intelligence data to database for competitor:', competitorId);
          
          const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });

          const { data, error } = await supabaseClient
            .from('company_competitors')
            .update({
              intelligence_data: profile,
              quality_metrics: diagnostics,
              last_analyzed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', competitorId)
            .select();

          if (error) {
            console.error('[competitor-intel] ❌ Database save error:', error);
            console.error('[competitor-intel] Error details:', JSON.stringify(error, null, 2));
          } else {
            console.log('[competitor-intel] ✅ Successfully saved to database');
            console.log('[competitor-intel] Updated rows:', data?.length || 0);
          }
        }
      } catch (dbError: any) {
        console.error('[competitor-intel] 💥 Database save exception:', dbError);
        console.error('[competitor-intel] Exception details:', dbError.message);
      }
    } else {
      console.log('[competitor-intel] ⚠️ No competitorId provided, skipping database save');
    }

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
 * Fallback direct URL crawling when SERP is unavailable
 */
async function fallbackDirectCrawl(website: string): Promise<string[]> {
  console.log(`[competitor-intel] 🔧 Starting fallback direct URL crawling for ${website}`);
  
  const baseUrl = website.endsWith('/') ? website.slice(0, -1) : website;
  const urlsToTry = [
    baseUrl,
    `${baseUrl}/about`,
    `${baseUrl}/about-us`,
    `${baseUrl}/company`,
    `${baseUrl}/pricing`,
    `${baseUrl}/plans`,
    `${baseUrl}/features`,
    `${baseUrl}/product`,
    `${baseUrl}/products`,
    `${baseUrl}/solutions`,
    `${baseUrl}/customers`,
    `${baseUrl}/case-studies`,
    `${baseUrl}/testimonials`,
    `${baseUrl}/integrations`,
    `${baseUrl}/partners`,
    `${baseUrl}/enterprise`,
    `${baseUrl}/contact`,
    `${baseUrl}/blog`
  ];

  const validUrls: string[] = [];

  // Test each URL with a HEAD request to see if it exists
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CompetitorIntel/1.0)'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        validUrls.push(url);
        console.log(`[competitor-intel] ✅ Found valid URL: ${url}`);
      }
    } catch (error) {
      // Silently skip failed URLs
      continue;
    }
  }

  console.log(`[competitor-intel] 📊 Direct crawl found ${validUrls.length} valid URLs`);
  return validUrls;
}

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
      
      // Handle rate limits gracefully - stop trying SERP and use fallback instead
      if (response.status === 429 || data.isRateLimited) {
        console.warn(`⚠️ SERP rate limited - stopping SERP queries and will use fallback`);
        break; // Exit the loop immediately instead of continuing
      }

      if (!response.ok) {
        console.warn(`⚠️ SERP query failed (${response.status}): ${query}`);
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

EXTRACTED CONTENT FROM ${pages.length} PAGES:
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
    console.log('[competitor-intel] 🤖 Calling AI for enhanced competitive intelligence extraction');
    console.log('[competitor-intel] 📊 Prompt length:', prompt.length, 'chars');
    console.log('[competitor-intel] 📄 Pages being analyzed:', pages.length);
    
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
      const errorText = await response.text();
      console.error('[competitor-intel] ❌ AI extraction failed:', response.status, errorText);
      return createEnhancedFallbackProfile(website, pages);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log('[competitor-intel] ✅ AI response received');
    console.log('[competitor-intel] 📝 Raw AI content length:', content.length, 'chars');
    
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
    
    console.log('[competitor-intel] 🔍 Parsing JSON...');
    const extracted = JSON.parse(jsonStr);
    console.log('[competitor-intel] ✅ JSON parsed successfully');
    console.log('[competitor-intel] 📊 Extracted fields:', Object.keys(extracted).length);

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
    console.log(`[competitor-intel] 🎯 Quality: ${qualityMetrics.quality_rating} (${qualityMetrics.completeness_score}% complete)`);
    console.log(`[competitor-intel] 📊 Fields: ${qualityMetrics.fields_extracted} extracted, ${qualityMetrics.fields_missing?.length} missing`);

    const diagnostics = {
      used_sitemap: false,
      ai_calls: 1,
      cache_hit: false,
      ...qualityMetrics
    };

    return { profile, diagnostics };

  } catch (error: any) {
    console.error('[competitor-intel] ❌ AI extraction error:', error);
    console.error('[competitor-intel] 💥 Error stack:', error.stack);
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
 * Enhanced fallback profile with better extraction
 */
function createEnhancedFallbackProfile(
  website: string,
  pages: Array<{ url: string; content: any }>
): {
  profile: CompetitorProfile;
  diagnostics: any;
} {
  console.log('[competitor-intel] 🔄 Creating enhanced fallback profile');
  console.log('[competitor-intel] 📄 Processing', pages.length, 'pages for fallback');
  
  // Extract basic data from page metadata
  const firstPage = pages[0];
  const description = firstPage?.content?.metaDescription || 
    firstPage?.content?.title || 
    `Competitor website: ${website}`;

  console.log('[competitor-intel] 📋 Extracted description:', description);

  // Infer product categories from headings
  const allHeadings = pages.flatMap(p => p.content?.headings || []);
  const product_categories = inferCategories(allHeadings);
  console.log('[competitor-intel] 🏷️ Inferred categories:', product_categories);

  // Extract features from headings and content
  const key_features = extractFeatures(pages, allHeadings);
  console.log('[competitor-intel] ✨ Extracted features:', key_features.length);

  // Detect pricing info with better inference
  const pricingPage = pages.find(p => p.url.toLowerCase().includes('pricing'));
  const pricing_model = inferPricingModel(pages, pricingPage);
  const pricing_tiers = extractPricingTiers(pricingPage);
  console.log('[competitor-intel] 💰 Pricing model:', pricing_model);
  console.log('[competitor-intel] 📊 Pricing tiers:', pricing_tiers?.length || 0);

  // Extract company info from About pages
  const aboutPage = pages.find(p => 
    p.url.toLowerCase().includes('about') || 
    p.url.toLowerCase().includes('company')
  );
  const companyInfo = extractCompanyInfo(aboutPage);
  console.log('[competitor-intel] 🏢 Company info extracted:', Object.keys(companyInfo).length, 'fields');

  // Extract customers and social proof
  const socialProof = extractSocialProof(pages);
  console.log('[competitor-intel] 👥 Social proof:', Object.keys(socialProof).length, 'fields');
  
  // Categorize resources
  const resources = pages.map(p => ({
    title: p.content?.title || 'Untitled Page',
    url: p.url,
    category: categorizeUrl(p.url),
    description: p.content?.metaDescription || undefined
  }));

  const profile: CompetitorProfile = {
    description,
    market_position: 'Unknown',
    strengths: inferStrengths(pages, key_features, socialProof),
    weaknesses: inferWeaknesses(pages),
    resources,
    notes: `## Fallback Extraction\nData extracted from ${pages.length} pages using metadata and content analysis (AI extraction unavailable).\n\n## Available Data\n- ${key_features.length} features identified\n- ${product_categories.length} product categories\n- ${resources.length} resources catalogued\n- Pricing: ${pricing_model}\n\n## Recommendation\nFor more comprehensive intelligence, ensure LOVABLE_API_KEY is configured and retry extraction.`,
    
    // Company Intelligence
    ...companyInfo,
    
    // Product Intelligence
    product_categories: product_categories.length > 0 ? product_categories : undefined,
    key_features: key_features.length > 0 ? key_features : undefined,
    technology_stack: inferTechStack(pages),
    deployment_options: inferDeploymentOptions(pages),
    
    // Pricing Intelligence
    pricing_model,
    pricing_tiers: pricing_tiers && pricing_tiers.length > 0 ? pricing_tiers : undefined,
    has_free_trial: detectFreeTrial(pages),
    has_free_plan: detectFreePlan(pages),
    
    // Social Proof
    ...socialProof,
    
    // Target Market
    target_industries: inferIndustries(pages),
    primary_use_cases: inferUseCases(allHeadings)
  };

  const completenessScore = calculateCompletenessScore(profile);
  const qualityRating = determineQualityRating(profile);
  
  console.log('[competitor-intel] ✅ Fallback profile complete');
  console.log('[competitor-intel] 🎯 Completeness:', completenessScore + '%');
  console.log('[competitor-intel] ⭐ Quality:', qualityRating);

  return {
    profile,
    diagnostics: {
      ai_calls: 0,
      cache_hit: false,
      completeness_score: completenessScore,
      confidence_score: 0.5,
      fields_extracted: Object.keys(profile).filter(k => profile[k as keyof CompetitorProfile] != null).length,
      quality_rating: qualityRating,
      pricing_found: Boolean(pricing_model && pricing_model !== 'Unknown'),
      quantitative_data_found: Boolean(companyInfo.employee_count || companyInfo.customer_count),
      used_sitemap: false
    }
  };
}

// ============= HELPER FUNCTIONS FOR FALLBACK =============

function inferCategories(headings: string[]): string[] {
  const categories = new Set<string>();
  const categoryKeywords = {
    'CRM': ['crm', 'customer relationship'],
    'Analytics': ['analytics', 'reporting', 'insights', 'data'],
    'Marketing': ['marketing', 'campaigns', 'email'],
    'Sales': ['sales', 'pipeline', 'deals'],
    'Support': ['support', 'helpdesk', 'ticketing'],
    'Project Management': ['project', 'task', 'collaboration'],
    'Communication': ['chat', 'messaging', 'video']
  };

  for (const heading of headings) {
    const lower = heading.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        categories.add(category);
      }
    }
  }
  
  return Array.from(categories).slice(0, 5);
}

function extractFeatures(pages: Array<{ url: string; content: any }>, allHeadings: string[]): string[] {
  const features = new Set<string>();
  
  // From headings
  allHeadings
    .filter(h => h.length < 100 && (
      h.toLowerCase().includes('feature') || 
      h.toLowerCase().includes('capability') ||
      h.toLowerCase().includes('benefit')
    ))
    .forEach(h => features.add(h));
  
  // From feature page content
  const featurePage = pages.find(p => p.url.toLowerCase().includes('feature'));
  if (featurePage) {
    featurePage.content.headings
      .filter((h: string) => h.length > 10 && h.length < 100)
      .slice(0, 10)
      .forEach((h: string) => features.add(h));
  }
  
  return Array.from(features).slice(0, 10);
}

function inferPricingModel(pages: Array<{ url: string; content: any }>, pricingPage?: { url: string; content: any }): string {
  if (!pricingPage) return 'Unknown';
  
  const content = pricingPage.content.mainText.toLowerCase();
  
  if (content.includes('per user') || content.includes('per seat')) return 'Per-Seat';
  if (content.includes('free') && content.includes('premium')) return 'Freemium';
  if (content.includes('usage') || content.includes('pay as you go')) return 'Usage-Based';
  if (content.includes('tier') || content.includes('plan')) return 'Tiered';
  if (content.includes('subscription') || content.includes('/month')) return 'Subscription';
  if (content.includes('enterprise') || content.includes('contact')) return 'Enterprise';
  
  return 'Subscription'; // default guess
}

function extractPricingTiers(pricingPage?: { url: string; content: any }): Array<{ name: string; price?: string; features?: string[] }> | undefined {
  if (!pricingPage) return undefined;
  
  const tiers: Array<{ name: string; price?: string; features?: string[] }> = [];
  const headings = pricingPage.content.headings;
  const content = pricingPage.content.mainText;
  
  // Look for common tier names
  const tierNames = ['free', 'starter', 'basic', 'professional', 'pro', 'business', 'enterprise', 'premium'];
  
  for (const heading of headings) {
    const lower = heading.toLowerCase();
    if (tierNames.some(name => lower.includes(name))) {
      // Try to extract price from nearby content
      const priceMatch = content.match(/\$\d+(?:\.\d{2})?(?:\/month|\/mo|\/year)?/i);
      tiers.push({
        name: heading,
        price: priceMatch ? priceMatch[0] : undefined
      });
    }
  }
  
  return tiers.length > 0 ? tiers.slice(0, 5) : undefined;
}

function extractCompanyInfo(aboutPage?: { url: string; content: any }): Partial<CompetitorProfile> {
  if (!aboutPage) return {};
  
  const content = aboutPage.content.mainText;
  const info: Partial<CompetitorProfile> = {};
  
  // Try to find founding year
  const yearMatch = content.match(/founded in (\d{4})|since (\d{4})|established (\d{4})/i);
  if (yearMatch) {
    info.founded_year = yearMatch[1] || yearMatch[2] || yearMatch[3];
  }
  
  // Try to find headquarters
  const hqMatch = content.match(/based in ([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)*)|headquarters in ([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)*)/i);
  if (hqMatch) {
    info.headquarters = hqMatch[1] || hqMatch[2];
  }
  
  // Try to find employee count
  const empMatch = content.match(/(\d+[\+]?)\s+employees?/i);
  if (empMatch) {
    info.employee_count = empMatch[1] + ' employees';
  }
  
  // Try to find customer count
  const custMatch = content.match(/(\d+[,\d]*[\+]?)\s+(?:customers?|clients?|users?)/i);
  if (custMatch) {
    info.customer_count = custMatch[1] + ' customers';
  }
  
  return info;
}

function extractSocialProof(pages: Array<{ url: string; content: any }>): Partial<CompetitorProfile> {
  const proof: Partial<CompetitorProfile> = {};
  
  // Look for customer logos/names
  const customers = new Set<string>();
  for (const page of pages) {
    const content = page.content.mainText.toLowerCase();
    
    // Common indicators
    if (content.includes('trusted by') || content.includes('used by')) {
      // Try to extract company names (simplified)
      const matches = page.content.mainText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (matches) {
        matches.slice(0, 5).forEach((m: string) => customers.add(m));
      }
    }
  }
  
  if (customers.size > 0) {
    proof.notable_customers = Array.from(customers).slice(0, 10);
  }
  
  // Count case studies
  const caseStudyPages = pages.filter(p => 
    p.url.toLowerCase().includes('case') || 
    p.url.toLowerCase().includes('customer') ||
    p.content.title.toLowerCase().includes('case study')
  );
  if (caseStudyPages.length > 0) {
    proof.case_study_count = caseStudyPages.length;
  }
  
  return proof;
}

function inferStrengths(pages: Array<{ url: string; content: any }>, features: string[], socialProof: Partial<CompetitorProfile>): string[] {
  const strengths: string[] = [];
  
  if (features.length >= 5) {
    strengths.push(`Comprehensive feature set with ${features.length}+ capabilities identified`);
  }
  
  if (socialProof.notable_customers && socialProof.notable_customers.length > 0) {
    strengths.push(`Established customer base with ${socialProof.notable_customers.length}+ notable clients`);
  }
  
  if (socialProof.case_study_count && socialProof.case_study_count >= 3) {
    strengths.push(`Strong social proof with ${socialProof.case_study_count}+ case studies published`);
  }
  
  // Check for security/compliance mentions
  const allContent = pages.map(p => p.content.mainText.toLowerCase()).join(' ');
  if (allContent.includes('soc 2') || allContent.includes('iso') || allContent.includes('gdpr')) {
    strengths.push('Security and compliance certifications mentioned');
  }
  
  if (allContent.includes('api') || allContent.includes('integration')) {
    strengths.push('Integration capabilities and API access available');
  }
  
  return strengths;
}

function inferWeaknesses(pages: Array<{ url: string; content: any }>): string[] {
  const weaknesses: string[] = [];
  const allUrls = pages.map(p => p.url.toLowerCase());
  const allContent = pages.map(p => p.content.mainText.toLowerCase()).join(' ');
  
  // Check for missing common pages
  if (!allUrls.some(u => u.includes('pricing'))) {
    weaknesses.push('Pricing information not readily available on website');
  }
  
  if (!allUrls.some(u => u.includes('doc') || u.includes('api'))) {
    weaknesses.push('Limited public documentation or API resources');
  }
  
  if (!allContent.includes('mobile') && !allContent.includes('ios') && !allContent.includes('android')) {
    weaknesses.push('No mobile app mentioned in available content');
  }
  
  return weaknesses;
}

function inferTechStack(pages: Array<{ url: string; content: any }>): string[] | undefined {
  const stack = new Set<string>();
  const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'aws', 'azure', 'gcp', 'kubernetes', 'docker'];
  
  for (const page of pages) {
    const content = page.content.mainText.toLowerCase();
    for (const tech of techKeywords) {
      if (content.includes(tech)) {
        stack.add(tech.charAt(0).toUpperCase() + tech.slice(1));
      }
    }
  }
  
  return stack.size > 0 ? Array.from(stack) : undefined;
}

function inferDeploymentOptions(pages: Array<{ url: string; content: any }>): string[] | undefined {
  const options = new Set<string>();
  const allContent = pages.map(p => p.content.mainText.toLowerCase()).join(' ');
  
  if (allContent.includes('cloud') || allContent.includes('saas')) options.add('Cloud');
  if (allContent.includes('on-premise') || allContent.includes('on premise') || allContent.includes('self-hosted')) options.add('On-Premise');
  if (allContent.includes('hybrid')) options.add('Hybrid');
  
  return options.size > 0 ? Array.from(options) : undefined;
}

function detectFreeTrial(pages: Array<{ url: string; content: any }>): boolean | undefined {
  const allContent = pages.map(p => p.content.mainText.toLowerCase()).join(' ');
  if (allContent.includes('free trial') || allContent.includes('try free')) return true;
  return undefined;
}

function detectFreePlan(pages: Array<{ url: string; content: any }>): boolean | undefined {
  const allContent = pages.map(p => p.content.mainText.toLowerCase()).join(' ');
  if (allContent.includes('free plan') || allContent.includes('free forever') || allContent.includes('free tier')) return true;
  return undefined;
}

function inferIndustries(pages: Array<{ url: string; content: any }>): string[] | undefined {
  const industries = new Set<string>();
  const industryKeywords = ['healthcare', 'finance', 'retail', 'education', 'manufacturing', 'technology', 'ecommerce', 'real estate'];
  
  const allContent = pages.map(p => p.content.mainText.toLowerCase()).join(' ');
  
  for (const industry of industryKeywords) {
    if (allContent.includes(industry)) {
      industries.add(industry.charAt(0).toUpperCase() + industry.slice(1));
    }
  }
  
  return industries.size > 0 ? Array.from(industries) : undefined;
}

function inferUseCases(headings: string[]): string[] | undefined {
  const useCases = new Set<string>();
  
  for (const heading of headings) {
    const lower = heading.toLowerCase();
    if (lower.includes('use case') || lower.includes('solution') || lower.includes('for ')) {
      useCases.add(heading);
    }
  }
  
  return useCases.size > 0 ? Array.from(useCases).slice(0, 5) : undefined;
}

function categorizeUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('pricing')) return 'pricing';
  if (lower.includes('feature')) return 'features';
  if (lower.includes('case') || lower.includes('customer') || lower.includes('testimonial')) return 'case_studies';
  if (lower.includes('doc') || lower.includes('api') || lower.includes('developer')) return 'documentation';
  if (lower.includes('about') || lower.includes('company')) return 'website';
  if (lower.includes('blog') || lower.includes('news')) return 'marketing';
  if (lower.includes('compare') || lower.includes('vs') || lower.includes('alternative')) return 'comparison';
  if (lower.includes('linkedin') || lower.includes('twitter') || lower.includes('facebook')) return 'social_media';
  return 'other';
}

function calculateCompletenessScore(profile: CompetitorProfile): number {
  const fields = Object.keys(profile).filter(k => {
    const val = profile[k as keyof CompetitorProfile];
    return val !== undefined && val !== null && val !== 'Unknown' && (!Array.isArray(val) || val.length > 0);
  });
  return Math.round((fields.length / 35) * 100); // 35 total possible fields
}

function determineQualityRating(profile: CompetitorProfile): 'excellent' | 'good' | 'fair' | 'poor' {
  const score = calculateCompletenessScore(profile);
  if (score >= 75) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}
