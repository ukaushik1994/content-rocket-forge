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
    
    // Initialize enhanced diagnostics
    const diagnostics = {
      solutions_discovered: 0,
      total_solutions_attempted: 0,
      full_extractions: 0,
      partial_extractions: 0,
      failed_extractions: 0,
      successful_extractions: 0,
      serp_queries: 0,
      pages_discovered: 0,
      solutions_extracted: 0,
      ai_calls: 0,
      timeout_count: 0,
      start_time: new Date().toISOString(),
      average_extraction_time_ms: 0,
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
    diagnostics.total_solutions_attempted = products.length;
    console.log(`✓ Extracted ${products.length} products`);

    // Step 3: For each product, enrich with solution-intel
    console.log('🔬 Step 3: Analyzing each solution in detail...');
    
    const enrichSolutionData = async (solution: any) => {
      console.log(`📦 Attempting extraction for: ${solution.name}`);
      
      try {
        // Track AI call attempt
        const extractionStartTime = Date.now();
        
        const solutionResult = await withTimeout(
          supabase.functions.invoke('solution-intel', {
            body: {
              userId,
              website: solution.url || urlsToAnalyze[0],
              maxPages: 5,
              detectMultiple: false,
              parentCompany: competitorName,
              recrawl: false
            }
          }),
          120000
        );

        const extractionTime = Date.now() - extractionStartTime;

        if (solutionResult?.data?.solutions?.[0]) {
          const enrichedData = solutionResult.data.solutions[0];
          
          console.log(`✅ Extraction successful for: ${solution.name} (${extractionTime}ms)`);
          diagnostics.full_extractions++;
          diagnostics.ai_calls += 3; // solution-intel typically makes ~3 AI calls
          diagnostics.successful_extractions = (diagnostics.successful_extractions || 0) + 1;
          
          return {
            name: solution.name,
            category: solution.category || enrichedData.category,
            short_description: solution.short_description || enrichedData.description,
            long_description: enrichedData.description,
            external_url: solution.url || urlsToAnalyze[0],
            logo_url: enrichedData.logoUrl,
            positioning: enrichedData.positioning,
            unique_value_propositions: enrichedData.uniqueValuePropositions || [],
            key_differentiators: enrichedData.keyDifferentiators || [],
            features: enrichedData.features || solution.features || [],
            use_cases: enrichedData.useCases || [],
            pain_points: enrichedData.painPoints || [],
            target_audience: enrichedData.targetAudience || [],
            benefits: enrichedData.benefits || [],
            pricing: enrichedData.pricing || null,
            technical_specs: enrichedData.technicalSpecs || null,
            integrations: enrichedData.integrations || [],
            case_studies: enrichedData.caseStudies || [],
            resources: enrichedData.resources || [],
            tags: enrichedData.tags || [],
            market_data: enrichedData.marketData || null,
            discovery_source: 'serp:full',
            last_analyzed_at: new Date().toISOString(),
            metadata: {
              extraction_status: 'complete',
              extraction_timestamp: new Date().toISOString(),
              extraction_time_ms: extractionTime
            }
          };
        } else {
          const errorMessage = solutionResult?.error?.message || 'No data returned';
          console.warn(`⚠️ Partial extraction for: ${solution.name} - ${errorMessage}`);
          diagnostics.partial_extractions++;
          diagnostics.failed_extractions = (diagnostics.failed_extractions || 0) + 1;
          
          return {
            name: solution.name,
            category: solution.category || 'Unknown',
            short_description: solution.short_description || `${solution.name} - detailed information unavailable`,
            long_description: solution.short_description,
            external_url: solution.url || urlsToAnalyze[0],
            features: [],
            use_cases: [],
            target_audience: [],
            discovery_source: 'serp:partial',
            last_analyzed_at: new Date().toISOString(),
            metadata: {
              extraction_status: 'partial',
              extraction_error: errorMessage,
              extraction_timestamp: new Date().toISOString(),
              extraction_time_ms: extractionTime
            }
          };
        }
      } catch (error) {
        console.error(`❌ Extraction failed for: ${solution.name}`, error);
        diagnostics.failed_extractions = (diagnostics.failed_extractions || 0) + 1;
        diagnostics.timeout_count = error.message?.includes('timeout') 
          ? (diagnostics.timeout_count || 0) + 1 
          : (diagnostics.timeout_count || 0);
        
        return {
          name: solution.name,
          category: solution.category || 'Unknown',
          short_description: solution.short_description || `${solution.name} - extraction failed`,
          long_description: solution.short_description,
          external_url: solution.url || urlsToAnalyze[0],
          features: [],
          use_cases: [],
          target_audience: [],
          discovery_source: 'serp:failed',
          last_analyzed_at: new Date().toISOString(),
          metadata: {
            extraction_status: 'failed',
            extraction_error: error.message || 'Unknown error',
            extraction_timestamp: new Date().toISOString()
          }
        };
      }
    };

    const analyzedSolutions = await Promise.all(
      products.map(product => enrichSolutionData(product))
    );

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

    // Final diagnostics with averages
    diagnostics.solutions_discovered = savedSolutions.length;
    
    // Calculate average extraction time
    const successfulExtractions = analyzedSolutions.filter(s => 
      s.metadata?.extraction_status === 'complete' && s.metadata?.extraction_time_ms
    );
    if (successfulExtractions.length > 0) {
      const totalTime = successfulExtractions.reduce((sum, s) => 
        sum + (s.metadata.extraction_time_ms || 0), 0
      );
      diagnostics.average_extraction_time_ms = Math.round(totalTime / successfulExtractions.length);
    }
    
    diagnostics.total_time_ms = Date.now() - startTime;
    console.log('📊 Final Diagnostics:', diagnostics);
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
