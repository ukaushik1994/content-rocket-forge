import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.2';
import { corsHeaders } from "../_shared/cors.ts";
import { 
  normalizeDomain, 
  getBaseUrl, 
  categorizeUrl, 
  getCategoryPriority,
  toResourceCategory,
  isValidHttpUrl,
  generateCacheKey
} from "../shared/url-utils.ts";
import { extractPageContent, chunkText } from "../shared/content-extractor.ts";
import { fetchRobotsTxt, parseRobotsTxt, isUrlAllowed } from "../shared/robots-parser.ts";
import { getApiKey } from "../shared/apiKeyService.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  category: string;
  priority: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
    const body = await req.json();
    const { website, maxPages = 20, detectMultiple = true, recrawl = false } = body;
    const userIdFromBody = body.userId ?? body.user_id;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    if (userIdFromBody && userIdFromBody !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!website) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Starting solution intel for: ${website}`);

    const domain = normalizeDomain(website);
    const baseUrl = getBaseUrl(domain);
    const cacheKey = await generateCacheKey(domain + "_solutions");

    // Check cache using competitor_cache table
    const { data: cached } = await supabase
      .from('competitor_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (cached && !recrawl) {
      const lastCrawled = new Date(cached.last_crawled_at);
      const hoursSince = (Date.now() - lastCrawled.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 24) {
        console.log('✅ Cache hit!');
        return new Response(
          JSON.stringify({
            success: true,
            solutions: cached.profile_data,
            multipleDetected: Array.isArray(cached.profile_data) && (cached.profile_data as any[]).length > 1,
            diagnostics: {
              ...cached.diagnostics,
              cache_hit: true
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let usedSitemap = false;
    let usedSerp = false;
    let selectedUrls: SitemapUrl[] = [];

    // Check robots.txt
    const robotsTxt = await fetchRobotsTxt(domain);
    const robotsRules = robotsTxt 
      ? parseRobotsTxt(robotsTxt, 'SolutionIntelBot')
      : { allowed: true, disallowedPaths: [] };

    console.log(`🤖 Robots.txt rules:`, robotsRules);

    // Try sitemap discovery (prioritize product/solution pages)
    const sitemapUrls = await discoverSitemap(baseUrl);
    
    if (sitemapUrls.length > 0) {
      console.log(`📄 Found ${sitemapUrls.length} URLs from sitemap`);
      usedSitemap = true;
      
      // Filter by robots.txt
      const allowedUrls = sitemapUrls.filter(url => 
        isUrlAllowed(url.loc, robotsRules)
      );
      
      // Sort by priority (product pages first) and select top URLs
      selectedUrls = allowedUrls
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          if (a.lastmod && b.lastmod) return b.lastmod.localeCompare(a.lastmod);
          return 0;
        })
        .slice(0, maxPages);
    }

    // Fallback to SERP if no sitemap - use user's SERP API key from DB
    if (selectedUrls.length === 0) {
      console.log('🔍 No sitemap found, using SERP fallback');
      usedSerp = true;
      selectedUrls = await fetchUrlsFromSerp(domain, maxPages, userId);
    }

    console.log(`📊 Selected ${selectedUrls.length} URLs to fetch`);

    // Fetch page content with concurrency control
    const pageContents = await fetchPagesWithConcurrency(
      selectedUrls.map(u => ({ url: u.loc, category: u.category })),
      3
    );

    console.log(`📚 Successfully fetched ${pageContents.length} pages`);

    // AI Analysis: Detect and extract solutions using user's AI provider
    const solutions = await analyzeSolutions(domain, pageContents, userId, detectMultiple);

    // Cache the result using competitor_cache table
    await supabase
      .from('competitor_cache')
      .upsert({
        cache_key: cacheKey,
        domain,
        last_crawled_at: new Date().toISOString(),
        url_count: pageContents.length,
        profile_data: solutions,
        diagnostics: {
          used_sitemap: usedSitemap,
          used_serp: usedSerp,
          pages_fetched: pageContents.length,
          products_detected: solutions.length,
          confidence: solutions.length > 0 ? Math.round(solutions.reduce((acc: number, s: any) => acc + (s.metadata?.completeness || 85), 0) / solutions.length) : 0
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        multipleDetected: solutions.length > 1,
        solutions,
        diagnostics: {
          used_sitemap: usedSitemap,
          used_serp: usedSerp,
          pages_fetched: pageContents.length,
          products_detected: solutions.length,
          confidence: solutions.length > 0 ? Math.round(solutions.reduce((acc: number, s: any) => acc + (s.metadata?.completeness || 85), 0) / solutions.length) : 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function discoverSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  const sitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/products.xml', '/solutions.xml'];
  
  for (const path of sitemapPaths) {
    try {
      const url = `${baseUrl}${path}`;
      console.log(`Trying sitemap: ${url}`);
      
      const response = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SolutionIntelBot/1.0)' }
      });
      
      if (!response.ok) continue;
      
      const xml = await response.text();
      const urls = parseSitemapXml(xml, baseUrl);
      
      if (urls.length > 0) {
        console.log(`✅ Found sitemap at ${path} with ${urls.length} URLs`);
        return urls;
      }
    } catch (error) {
      console.log(`Failed to fetch ${path}:`, error);
    }
  }
  
  return [];
}

function parseSitemapXml(xml: string, baseUrl: string): SitemapUrl[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const result = parser.parse(xml);
    const urls: SitemapUrl[] = [];
    
    // Handle sitemap index
    if (result.sitemapindex?.sitemap) {
      const sitemaps = Array.isArray(result.sitemapindex.sitemap) 
        ? result.sitemapindex.sitemap 
        : [result.sitemapindex.sitemap];
      
      return sitemaps.map((s: any) => ({
        loc: s.loc,
        category: 'sitemap',
        priority: 1
      })).filter((u: SitemapUrl) => isValidHttpUrl(u.loc));
    }
    
    // Handle URL set
    if (result.urlset?.url) {
      const urlEntries = Array.isArray(result.urlset.url) 
        ? result.urlset.url 
        : [result.urlset.url];
      
      for (const entry of urlEntries) {
        const loc = entry.loc;
        if (loc && isValidHttpUrl(loc)) {
          urls.push({
            loc,
            lastmod: entry.lastmod,
            category: categorizeUrl(loc),
            priority: getCategoryPriority(categorizeUrl(loc))
          });
        }
      }
    }
    
    return urls;
  } catch (error) {
    console.error('XML parse error:', error);
    return [];
  }
}

/**
 * Fetch URLs from SERP using the user's configured SERP API key from the database
 */
async function fetchUrlsFromSerp(domain: string, maxUrls: number, userId: string): Promise<SitemapUrl[]> {
  // Get the user's SERP API key from the database
  const serpApiKey = await getApiKey('serp', userId);
  const serpstackKey = !serpApiKey ? await getApiKey('serpstack', userId) : null;
  
  const discoveredUrls: SitemapUrl[] = [];
  
  if (serpApiKey || serpstackKey) {
    console.log(`🔑 Using user's ${serpApiKey ? 'SerpAPI' : 'Serpstack'} key for URL discovery`);
    
    const queries = [
      `site:${domain} pricing OR plans`,
      `site:${domain} case study OR success story OR customer`,
      `site:${domain} features OR capabilities`,
      `site:${domain} product OR solution`,
      `site:${domain} vs OR versus OR compared to`,
      `site:${domain} why choose OR why us OR advantages`,
      `site:${domain} customers OR clients OR companies using`,
      `site:${domain} integrations OR works with OR connects to`
    ];
    
    for (const query of queries) {
      try {
        let serpResults;
        
        if (serpApiKey) {
          const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=3`);
          const data = await response.json();
          serpResults = data.organic_results || [];
        } else if (serpstackKey) {
          const response = await fetch(`http://api.serpstack.com/search?access_key=${serpstackKey}&query=${encodeURIComponent(query)}&num=3`);
          const data = await response.json();
          serpResults = data.organic_results || [];
        }
        
        if (serpResults) {
          serpResults.forEach((result: any) => {
            const url = result.link || result.url;
            if (url && isValidHttpUrl(url)) {
              const category = categorizeUrl(url);
              const priority = getCategoryPriority(category);
              discoveredUrls.push({ loc: url, category, priority });
            }
          });
        }
      } catch (error) {
        console.log(`SERP query failed for: ${query}`, error);
      }
    }
  } else {
    console.warn('⚠️ No SERP API key configured for user. Using fallback URLs.');
  }
  
  // Fallback to base URLs
  if (discoveredUrls.length === 0) {
    const baseUrls = [
      { loc: `https://${domain}`, category: 'homepage', priority: 1 },
      { loc: `https://${domain}/products`, category: 'product/service', priority: 1 },
      { loc: `https://${domain}/solutions`, category: 'product/service', priority: 1 },
      { loc: `https://${domain}/pricing`, category: 'product/service', priority: 2 },
      { loc: `https://${domain}/features`, category: 'product/service', priority: 2 },
      { loc: `https://${domain}/customers`, category: 'case-study', priority: 2 },
      { loc: `https://${domain}/case-studies`, category: 'case-study', priority: 2 }
    ];
    
    return baseUrls.slice(0, maxUrls);
  }
  
  // Remove duplicates and sort by priority
  const uniqueUrls = Array.from(new Map(discoveredUrls.map(u => [u.loc, u])).values());
  return uniqueUrls
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxUrls);
}

