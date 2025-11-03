import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
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
    const { userId, website, maxPages = 20, detectMultiple = true, recrawl = false } = await req.json();

    if (!userId || !website) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Starting solution intel for: ${website}`);

    const domain = normalizeDomain(website);
    const baseUrl = getBaseUrl(domain);
    const cacheKey = await generateCacheKey(domain + "_solutions");

    // Check cache
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: cached } = await supabase
      .from('solution_cache')
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
            solutions: cached.solutions_data,
            multipleDetected: (cached.solutions_data as any[]).length > 1,
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

    // Fallback to SERP if no sitemap
    if (selectedUrls.length === 0) {
      console.log('🔍 No sitemap found, using SERP fallback');
      usedSerp = true;
      selectedUrls = await fetchUrlsFromSerp(domain, maxPages);
    }

    console.log(`📊 Selected ${selectedUrls.length} URLs to fetch`);

    // Fetch page content with concurrency control
    const pageContents = await fetchPagesWithConcurrency(
      selectedUrls.map(u => ({ url: u.loc, category: u.category })),
      3
    );

    console.log(`📚 Successfully fetched ${pageContents.length} pages`);

    // AI Analysis: Detect and extract solutions
    const solutions = await analyzeSolutions(domain, pageContents, userId, detectMultiple);

    // Cache the result
    await supabase
      .from('solution_cache')
      .upsert({
        cache_key: cacheKey,
        domain,
        last_crawled_at: new Date().toISOString(),
        url_count: pageContents.length,
        solutions_data: solutions,
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
  const urls: SitemapUrl[] = [];
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  
  if (!doc) return urls;
  
  // Parse URL entries
  const urlElements = doc.querySelectorAll('url');
  
  urlElements.forEach((urlEl: any) => {
    const loc = urlEl.querySelector('loc')?.textContent?.trim();
    const lastmod = urlEl.querySelector('lastmod')?.textContent?.trim();
    
    if (loc && isValidHttpUrl(loc)) {
      const category = categorizeUrl(loc);
      const priority = getCategoryPriority(category);
      
      urls.push({ loc, lastmod, category, priority });
    }
  });
  
  return urls;
}

async function fetchUrlsFromSerp(domain: string, maxUrls: number): Promise<SitemapUrl[]> {
  // Enhanced SERP discovery - prioritize important pages
  const serpApiKey = Deno.env.get('SERP_API_KEY');
  const serpstackKey = Deno.env.get('SERPSTACK_KEY');
  
  const discoveredUrls: SitemapUrl[] = [];
  
  // Try SERP API to find important pages
  if (serpApiKey || serpstackKey) {
    const queries = [
      `site:${domain} pricing OR plans`,
      `site:${domain} case study OR success story OR customer`,
      `site:${domain} features OR capabilities`,
      `site:${domain} product OR solution`
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

  const prompt = `Analyze this website and identify all distinct products/solutions offered.

Website: ${domain}
Pages analyzed: ${pages.length}

Content:
${pageSummaries}

Return a JSON array with comprehensive product detection:
{
  "products": [
    {
      "product_name": "Full product name",
      "product_url": "Direct URL to product page",
      "brief_description": "One clear sentence",
      "category": "Primary category (e.g., Analytics, CRM, HR Tech, Marketing)",
      "target_audience": "Who it's for (e.g., Enterprise HR Teams, Small Business Owners)",
      "key_benefits": ["3-5 main benefits"],
      "confidence_score": 0-100
    }
  ]
}

${detectMultiple ? 'Identify ALL separate products/solutions offered (not features of one product).' : 'Identify only the PRIMARY product/solution.'}

Rules:
- Only include distinct products (not features of the same product)
- Must have confidence >= 75
- Extract category and target audience from context
- Identify key benefits that differentiate the product
- Return valid JSON only`;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        message: prompt,
        conversationHistory: [],
        userId
      }
    });

    if (error) {
      console.error('AI chat error:', error);
      return [];
    }

    const aiResponse = data.response || '{}';
    
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

Return complete structured JSON:
{
  "name": "${product.product_name}",
  "description": "2-3 detailed sentences about what this solution does and who it helps",
  "shortDescription": "One compelling sentence (max 150 chars)",
  "category": "${product.category || 'Business Solution'}",
  "positioning": "How they position themselves in the market (1-2 sentences)",
  
  "uniqueValuePropositions": [
    "3-5 UVPs with evidence (e.g., 'AI-powered turnover prediction 12 months in advance')"
  ],
  "keyDifferentiators": [
    "3-5 competitive advantages (e.g., 'No SQL required - built for HR not IT')"
  ],
  
  "features": [
    "12-20 specific, detailed features (not just 'Analytics' but 'AI-powered predictive turnover analytics')"
  ],
  "useCases": [
    "8-12 specific use cases with outcomes (e.g., 'Predict turnover 12 months early and reduce attrition by 25%')"
  ],
  "painPoints": [
    "8-12 pain points in customer language (e.g., 'HR data scattered across 10+ systems')"
  ],
  "targetAudience": [
    "8-12 specific audience segments (e.g., 'Chief Human Resources Officers at Fortune 500 companies')"
  ],
  "benefits": [
    "8-12 quantifiable benefits (e.g., 'Reduce reporting time from weeks to minutes')"
  ],
  
  "pricing": {
    "model": "subscription|one-time|usage-based|freemium|enterprise|custom|contact-sales",
    "startingPrice": "Extract if mentioned (e.g., '$99/month', 'Contact sales')",
    "tiers": [
      {
        "name": "Tier name",
        "price": "Monthly price if found",
        "description": "Brief description",
        "features": ["Key features in this tier"]
      }
    ]
  },
  
  "technicalSpecs": {
    "supportedPlatforms": ["Web, iOS, Android, Desktop, etc."],
    "apiCapabilities": ["REST API, GraphQL, Webhooks, etc."],
    "securityFeatures": ["SOC 2, GDPR, SSO, Encryption, etc."],
    "integrations": ["Named integrations like Salesforce, Slack, etc."]
  },
  
  "caseStudies": [
    {
      "companyName": "If found",
      "challenge": "What problem they had",
      "solution": "How the product helped",
      "results": "Quantifiable outcomes"
    }
  ],
  
  "tags": ["15-20 searchable tags for discovery (e.g., 'workforce planning', 'HR analytics', 'turnover prediction')"]
}

CRITICAL INSTRUCTIONS:
- Extract 12-20 DETAILED features (not generic)
- Find 8-12 specific use cases with outcomes
- Identify 8-12 pain points in customer language
- List 8-12 target audience segments
- Extract ALL pricing tiers with features
- Find case studies with metrics if available
- Include 15-20 tags for searchability
- Be comprehensive but only include what you can verify from the content
- If pricing/case studies aren't found, return empty arrays but ALWAYS fill features, use cases, pain points

Return valid JSON only.`;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        message: prompt,
        conversationHistory: [],
        userId
      }
    });

    if (error) {
      console.error('AI chat error:', error);
      return null;
    }

    const aiResponse = data.response || '{}';
    
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
        targetAudience: []
      };
    }
    
    // Add metadata
    solution.externalUrl = product.product_url;
    solution.metadata = {
      completeness: product.confidence_score || 85,
      lastUpdated: new Date().toISOString()
    };
    
    return solution;
  } catch (error) {
    console.error(`Failed to extract details for ${product.product_name}:`, error);
    return null;
  }
}
