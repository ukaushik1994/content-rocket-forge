import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { corsHeaders } from "../shared/cors.ts";
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
    const { userId, website, maxPages = 15, recrawl = false } = await req.json();

    if (!userId || !website) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Starting competitor intel for: ${website}`);

    const domain = normalizeDomain(website);
    const baseUrl = getBaseUrl(domain);
    const cacheKey = await generateCacheKey(domain);

    // Check cache
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
            profile: cached.profile_data,
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
      ? parseRobotsTxt(robotsTxt, 'CompetitorIntelBot')
      : { allowed: true, disallowedPaths: [] };

    console.log(`🤖 Robots.txt rules:`, robotsRules);

    // Try sitemap discovery
    const sitemapUrls = await discoverSitemap(baseUrl);
    
    if (sitemapUrls.length > 0) {
      console.log(`📄 Found ${sitemapUrls.length} URLs from sitemap`);
      usedSitemap = true;
      
      // Filter by robots.txt
      const allowedUrls = sitemapUrls.filter(url => 
        isUrlAllowed(url.loc, robotsRules)
      );
      
      // Sort by priority and select top URLs
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

    // AI Map-Reduce Summarization
    const profile = await summarizeCompetitor(domain, pageContents, userId);

    // Cache the result
    await supabase
      .from('competitor_cache')
      .upsert({
        cache_key: cacheKey,
        domain,
        last_crawled_at: new Date().toISOString(),
        url_count: pageContents.length,
        profile_data: profile,
        diagnostics: {
          used_sitemap: usedSitemap,
          used_serp: usedSerp,
          pages_fetched: pageContents.length,
          pages_skipped: selectedUrls.length - pageContents.length,
          ai_calls: pageContents.length + 1,
          cache_hit: false
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        diagnostics: {
          used_sitemap: usedSitemap,
          used_serp: usedSerp,
          pages_fetched: pageContents.length,
          pages_skipped: selectedUrls.length - pageContents.length,
          ai_calls: pageContents.length + 1,
          cache_hit: false
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
  const sitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml'];
  
  for (const path of sitemapPaths) {
    try {
      const url = `${baseUrl}${path}`;
      console.log(`Trying sitemap: ${url}`);
      
      const response = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CompetitorIntelBot/1.0)' }
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
  
  // Check if this is a sitemap index
  const sitemapElements = doc.querySelectorAll('sitemap > loc');
  if (sitemapElements.length > 0) {
    // TODO: Could recursively fetch child sitemaps, but keeping simple for now
    console.log('Found sitemap index, parsing first level only');
  }
  
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
  // For now, return basic URLs since we don't have SERP integration wired
  // In production, this would call the api-proxy with SERP queries
  console.log('⚠️ SERP fallback not fully implemented, using basic URLs');
  
  const baseUrls = [
    { loc: `https://${domain}`, category: 'homepage', priority: 1 },
    { loc: `https://${domain}/products`, category: 'product/service', priority: 2 },
    { loc: `https://${domain}/pricing`, category: 'product/service', priority: 2 },
    { loc: `https://${domain}/about`, category: 'about/contact', priority: 4 },
    { loc: `https://${domain}/blog`, category: 'resources/blog', priority: 3 }
  ];
  
  return baseUrls.slice(0, maxUrls);
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

async function summarizeCompetitor(
  domain: string,
  pages: Array<{ url: string; category: string; content: any }>,
  userId: string
): Promise<any> {
  // MAP phase: Summarize each page
  const pageSummaries = await Promise.all(
    pages.map(page => summarizePage(page, userId))
  );
  
  // REDUCE phase: Aggregate into competitor profile
  const profile = await aggregateProfile(domain, pageSummaries.filter(Boolean), userId);
  
  return profile;
}