async function fetchPagesWithConcurrency(
  urls: Array<{ url: string; category: string }>,
  concurrency: number
): Promise<Array<{ url: string; category: string; content: any }>> {
  const results: Array<{ url: string; category: string; content: any }> = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async ({ url, category }) => {
        const content = await extractPageContent(url);
        return { url, category, content };
      })
    );
    
    results.push(...batchResults.filter(r => r.content !== null));
  }
  
  return results;
}

async function analyzeSolutions(
  domain: string,
  pages: Array<{ url: string; category: string; content: any }>,
  userId: string,
  detectMultiple: boolean
): Promise<any[]> {
  // STEP 1: Detect products
  const products = await detectProducts(domain, pages, userId, detectMultiple);
  
  if (!products || products.length === 0) {
    console.log('⚠️ No products detected');
    return [];
  }
  
  console.log(`✅ Detected ${products.length} product(s):`, products.map((p: any) => p.product_name));
  
  // STEP 2: Extract detailed data for each product
  const solutions = await Promise.all(
    products.map((product: any) => extractProductDetails(product, pages, userId))
  );
  
  return solutions.filter(Boolean);
}

/**
 * Call AI via ai-proxy edge function using the user's configured AI provider
 */
async function callAiProxy(prompt: string, userId: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      params: {
        input: prompt,
        use_case: 'extraction',
        temperature: 0.3,
        max_tokens: 4000,
        userId
      }
    }
  });

  if (error) {
    console.error('AI proxy error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }

  return data?.content || data?.response || '{}';
}

async function detectProducts(
  domain: string,
  pages: Array<{ url: string; category: string; content: any }>,
  userId: string,
  detectMultiple: boolean
): Promise<any[]> {
  const pageSummaries = pages.slice(0, 15).map(p => {
    const content = p.content;
    return `URL: ${p.url}\nCategory: ${p.category}\nTitle: ${content.title}\nMeta: ${content.metaDescription}\nHeadings: ${content.headings.slice(0, 8).join(', ')}\nText: ${content.mainText.slice(0, 1500)}`;
  }).join('\n\n---\n\n');

  const prompt = `Analyze this website and identify all distinct products, services, and offerings.

Website: ${domain}
Pages analyzed: ${pages.length}

Content:
${pageSummaries}

Return a JSON array with comprehensive offering detection:
{
  "products": [
    {
      "product_name": "Full offering name",
      "product_url": "Direct URL to offering page",
      "brief_description": "One clear sentence",
      "category": "Primary category (e.g., SaaS Product, Professional Service, Consulting, Training, Physical Product, Subscription, Course, Platform)",
      "offering_type": "product|service|subscription|course|consulting|platform|hybrid",
      "target_audience": "Who it's for (e.g., Enterprise HR Teams, Small Business Owners)",
      "key_benefits": ["3-5 main benefits"],
      "confidence_score": 0-100
    }
  ]
}

${detectMultiple ? 'Identify ALL separate products, services, consulting offerings, training programs, courses, subscription products, and any monetizable offering (not features of one product).' : 'Identify only the PRIMARY product/solution.'}

Rules:
- Detect ALL types of offerings: SaaS products, professional services, consulting, physical products, subscriptions, training/courses, platforms
- Only include distinct offerings (not features of the same product)
- Must have confidence >= 75
- Extract category and target audience from context
- Identify key benefits that differentiate the offering
- Return valid JSON only`;

  try {
    const aiResponse = await callAiProxy(prompt, userId);
    
    let parsed;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        parsed = JSON.parse(aiResponse);
      }
    } catch {
      return [];
    }
    
    return parsed.products || [];
  } catch (error) {
    console.error('Failed to detect products:', error);
    return [];
  }
}

