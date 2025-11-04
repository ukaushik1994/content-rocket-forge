import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SERP_API_KEY = Deno.env.get('SERP_API_KEY')!;

// Utility: Add timeout protection for long-running operations
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  const timeoutPromise = new Promise<null>((resolve) => 
    setTimeout(() => resolve(null), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

interface DiscoverRequest {
  competitorId: string;
  competitorWebsite: string;
  competitorName: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitorId, competitorWebsite, competitorName, userId }: DiscoverRequest = await req.json();

    console.log(`🔍 Discovering solutions for: ${competitorName} (${competitorWebsite})`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const startTime = Date.now();
    const diagnostics = {
      serp_queries: 0,
      pages_discovered: 0,
      solutions_extracted: 0,
      full_extractions: 0,
      partial_extractions: 0,
      ai_calls: 0,
      total_time_ms: 0
    };

    // Step 1: Use SERP to find product/solution pages
    console.log('📋 Step 1: Finding solution pages via SERP...');
    const serpQueries = [
      `site:${competitorWebsite} products`,
      `site:${competitorWebsite} solutions`,
      `site:${competitorWebsite} services`,
      `site:${competitorWebsite} platform`,
      `site:${competitorWebsite} offerings`,
      `site:${competitorWebsite} tools`,
      `site:${competitorWebsite} "what we offer"`,
      `site:${competitorWebsite} "our products"`,
      `"${competitorName}" products`,
      `"${competitorName}" solutions overview`
    ];

    const discoveredUrls = new Set<string>();
    for (const query of serpQueries) {
      diagnostics.serp_queries++;
      try {
        const serpResponse = await fetch(
          `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}&num=10`
        );
        const serpData = await serpResponse.json();
        
        if (serpData.organic_results) {
          serpData.organic_results.forEach((result: any) => {
            const url = result.link.toLowerCase();
            if (result.link && (
              url.includes('/product') ||
              url.includes('/solution') ||
              url.includes('/service') ||
              url.includes('/platform') ||
              url.includes('/offering') ||
              url.includes('/tool') ||
              url.includes('/features') ||
              url === competitorWebsite.toLowerCase() ||
              url === competitorWebsite.toLowerCase() + '/'
            )) {
              discoveredUrls.add(result.link);
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️ SERP query failed: ${query}`, error);
      }
    }

    // Fallback to homepage if no URLs found
    if (discoveredUrls.size === 0) {
      console.log('⚠️ No solution pages found via SERP, falling back to homepage');
      discoveredUrls.add(competitorWebsite);
      discoveredUrls.add(`${competitorWebsite}/products`);
      discoveredUrls.add(`${competitorWebsite}/solutions`);
    }

    diagnostics.pages_discovered = discoveredUrls.size;
    console.log(`✓ Found ${diagnostics.pages_discovered} solution pages`)

    // Step 2: Extract product list from main pages
    console.log('🧠 Step 2: Extracting product list from discovered pages...');
    const urlsToAnalyze = Array.from(discoveredUrls).slice(0, 5); // Top 5 URLs
    diagnostics.ai_calls++;

    const extractPrompt = `You are analyzing ${competitorName}'s website to identify their PRODUCT OFFERINGS (not features, not pages).

URLs analyzed:
${urlsToAnalyze.map((url, i) => `${i+1}. ${url}`).join('\n')}

IMPORTANT DISTINCTIONS:
- A PRODUCT is a standalone offering that customers can purchase/use (e.g., "Slack", "Salesforce CRM")
- A FEATURE is a capability within a product (e.g., "real-time messaging", "contact management")
- A PAGE is just a website section (e.g., "About Us", "Pricing")

Your task: Extract ONLY distinct PRODUCTS (not features, not pages).

For EACH product, extract:
{
  "name": "Official product name exactly as shown",
  "category": "Product type (SaaS, Platform, Service, Tool, API, etc.)",
  "short_description": "One sentence: what the product does and who it's for",
  "url": "Best URL for this product from the list above",
  "confidence": 0-100 (How certain are you this is a distinct product?)
}

RULES:
1. If you see "Visier People" and "Visier Planning" → 2 SEPARATE products
2. If you see "People Analytics" as a feature of "Visier People" → 1 product (Visier People)
3. Homepage usually describes the company, not a specific product
4. Navigation menu items like "Solutions", "Resources" are NOT products
5. Min confidence: 70. If uncertain, skip it.
6. If one product has multiple editions (Pro, Enterprise), list as ONE product

Return ONLY a valid JSON array. NO markdown, NO explanation.`;

    let extractData;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const extractResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an expert at analyzing company websites. Return only valid JSON arrays.' },
              { role: 'user', content: extractPrompt }
            ],
      temperature: retries * 0.2,
    }),
  });

  diagnostics.ai_calls++;
  extractData = await extractResponse.json();

  break;
      } catch (error) {
        retries++;
        if (retries > maxRetries) throw error;
        console.log(`Retry ${retries}/${maxRetries} for AI extraction`);
      }
    }
    let products: any[] = [];
    
    try {
      const content = extractData.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      products = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
      console.error('❌ Failed to parse product list:', error);
      products = [];
    }

    diagnostics.solutions_extracted = products.length;
    console.log(`✓ Extracted ${products.length} products`);

    // Step 3: For each product, call solution-intel for deep analysis
    console.log('🔬 Step 3: Analyzing each solution in detail...');
    const analyzedSolutions = [];

    for (const product of products) { // Analyze ALL products
      try {
        console.log(`  ⏳ Analyzing: ${product.name}... (${analyzedSolutions.length + 1}/${products.length})`);
        
        const productUrl = product.url || urlsToAnalyze[0];
        
        // Add 120 second timeout for solution-intel
        const solutionResult = await withTimeout(
          supabase.functions.invoke('solution-intel', {
            body: {
              userId,
              website: productUrl,
              maxPages: 5,
              detectMultiple: false,
              parentCompany: competitorName,
              recrawl: false
            }
          }),
          120000 // 2 minutes
        );

        diagnostics.ai_calls += 3; // Approximate AI calls in solution-intel

    if (!solutionResult || solutionResult.error || !solutionResult.data?.success) {
      console.warn(`  ⚠️ Partial extraction for ${product.name} (timeout or error)`);
      diagnostics.partial_extractions++;
      analyzedSolutions.push({
        name: product.name,
        category: product.category || 'Unknown',
        short_description: product.short_description || `${product.name} - detailed information unavailable`,
        long_description: product.short_description,
        external_url: productUrl,
        features: product.key_benefits || [],
        use_cases: [],
        target_audience: [product.target_audience] || [],
        discovery_source: 'serp:partial',
        last_analyzed_at: new Date().toISOString(),
        metadata: { extraction_status: 'partial', error: solutionError?.message }
      });
      continue;
        }

        const solutionData = solutionResult.data;
    if (solutionData?.success && solutionData.solutions?.length > 0) {
      diagnostics.full_extractions++;
          diagnostics.full_extractions++;
          const solutionProfile = solutionData.solutions[0];
          analyzedSolutions.push({
            name: product.name,
            category: product.category || solutionProfile.category,
            short_description: product.short_description || solutionProfile.description,
            long_description: solutionProfile.description,
            external_url: productUrl,
            logo_url: solutionProfile.logoUrl,
            positioning: solutionProfile.positioning,
            unique_value_propositions: solutionProfile.uniqueValuePropositions || [],
            key_differentiators: solutionProfile.keyDifferentiators || [],
            features: solutionProfile.features || [],
            use_cases: solutionProfile.useCases || [],
            pain_points: solutionProfile.painPoints || [],
            target_audience: solutionProfile.targetAudience || [],
            benefits: solutionProfile.benefits || [],
            pricing: solutionProfile.pricing || null,
            technical_specs: solutionProfile.technicalSpecs || null,
            integrations: solutionProfile.integrations || [],
            case_studies: solutionProfile.caseStudies || [],
            resources: solutionProfile.resources || [],
            tags: solutionProfile.tags || [],
            market_data: solutionProfile.marketData || null,
            discovery_source: 'serp:full',
            last_analyzed_at: new Date().toISOString()
          });
          console.log(`  ✓ ${product.name} analyzed successfully`);
        }
      } catch (error) {
        console.error(`  ❌ Error analyzing ${product.name}:`, error);
      }
    }

    // Step 4: Clean up old solutions and save new ones
    console.log('💾 Cleaning up old solutions and saving new ones...');
    
    // Delete existing solutions for this competitor
    const { error: deleteError } = await supabase
      .from('competitor_solutions')
      .delete()
      .eq('competitor_id', competitorId);

    if (deleteError) {
      console.warn('⚠️ Could not delete old solutions:', deleteError);
    }
    
    const savedSolutions = [];
    
    for (const solution of analyzedSolutions) {
      const { data, error } = await supabase
        .from('competitor_solutions')
        .insert({
          competitor_id: competitorId,
          user_id: userId,
          ...solution
        })
        .select()
        .single();

      if (!error && data) {
        savedSolutions.push(data);
      } else {
        console.error('❌ Failed to save solution:', solution.name, error);
      }
    }

    diagnostics.total_time_ms = Date.now() - startTime;
    console.log(`✅ Discovery complete! Saved ${savedSolutions.length} solutions in ${diagnostics.total_time_ms}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        solutions: savedSolutions,
        diagnostics
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Error in competitor-solutions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