async function summarizePage(
  page: { url: string; category: string; content: any },
  userId: string
): Promise<any> {
  try {
    const { content } = page;
    const fullText = `Title: ${content.title}\nMeta: ${content.metaDescription}\nHeadings: ${content.headings.join(', ')}\n\n${content.mainText}`;
    
    // Chunk if needed
    const chunks = chunkText(fullText, 10000);
    const textToSummarize = chunks[0]; // Use first chunk for efficiency
    
    const prompt = `Analyze this webpage from a competitor's website and extract key information in JSON format:\n\nURL: ${page.url}\nCategory: ${page.category}\n\nContent:\n${textToSummarize}\n\nReturn a JSON object with:\n{\n  "page_title": "...",\n  "key_points": ["5-8 key points"],\n  "value_props": ["3-5 value propositions"],\n  "features": ["3-5 key features mentioned"],\n  "target_audience": "description",\n  "pricing_hints": "any pricing info",\n  "top_keywords": ["10 relevant keywords"]\n}`;

    // Call Lovable AI via existing pattern
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON from response
    let parsed;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        parsed = JSON.parse(aiResponse);
      }
    } catch {
      parsed = {
        page_title: content.title,
        key_points: content.headings.slice(0, 5),
        value_props: [],
        features: [],
        target_audience: '',
        pricing_hints: '',
        top_keywords: []
      };
    }
    
    return {
      url: page.url,
      category: page.category,
      ...parsed
    };
  } catch (error) {
    console.error(`Failed to summarize page ${page.url}:`, error);
    return null;
  }
}

async function aggregateProfile(
  domain: string,
  summaries: any[],
  userId: string
): Promise<any> {
  const aggregatedText = summaries.map(s => 
    `URL: ${s.url} (${s.category})\nTitle: ${s.page_title}\nKey Points: ${s.key_points?.join(', ')}\nValue Props: ${s.value_props?.join(', ')}\nFeatures: ${s.features?.join(', ')}`
  ).join('\n\n');

  const prompt = `Based on these competitor webpage summaries, create a comprehensive competitor profile in JSON format:\n\n${aggregatedText}\n\nReturn a JSON object with:\n{\n  "overview": "2-3 sentence company overview",\n  "positioning": "market position/niche",\n  "strengths": ["exactly 5 distinct strengths"],\n  "weaknesses": ["exactly 5 distinct weaknesses"],\n  "products_services": ["up to 10 products/services"],\n  "differentiators": ["3-5 key differentiators"],\n  "keywords_top": ["25 most relevant keywords"]\n}`;

  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '{}';
    
    let profile;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        profile = JSON.parse(jsonMatch[1]);
      } else {
        profile = JSON.parse(aiResponse);
      }
    } catch {
      profile = {
        overview: `Competitor analysis for ${domain}`,
        positioning: 'Market competitor',
        strengths: ['Established brand', 'Product offerings', 'Market presence', 'Customer base', 'Industry experience'],
        weaknesses: ['Limited information available', 'Analysis incomplete', 'Data gathering in progress', 'Requires manual review', 'Automated assessment'],
        products_services: [],
        differentiators: [],
        keywords_top: []
      };
    }

    // Map to database schema
    const today = new Date().toISOString().split('T')[0];
    const topKeywords = profile.keywords_top?.slice(0, 10).join(', ') || '';
    
    return {
      description: profile.overview || `Competitor analysis for ${domain}`,
      market_position: profile.positioning || 'Industry competitor',
      strengths: profile.strengths?.slice(0, 5) || [],
      weaknesses: profile.weaknesses?.slice(0, 5) || [],
      resources: summaries.map(s => ({
        title: s.page_title || s.url,
        url: s.url,
        category: toResourceCategory(s.category)
      })),
      notes: `Auto-filled on ${today}. Top keywords: ${topKeywords}`
    };
  } catch (error) {
    console.error('Failed to aggregate profile:', error);
    
    // Fallback profile
    return {
      description: `Competitor profile for ${domain}`,
      market_position: 'Industry competitor',
      strengths: ['Established presence', 'Product portfolio', 'Market reach', 'Customer base', 'Brand recognition'],
      weaknesses: ['Analysis incomplete', 'Limited data available', 'Requires review', 'Automated assessment', 'Further research needed'],
      resources: summaries.map(s => ({
        title: s.page_title || 'Competitor page',
        url: s.url,
        category: toResourceCategory(s.category)
      })),
      notes: `Auto-filled on ${new Date().toISOString().split('T')[0]}`
    };
  }
}
