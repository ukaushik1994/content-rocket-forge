import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SERP_API_KEY = Deno.env.get('SERP_API_KEY')!;

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

    const extractPrompt = `Analyze these ${urlsToAnalyze.length} pages from ${competitorName}'s website to identify ALL their products/solutions.

URLs analyzed:
${urlsToAnalyze.map((url, i) => `${i+1}. ${url}`).join('\n')}

For EACH DISTINCT product/solution, extract:
- name: Full official product name
- category: Product category (Software, Platform, Service, Tool, etc.)
- short_description: One clear sentence describing what it does
- url: Best URL for this product (from the pages above)
- confidence: 0-100 score based on how explicitly it's described

Return JSON array of products. Include:
- Products listed in navigation menus
- Products in hero sections
- Products in "Our Products" sections
- Products in feature comparisons
- Individual tools in a suite

Rules:
- Separate products have different names and solve different problems
- Features of the same product should NOT be separate entries
- Minimum confidence: 60
- If unclear if it's one product or multiple, favor detecting multiple

Return only valid JSON array.`;

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
        const { data: solutionData, error: solutionError } = await supabase.functions.invoke('solution-intel', {
          body: {
            userId,
            website: productUrl,
            maxPages: 5,
            detectMultiple: false,
            parentCompany: competitorName,
            recrawl: false
          }
        });

        diagnostics.ai_calls += 3; // Approximate AI calls in solution-intel

        if (solutionError || !solutionData?.success) {
          console.warn(`  ⚠️ Partial extraction for ${product.name}`);
          analyzedSolutions.push({
            name: product.name,
            category: product.category || 'Unknown',
            short_description: product.short_description || `${product.name} - detailed information unavailable`,
            long_description: product.short_description,
            external_url: productUrl,
            features: [],
            use_cases: [],
            target_audience: [],
            discovery_source: 'serp:partial',
            last_analyzed_at: new Date().toISOString(),
            metadata: { extraction_status: 'partial', error: solutionError?.message }
          });
          continue;
        }

        if (solutionData?.success && solutionData.solutions?.length > 0) {
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

    // Step 4: Save to database
    console.log('💾 Saving solutions to database...');
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