async function extractProductDetails(
  product: any,
  pages: Array<{ url: string; category: string; content: any }>,
  userId: string
): Promise<any> {
  // Select 10-15 most relevant pages prioritizing product, pricing, case study pages
  const relevantPages = pages
    .filter(p => 
      p.url.includes(product.product_name.toLowerCase().replace(/\s+/g, '-')) ||
      p.category === 'product/service' ||
      p.category === 'pricing' ||
      p.category === 'case-study' ||
      p.category === 'homepage'
    )
    .sort((a, b) => getCategoryPriority(a.category) - getCategoryPriority(b.category))
    .slice(0, 15);

  const pageContent = relevantPages.map(p => {
    const content = p.content;
    return `URL: ${p.url}\nCategory: ${p.category}\nTitle: ${content.title}\nMeta: ${content.metaDescription}\nContent: ${content.mainText.slice(0, 3000)}`;
  }).join('\n\n---\n\n');

  const prompt = `Extract COMPREHENSIVE solution intelligence for: ${product.product_name}

Analyze these ${relevantPages.length} pages deeply and extract ALL available information:

${pageContent}

Return complete structured JSON with these sections:

{
  "name": "${product.product_name}",
  "description": "2-3 detailed sentences about what this solution does and who it helps",
  "shortDescription": "One compelling sentence (max 150 chars)",
  "category": "${product.category || 'Business Solution'}",
  "positioningStatement": "How they position themselves in 1-2 sentences",
  "uniqueValuePropositions": ["3-5 UVPs with evidence"],
  "keyDifferentiators": ["3-5 competitive advantages"],
  "features": ["12-20 specific, detailed features"],
  "benefits": ["10-15 quantifiable OUTCOMES - format: 'Reduce X by Y%' or 'Achieve X in Y time'"],
  "useCases": ["8-12 specific use cases with outcomes"],
  "painPoints": ["8-12 pain points in customer language"],
  "targetAudience": ["8-12 specific audience segments"],
  "pricing": {
    "model": "subscription|one-time|usage-based|freemium|enterprise|custom|contact-sales",
    "startingPrice": "Extract if mentioned",
    "freeTrialDuration": "Trial duration if mentioned",
    "tiers": [{"name": "Tier name", "price": "Monthly price if found", "features": ["Key features"], "limitations": ["Limitations"]}]
  },
  "technicalSpecs": {
    "systemRequirements": [],
    "supportedPlatforms": [],
    "apiCapabilities": [],
    "securityFeatures": [],
    "performanceMetrics": [],
    "uptimeGuarantee": ""
  },
  "integrations": ["15-25 named integrations"],
  "marketData": {
    "size": "Market size if mentioned",
    "growthRate": "Growth rate if mentioned",
    "geographicAvailability": [],
    "complianceRequirements": []
  },
  "competitors": [{"name": "Competitor name", "strengths": [], "weaknesses": [], "marketShare": "", "pricing": ""}],
  "metrics": {
    "adoptionRate": "",
    "customerSatisfaction": "",
    "roi": "",
    "implementationTime": "",
    "supportResponse": "",
    "usageAnalytics": [{"metric": "", "value": "", "trend": "up|down|stable"}]
  },
  "caseStudies": [{"title": "", "company": "", "industry": "", "challenge": "", "solution": "", "results": [], "metrics": [{"label": "", "value": "", "improvement": ""}], "testimonial": {"quote": "", "author": "", "position": ""}}],
  "tags": ["15-20 searchable tags"]
}

Rules:
- Features = what it does. Benefits = outcome you get. Keep them separate.
- Only include data you can verify from the content
- If pricing/competitors/case studies aren't found, return empty arrays
- ALWAYS fill: features, benefits, useCases, painPoints, targetAudience
- Return ONLY valid JSON. No markdown, no explanations.`;

  try {
    const aiResponse = await callAiProxy(prompt, userId);

    let solution;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        solution = JSON.parse(jsonMatch[1]);
      } else {
        solution = JSON.parse(aiResponse);
      }
    } catch {
      solution = {
        name: product.product_name,
        description: product.brief_description,
        category: 'Business Solution',
        features: [],
        useCases: [],
        painPoints: [],
        targetAudience: [],
        benefits: [],
        integrations: [],
        positioning: {
          positioningStatement: `${product.product_name} - ${product.brief_description}`,
          uniqueValuePropositions: [],
          keyDifferentiators: []
        },
        marketData: {},
        competitors: [],
        metrics: {},
        technicalSpecs: {
          systemRequirements: [],
          supportedPlatforms: [],
          apiCapabilities: [],
          securityFeatures: [],
          performanceMetrics: []
        },
        pricing: {
          model: 'custom',
          tiers: []
        },
        caseStudies: [],
        tags: []
      };
    }
    
    // Post-processing
    if (!solution.integrations && solution.technicalSpecs?.integrations) {
      solution.integrations = solution.technicalSpecs.integrations;
    }
    
    if (!solution.positioningStatement && !solution.positioning?.positioningStatement && solution.description) {
      solution.positioningStatement = `${solution.name}: ${solution.description.split('.')[0]}.`;
    }
    
    // Flatten positioning if nested
    if (solution.positioning) {
      solution.positioningStatement = solution.positioningStatement || solution.positioning.positioningStatement;
      solution.uniqueValuePropositions = solution.uniqueValuePropositions || solution.positioning.uniqueValuePropositions || [];
      solution.keyDifferentiators = solution.keyDifferentiators || solution.positioning.keyDifferentiators || [];
    }
    
    // Add UUIDs to case studies
    if (solution.caseStudies && Array.isArray(solution.caseStudies) && solution.caseStudies.length > 0) {
      solution.caseStudies = solution.caseStudies.map((cs: any) => ({
        id: crypto.randomUUID(),
        ...cs
      }));
    }
    
    // Calculate completeness score
    const completenessScore = calculateCompleteness(solution);
    
    // Add metadata
    solution.externalUrl = product.product_url;
    solution.metadata = {
      completeness: completenessScore,
      lastUpdated: new Date().toISOString()
    };
    
    return solution;
  } catch (error) {
    console.error(`Failed to extract details for ${product.product_name}:`, error);
    return null;
  }
}

