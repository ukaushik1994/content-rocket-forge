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
    const { userId, website, maxPages = 30, detectMultiple = true, recrawl = false } = await req.json();

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

    // Enhance with SERP if needed
    if (selectedUrls.length < 15) {
      console.log(`🔍 Enhancing with SERP queries (current URLs: ${selectedUrls.length})`);
      usedSerp = true;
      const serpUrls = await enhanceUrlsWithSerp(domain, selectedUrls, maxPages - selectedUrls.length);
      selectedUrls = [...selectedUrls, ...serpUrls];
    } else if (selectedUrls.length === 0) {
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

    // Cache the result with enhanced metadata
    await supabase
      .from('solution_cache')
      .upsert({
        cache_key: cacheKey,
        domain,
        last_crawled_at: new Date().toISOString(),
        url_count: pageContents.length,
        solutions_data: solutions,
        diagnostics: {
          cache_version: '2.0',
          extraction_depth: 'comprehensive',
          ai_model_used: 'gemini-2.5-pro',
          used_sitemap: usedSitemap,
          used_serp: usedSerp,
          pages_fetched: pageContents.length,
          products_detected: solutions.length,
          confidence: solutions.length > 0 ? Math.round(solutions.reduce((acc: number, s: any) => acc + (s.metadata?.completeness || 85), 0) / solutions.length) : 0,
          pages_analyzed_per_product: solutions.length > 0 ? Math.round(solutions.reduce((acc: number, s: any) => acc + (s.metadata?.pagesAnalyzed || 0), 0) / solutions.length) : 0
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        multipleDetected: solutions.length > 1,
        solutions,
        diagnostics: {
          cache_version: '2.0',
          extraction_depth: 'comprehensive',
          ai_model_used: 'gemini-2.5-pro',
          used_sitemap: usedSitemap,
          used_serp: usedSerp,
          pages_fetched: pageContents.length,
          products_detected: solutions.length,
          confidence: solutions.length > 0 ? Math.round(solutions.reduce((acc: number, s: any) => acc + (s.metadata?.completeness || 85), 0) / solutions.length) : 0,
          pages_analyzed_per_product: solutions.length > 0 ? Math.round(solutions.reduce((acc: number, s: any) => acc + (s.metadata?.pagesAnalyzed || 0), 0) / solutions.length) : 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    // Detailed error handling
    let errorMessage = error.message || 'Unknown error occurred';
    let statusCode = 500;
    
    if (error.message?.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please try again in a few minutes.';
      statusCode = 429;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. The website took too long to respond.';
      statusCode = 408;
    } else if (error.message?.includes('unreachable') || error.message?.includes('ENOTFOUND')) {
      errorMessage = 'Website unreachable. Please check the URL and try again.';
      statusCode = 404;
    } else if (error.message?.includes('AI API error')) {
      errorMessage = 'AI service temporarily unavailable. Please try again.';
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
  const baseUrls = [
    { loc: `https://${domain}`, category: 'homepage', priority: 1 },
    { loc: `https://${domain}/products`, category: 'product/service', priority: 1 },
    { loc: `https://${domain}/solutions`, category: 'product/service', priority: 1 },
    { loc: `https://${domain}/pricing`, category: 'product/service', priority: 2 },
    { loc: `https://${domain}/features`, category: 'product/service', priority: 2 }
  ];
  
  return baseUrls.slice(0, maxUrls);
}

/**
 * Enhance URLs with SERP API to find high-value pages
 */
async function enhanceUrlsWithSerp(
  domain: string,
  existingUrls: SitemapUrl[],
  maxAdditional: number
): Promise<SitemapUrl[]> {
  const serpApiKey = Deno.env.get('SERP_API_KEY');
  if (!serpApiKey) {
    console.log('⚠️ SERP API key not configured, skipping SERP enhancement');
    return [];
  }

  const queries = [
    `site:${domain} product features`,
    `site:${domain} case study OR success story OR customer`,
    `site:${domain} pricing plans OR pricing tiers`,
    `site:${domain} technical specifications OR integrations`,
    `site:${domain} vs competitor OR comparison`,
    `site:${domain} testimonials OR reviews`
  ];

  const discoveredUrls: SitemapUrl[] = [];
  const existingUrlSet = new Set(existingUrls.map(u => u.loc));

  try {
    for (const query of queries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
      try {
        const response = await fetch(
          `https://serpapi.com/search?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5`
        );

        if (response.status === 429) {
          console.log('⚠️ SERP API rate limit reached');
          break;
        }

        if (!response.ok) continue;

        const data = await response.json();
        const results = data.organic_results || [];

        for (const result of results) {
          const url = result.link;
          if (url && !existingUrlSet.has(url) && url.includes(domain)) {
            const category = categorizeUrl(url);
            const priority = getCategoryPriority(category);
            discoveredUrls.push({ loc: url, category, priority });
            existingUrlSet.add(url);
          }
        }

        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`SERP query failed for: ${query}`, error);
      }
    }
  } catch (error) {
    console.error('SERP enhancement error:', error);
  }

  // Prioritize and return
  return discoveredUrls
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxAdditional);
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
  const pageSummaries = pages.slice(0, 12).map(p => {
    const content = p.content;
    const headingsText = content.headings.slice(0, 8).map((h: any) => 
      typeof h === 'string' ? h : `${h.text}${h.context ? ': ' + h.context.slice(0, 50) : ''}`
    ).join('; ');
    
    return `URL: ${p.url}
Category: ${p.category}
Title: ${content.title}
Description: ${content.metaDescription}
Headings: ${headingsText}
Key Metrics: ${content.metrics?.slice(0, 3).map((m: any) => `${m.value} ${m.label}`).join(', ') || 'None'}
Callouts: ${content.callouts?.slice(0, 2).join('; ') || 'None'}
Text: ${content.mainText.slice(0, 800)}`;
  }).join('\n\n---\n\n');

  const prompt = `Analyze this website and identify all distinct products/solutions offered.

Website: ${domain}
Pages analyzed: ${pages.length}

Content:
${pageSummaries}

${detectMultiple ? 'Identify ALL separate products/solutions offered (e.g., different product lines, tiers, or distinct offerings).' : 'Identify only the PRIMARY product/solution.'}

Rules:
- Only include distinct products or product families (not individual features)
- Each product should have a unique name and purpose
- Must have confidence >= 70
- Include the most relevant URL for each product
- Be specific with product names (avoid generic terms)`;

  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        tools: [{
          type: 'function',
          function: {
            name: 'detect_products',
            description: 'Detect and list all distinct products or solutions',
            parameters: {
              type: 'object',
              properties: {
                products: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      product_name: { type: 'string', description: 'Full name of the product' },
                      product_url: { type: 'string', description: 'URL to product page or homepage' },
                      brief_description: { type: 'string', description: 'One sentence description' },
                      confidence_score: { type: 'number', minimum: 0, maximum: 100 },
                      primary_solution: { type: 'boolean', description: 'Is this the main/flagship product?' }
                    },
                    required: ['product_name', 'brief_description', 'confidence_score']
                  }
                }
              },
              required: ['products']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'detect_products' } }
      })
    });

    const data = await response.json();
    
    // Handle tool calling response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return parsed.products || [];
    }
    
    // Fallback to text parsing
    const aiResponse = data.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        parsed = JSON.parse(aiResponse);
      }
      return parsed.products || [];
    } catch {
      return [];
    }
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
  // Select relevant pages (increased from 5 to 10)
  const relevantPages = pages.filter(p => {
    const urlMatch = p.url.toLowerCase().includes(product.product_name.toLowerCase().replace(/\s+/g, '-')) ||
                     p.url.toLowerCase().includes(product.product_name.toLowerCase().replace(/\s+/g, ''));
    const categoryMatch = ['product/service', 'homepage', 'resources/blog'].includes(p.category);
    return urlMatch || categoryMatch;
  }).slice(0, 10);

  // If we didn't find product-specific pages, use the best general pages
  if (relevantPages.length < 3) {
    const generalPages = pages
      .filter(p => p.category === 'product/service' || p.category === 'homepage')
      .slice(0, 8);
    relevantPages.push(...generalPages);
  }

  // Build comprehensive content summary
  const pageContent = relevantPages.map(p => {
    const c = p.content;
    const headingsText = (c.headings || []).slice(0, 10).map((h: any) => 
      typeof h === 'string' ? h : `${h.text}${h.context ? ': ' + h.context : ''}`
    ).join('\n');
    
    const pricingText = (c.pricingTables || []).map((pt: any) => 
      `${pt.tier}: ${pt.price}\nFeatures: ${pt.features.join(', ')}`
    ).join('\n\n');
    
    const testimonialsText = (c.testimonials || []).slice(0, 3).map((t: any) =>
      `"${t.quote}" ${t.author ? `- ${t.author}${t.company ? `, ${t.company}` : ''}` : ''}`
    ).join('\n');
    
    const metricsText = (c.metrics || []).slice(0, 8).map((m: any) => 
      `${m.value} ${m.label}`
    ).join(', ');
    
    const calloutsText = (c.callouts || []).join('\n');
    
    return `
=== PAGE: ${p.url} (${p.category}) ===
TITLE: ${c.title}
META: ${c.metaDescription}

HEADINGS:
${headingsText}

${pricingText ? `PRICING:\n${pricingText}\n` : ''}
${testimonialsText ? `TESTIMONIALS:\n${testimonialsText}\n` : ''}
${metricsText ? `KEY METRICS: ${metricsText}\n` : ''}
${calloutsText ? `CALLOUTS:\n${calloutsText}\n` : ''}

CONTENT:
${c.mainText.slice(0, 2000)}
`;
  }).join('\n\n---\n\n');

  const prompt = `Extract comprehensive solution intelligence for: ${product.product_name}

You are analyzing ${relevantPages.length} pages of content to create a detailed solution profile.

${pageContent}

TASK: Create a comprehensive solution profile with rich, specific details.

CRITICAL INSTRUCTIONS:
1. **Positioning Statement**: Write a 2-3 sentence statement describing what the solution is, who it's for, and what makes it unique. Use evidence from the content.

2. **Description**: 3-4 sentences explaining the solution in detail. Include the value it provides and the problems it solves.

3. **Short Description**: One compelling sentence (under 120 characters) that captures the essence.

4. **Features** (12-20): Extract specific, concrete features. NOT generic phrases like "easy to use". Use actual feature names and capabilities from the content.

5. **Use Cases** (8-12): Specific scenarios with outcomes. Format: "Action/Goal with specific result" (e.g., "Predict employee turnover 6 months in advance to reduce hiring costs by 25%")

6. **Pain Points** (8-12): Real problems this solves, using customer language from testimonials when available.

7. **Benefits** (8-12): Tangible outcomes with metrics when mentioned (e.g., "Reduce reporting time from weeks to hours")

8. **Unique Value Propositions** (3-5): What makes this solution different? Include evidence (e.g., "Largest benchmark database with 25,000+ companies")

9. **Key Differentiators** (3-5): Why choose this over alternatives? Use competitive mentions if found.

10. **Target Audience** (6-10): Specific roles, industries, or company sizes. Be precise.

11. **Pricing**: Extract detailed pricing tiers with features if available. Set customPricing=true if "contact sales" or "enterprise".

12. **Technical Specs**: Platforms, integrations, security features, API capabilities found in content.

13. **Case Studies**: If testimonials or case studies are present, extract company, challenge, solution, and results with metrics.

14. **Tags** (15-20): Relevant, searchable keywords.

Return ONLY valid JSON in this exact structure:
{
  "name": "${product.product_name}",
  "description": "Detailed 3-4 sentence description with value prop and problems solved",
  "shortDescription": "One sentence under 120 chars",
  "positioningStatement": "2-3 sentences: what it is, who it's for, what makes it unique",
  "category": "Specific category (e.g., People Analytics, Marketing Automation, etc.)",
  "features": ["12-20 specific features with actual names"],
  "useCases": ["8-12 specific use cases with outcomes"],
  "painPoints": ["8-12 problems this solves"],
  "targetAudience": ["6-10 specific roles/industries/sizes"],
  "benefits": ["8-12 tangible benefits, with metrics when mentioned"],
  "uniqueValuePropositions": ["3-5 UVPs with evidence"],
  "keyDifferentiators": ["3-5 differentiators vs competitors"],
  "pricing": {
    "model": "subscription|one-time|usage-based|freemium|enterprise|custom",
    "startingPrice": "Price or 'Contact sales' or 'Free'",
    "tiers": [{"name": "", "price": "", "features": []}],
    "customPricing": true/false,
    "freeTrialDuration": "e.g., '30 days' or null"
  },
  "technicalSpecs": {
    "supportedPlatforms": ["Web", "iOS", "Android", etc.],
    "apiCapabilities": ["REST API", "Webhooks", etc.],
    "securityFeatures": ["SOC 2", "GDPR", "SSO", etc.],
    "integrations": ["Specific integration names"]
  },
  "caseStudies": [
    {
      "title": "Brief title",
      "company": "Company name",
      "industry": "Industry",
      "challenge": "The problem",
      "solution": "How product helped",
      "results": ["Specific outcomes with metrics"],
      "metrics": [{"label": "Metric name", "value": "Value"}]
    }
  ],
  "tags": ["15-20 relevant keywords"]
}

Use ONLY information found in the content. Be specific and detailed. Include numbers/metrics when mentioned.`;

  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 12000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '{}';
    
    let solution;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        solution = JSON.parse(jsonMatch[1]);
      } else {
        solution = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error(`Failed to parse AI response for ${product.product_name}:`, parseError);
      // Fallback solution
      solution = {
        name: product.product_name,
        description: product.brief_description || `${product.product_name} is a business solution.`,
        shortDescription: product.brief_description || product.product_name,
        category: 'Business Solution',
        features: [],
        useCases: [],
        painPoints: [],
        targetAudience: [],
        benefits: [],
        uniqueValuePropositions: [],
        keyDifferentiators: [],
        pricing: { model: 'custom', customPricing: true },
        technicalSpecs: {
          supportedPlatforms: [],
          apiCapabilities: [],
          securityFeatures: [],
          integrations: []
        },
        tags: []
      };
    }
    
    // Add external metadata
    solution.externalUrl = product.product_url || pages[0]?.url;
    solution.metadata = {
      completeness: product.confidence_score || 85,
      lastUpdated: new Date().toISOString(),
      pagesAnalyzed: relevantPages.length,
      extractionModel: 'gemini-2.5-pro'
    };
    
    return solution;
  } catch (error) {
    console.error(`Failed to extract details for ${product.product_name}:`, error);
    return null;
  }
}
