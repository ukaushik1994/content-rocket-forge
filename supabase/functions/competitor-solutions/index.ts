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
      `site:${competitorWebsite} "what we offer"`
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
            if (result.link && (
              result.link.includes('/product') ||
              result.link.includes('/solution') ||
              result.link.includes('/services')
            )) {
              discoveredUrls.add(result.link);
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️ SERP query failed: ${query}`, error);
      }
    }

    diagnostics.pages_discovered = discoveredUrls.size;
    console.log(`✓ Found ${diagnostics.pages_discovered} solution pages`);

    if (discoveredUrls.size === 0) {
      console.log('⚠️ No solution pages found via SERP');
      return new Response(
        JSON.stringify({
          success: true,
          solutions: [],
          diagnostics: { ...diagnostics, total_time_ms: Date.now() - startTime }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Extract product list from main pages
    console.log('🧠 Step 2: Extracting product list from discovered pages...');
    const mainUrl = Array.from(discoveredUrls)[0]; // Use the first discovered URL
    diagnostics.ai_calls++;

    const extractPrompt = `Analyze this URL: ${mainUrl}

Extract ALL individual products/solutions offered by ${competitorName}. For each product provide:
- name: Product name
- category: Product category (e.g., "Communication", "Collaboration", "AI Tools")
- short_description: One-line description
- url: Direct link to product page if different from main page

Return a JSON array of products. Be comprehensive - include every distinct product/solution mentioned.`;

    const extractResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing company websites and extracting product information. Always return valid JSON.' },
          { role: 'user', content: extractPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const extractData = await extractResponse.json();
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

    for (const product of products.slice(0, 10)) { // Limit to 10 products
      try {
        console.log(`  ⏳ Analyzing: ${product.name}...`);
        
        const productUrl = product.url || mainUrl;
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

        if (solutionError) {
          console.warn(`  ⚠️ Solution-intel error for ${product.name}:`, solutionError);
          // Save partial data
          analyzedSolutions.push({
            name: product.name,
            category: product.category,
            short_description: product.short_description,
            external_url: productUrl,
            features: [],
            use_cases: [],
            discovery_source: 'serp:partial'
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