function calculateCompleteness(solution: any): number {
  const weights = {
    name: 5,
    description: 5,
    features: 15,
    benefits: 10,
    useCases: 10,
    painPoints: 10,
    targetAudience: 8,
    positioningStatement: 7,
    uniqueValuePropositions: 8,
    keyDifferentiators: 7,
    pricing: 5,
    technicalSpecs: 3,
    integrations: 3,
    marketData: 2,
    competitors: 2,
    metrics: 2,
    caseStudies: 3,
    tags: 3
  };
  
  let score = 0;
  let maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  
  if (solution.name) score += weights.name;
  if (solution.description) score += weights.description;
  
  if (solution.features && solution.features.length > 0) score += weights.features;
  if (solution.benefits && solution.benefits.length > 0) score += weights.benefits;
  if (solution.useCases && solution.useCases.length > 0) score += weights.useCases;
  if (solution.painPoints && solution.painPoints.length > 0) score += weights.painPoints;
  if (solution.targetAudience && solution.targetAudience.length > 0) score += weights.targetAudience;
  if (solution.integrations && solution.integrations.length > 0) score += weights.integrations;
  if (solution.caseStudies && solution.caseStudies.length > 0) score += weights.caseStudies;
  if (solution.tags && solution.tags.length > 0) score += weights.tags;
  
  if (solution.positioningStatement) score += weights.positioningStatement;
  if (solution.uniqueValuePropositions && solution.uniqueValuePropositions.length > 0) score += weights.uniqueValuePropositions;
  if (solution.keyDifferentiators && solution.keyDifferentiators.length > 0) score += weights.keyDifferentiators;
  
  if (solution.pricing && (solution.pricing.model || solution.pricing.tiers?.length > 0)) score += weights.pricing;
  if (solution.technicalSpecs && Object.keys(solution.technicalSpecs).some((k: string) => solution.technicalSpecs[k]?.length > 0)) score += weights.technicalSpecs;
  if (solution.marketData && Object.keys(solution.marketData).length > 0) score += weights.marketData;
  if (solution.competitors && solution.competitors.length > 0) score += weights.competitors;
  if (solution.metrics && Object.keys(solution.metrics).length > 0) score += weights.metrics;
  
  return Math.round((score / maxScore) * 100);
}
