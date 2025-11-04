import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { extractPageContent } from '../shared/content-extractor.ts';

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

interface UserCompanyInfo {
  name?: string;
  industry?: string;
  mission?: string;
  description?: string;
}

interface UserSolution {
  name: string;
  category?: string;
  features?: any[];
  pain_points?: any[];
  target_audience?: any[];
  use_cases?: any[];
}

interface DiscoverRequest {
  competitorId: string;
  competitorWebsite: string;
  competitorName: string;
  userId: string;
  userCompanyInfo?: UserCompanyInfo;
  userSolutions?: UserSolution[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      competitorId, 
      competitorWebsite, 
      competitorName, 
      userId,
      userCompanyInfo,
      userSolutions 
    }: DiscoverRequest = await req.json();

    console.log('[DISCOVER] Starting discovery for:', competitorName, '(', competitorWebsite, ')');
    console.log('[CONTEXT] User company:', userCompanyInfo?.name || 'Not provided');
    console.log('[CONTEXT] User solutions:', userSolutions?.length || 0);

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
    console.log('[SERP] Step 1: Finding solution pages via SERP...');
    const serpQueries = [
      'site:' + competitorWebsite + ' products',
      'site:' + competitorWebsite + ' solutions',
      'site:' + competitorWebsite + ' services',
      'site:' + competitorWebsite + ' platform',
      'site:' + competitorWebsite + ' offerings',
      'site:' + competitorWebsite + ' tools',
      'site:' + competitorWebsite + ' "what we offer"',
      'site:' + competitorWebsite + ' "our products"',
      '"' + competitorName + '" products',
      '"' + competitorName + '" solutions overview'
    ];

    const discoveredUrls = new Set<string>();
    for (const query of serpQueries) {
      diagnostics.serp_queries++;
      try {
        const serpResponse = await fetch(
          'https://serpapi.com/search?q=' + encodeURIComponent(query) + '&api_key=' + SERP_API_KEY + '&num=10'
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
        console.warn('[WARN] SERP query failed:', query, error);
      }
    }

    // Fallback to homepage if no URLs found
    if (discoveredUrls.size === 0) {
      console.log('[WARN] No solution pages found via SERP, falling back to homepage');
      discoveredUrls.add(competitorWebsite);
      discoveredUrls.add(competitorWebsite + '/products');
      discoveredUrls.add(competitorWebsite + '/solutions');
    }

    diagnostics.pages_discovered = discoveredUrls.size;
    console.log('[SUCCESS] Found', diagnostics.pages_discovered, 'solution pages')

    // Step 1.5: Fetch actual page content
    console.log('[FETCH] Step 1.5: Fetching page content from discovered URLs...');
    const urlsToAnalyze = Array.from(discoveredUrls).slice(0, 5); // Top 5 URLs
    
    const pageContents = await Promise.all(
      urlsToAnalyze.map(async (url) => {
        try {
          const content = await extractPageContent(url, 15000);
          if (content) {
            console.log('[SUCCESS] Fetched content from:', url);
            return { url, content };
          }
          return null;
        } catch (error) {
          console.warn('[WARN] Failed to fetch:', url, error);
          return null;
        }
      })
    );
    
    const validPages = pageContents.filter(p => p !== null);
    console.log('[SUCCESS] Successfully fetched content from', validPages.length, '/', urlsToAnalyze.length, 'pages');

    // Step 2: Extract product list from actual page content
    console.log('[EXTRACT] Step 2: Extracting product list from page content...');

    const pageContentStr = validPages.map((p, i) => 
      '\n=== PAGE ' + (i+1) + ': ' + p.url + ' ===\n' +
      'Title: ' + p.content.title + '\n' +
      'Meta Description: ' + (p.content.metaDescription || 'N/A') + '\n' +
      'Main Headings: ' + p.content.headings.slice(0, 10).join(' | ') + '\n' +
      'Content Preview: ' + p.content.mainText.slice(0, 2000)
    ).join('\n\n');

    const extractPrompt = 'You are analyzing ' + competitorName + '\'s website to identify their PRODUCT OFFERINGS.\n\n' +
      'Website: ' + competitorWebsite + '\n' +
      'Pages analyzed: ' + validPages.length + '\n\n' +
      'PAGE CONTENT:\n' + pageContentStr + '\n\n' +
      'TASK: Extract ALL distinct PRODUCTS/SOLUTIONS/SERVICES offered by ' + competitorName + '.\n\n' +
      'IMPORTANT:\n' +
      '- A PRODUCT is a standalone offering customers can buy/use (e.g., "Visier People", "Slack Enterprise")\n' +
      '- A FEATURE is part of a product (e.g., "real-time messaging", "turnover prediction")\n' +
      '- Extract PRODUCTS, not features or page sections\n\n' +
      'For EACH product:\n' +
      '{\n' +
      '  "name": "Exact product name as shown on website",\n' +
      '  "category": "Product type (e.g., Analytics Platform, CRM, HR Tech)",\n' +
      '  "short_description": "One sentence: what it does + who it\'s for",\n' +
      '  "url": "Best URL for this product from the pages above",\n' +
      '  "confidence": 0-100\n' +
      '}\n\n' +
      'RULES:\n' +
      '1. Only products with confidence >= 75\n' +
      '2. If you see "Product A" and "Product B" → 2 separate products\n' +
      '3. If "Pro" and "Enterprise" editions → 1 product (mention editions in description)\n' +
      '4. Use actual content (headings, text) to identify products - not just URLs\n' +
      '5. Return ONLY valid JSON array, NO markdown, NO explanation\n\n' +
      'JSON:';

    let extractData;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const extractResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + LOVABLE_API_KEY,
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
        console.log('[RETRY]', retries, '/', maxRetries, 'for AI extraction');
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
    console.log('[SUCCESS] Extracted', products.length, 'products');

    // Step 3: For each product, enrich with focused extraction
    console.log('[ANALYZE] Step 3: Analyzing each solution in detail...');
    
    const enrichSolutionData = async (solution: any) => {
      console.log('[EXTRACT] Attempting extraction for:', solution.name);
      
      try {
        const extractionStartTime = Date.now();
        
        // Find the most relevant page for this specific product
        const relevantPage = validPages.find(p => {
          const url = p.url.toLowerCase();
          const productName = solution.name.toLowerCase();
          const productWords = productName.split(/\s+/);
          
          // Check if URL or content mentions this product
          return productWords.some(word => 
            word.length > 3 && (
              url.includes(word) || 
              p.content.title.toLowerCase().includes(word) ||
              p.content.mainText.toLowerCase().includes(productName)
            )
          );
        }) || validPages[0]; // Fallback to first page
        
        if (!relevantPage) {
          throw new Error('No valid page content available');
        }
        
        console.log('[ANALYZE] Analyzing from:', relevantPage.url);
        
        // Build user context section for AI prompt
        let contextSection = '';
        if (userCompanyInfo || (userSolutions && userSolutions.length > 0)) {
          contextSection = '\n\n=== YOUR COMPANY CONTEXT ===\n';
          
          if (userCompanyInfo) {
            contextSection += 'Company: ' + (userCompanyInfo.name || 'Unknown') + '\n';
            contextSection += 'Industry: ' + (userCompanyInfo.industry || 'Unknown') + '\n';
            if (userCompanyInfo.mission) {
              contextSection += 'Mission: ' + userCompanyInfo.mission + '\n';
            }
          }
          
          if (userSolutions && userSolutions.length > 0) {
            contextSection += '\nYOUR SOLUTIONS:\n';
            userSolutions.slice(0, 3).forEach((userSol, i) => {
              contextSection += (i + 1) + '. ' + userSol.name + '\n';
              if (userSol.features && userSol.features.length > 0) {
                contextSection += '   Features: ' + userSol.features.slice(0, 5).map((f: any) => 
                  typeof f === 'string' ? f : f.name || f.title
                ).join(', ') + '\n';
              }
              if (userSol.pain_points && userSol.pain_points.length > 0) {
                contextSection += '   Solves: ' + userSol.pain_points.slice(0, 3).join(', ') + '\n';
              }
              if (userSol.target_audience && userSol.target_audience.length > 0) {
                contextSection += '   For: ' + userSol.target_audience.slice(0, 3).join(', ') + '\n';
              }
            });
          }
          
          contextSection += '\nEXTRACTION INSTRUCTIONS:\n';
          contextSection += '- Map competitor features to YOUR feature categories when possible\n';
          contextSection += '- Identify which of YOUR pain points they address\n';
          contextSection += '- Match their target audience to YOUR audience segments\n';
          contextSection += '- Note feature gaps (what YOU have that they don\'t)\n';
          contextSection += '- Note feature overlaps (what you both offer)\n';
        }
        
        // Focused extraction prompt for THIS SPECIFIC product
        const detailPrompt = 'Extract comprehensive details about "' + solution.name + '" from this page content.\n\n' +
          'PRODUCT TO ANALYZE: ' + solution.name + '\n' +
          'CATEGORY: ' + solution.category + '\n' +
          'PAGE URL: ' + relevantPage.url + '\n' +
          contextSection + '\n\n' +
          'PAGE CONTENT:\n' +
          'Title: ' + relevantPage.content.title + '\n' +
          'Meta: ' + relevantPage.content.metaDescription + '\n' +
          'Headings: ' + relevantPage.content.headings.join(' | ') + '\n' +
          'Content: ' + relevantPage.content.mainText.slice(0, 4000) + '\n\n' +
          'Extract ONLY information about "' + solution.name + '". Return JSON with:\n\n' +
          '{\n' +
          '  "features": [\n' +
          '    { "name": "Feature name", "description": "What it does", "category": "Map to user category if applicable" }\n' +
          '  ],\n' +
          '  "benefits": ["Benefit 1", "Benefit 2"],\n' +
          '  "useCases": [\n' +
          '    { "title": "Use case title", "description": "How it\'s used" }\n' +
          '  ],\n' +
          '  "painPoints": ["Pain point 1 (note if matches user\'s)", "Pain point 2"],\n' +
          '  "targetAudience": ["Audience 1 (note if matches user\'s)", "Audience 2"],\n' +
          '  "pricing": {\n' +
          '    "model": "subscription|one-time|freemium|contact-sales",\n' +
          '    "startingPrice": "Price if mentioned",\n' +
          '    "tiers": [{ "name": "Tier", "price": "Price", "features": [] }]\n' +
          '  },\n' +
          '  "technicalSpecs": {\n' +
          '    "supportedPlatforms": ["Platform 1"],\n' +
          '    "apiCapabilities": ["API feature 1"],\n' +
          '    "securityFeatures": ["Security 1"]\n' +
          '  },\n' +
          '  "positioning": "Market positioning statement",\n' +
          '  "uniqueValuePropositions": ["UVP 1", "UVP 2"],\n' +
          '  "integrations": ["Integration 1"],\n' +
          '  "confidence": 0-100,\n' +
          '  "competitiveMapping": {\n' +
          '    "featureOverlap": ["Features matching user solutions"],\n' +
          '    "featureGaps": ["Features user has that competitor lacks"],\n' +
          '    "painPointCoverage": ["User pain points this addresses"],\n' +
          '    "audienceOverlap": ["User audiences they also target"],\n' +
          '    "differentiators": ["What makes them unique vs user"]\n' +
          '  }\n' +
          '}\n\n' +
          'RULES:\n' +
          '1. Extract 15-25 features (core capabilities and detailed features)\n' +
          '2. Extract 5-10 use cases (specific scenarios and applications)\n' +
          '3. Extract 5-8 pain points (problems this solution solves)\n' +
          '4. Extract 3-5 target audiences (who uses this)\n' +
          '5. Only include information explicitly stated on the page\n' +
          '6. If pricing not found, set pricing to null\n' +
          '7. Confidence = how certain you are this is about "' + solution.name + '"\n' +
          '8. For competitiveMapping, analyze against user context if provided\n' +
          '9. Return ONLY valid JSON, NO markdown';

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + LOVABLE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an expert at extracting structured product data. Return only valid JSON.' },
              { role: 'user', content: detailPrompt }
            ],
            temperature: 0.1,
          }),
        });

        diagnostics.ai_calls++;
        const aiData = await aiResponse.json();
        
        let extractedDetails: any = {};
        try {
          const content = aiData.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          extractedDetails = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch (error) {
          console.warn('[WARN] Failed to parse AI response for:', solution.name, error);
          extractedDetails = {};
        }

        const extractionTime = Date.now() - extractionStartTime;
        
        // Validate extraction quality
        const hasFeatures = extractedDetails.features?.length >= 10;
        const hasPricing = extractedDetails.pricing !== null && extractedDetails.pricing !== undefined;
        const hasUseCases = extractedDetails.useCases?.length >= 3;
        const hasPainPoints = extractedDetails.painPoints?.length >= 3;
        const hasAudience = extractedDetails.targetAudience?.length >= 2;
        const hasSpecs = extractedDetails.technicalSpecs && Object.keys(extractedDetails.technicalSpecs).length > 0;
        const confidence = extractedDetails.confidence || 0;
        
        const fieldsExtracted = [hasFeatures, hasPricing, hasUseCases, hasPainPoints, hasAudience, hasSpecs].filter(Boolean).length;
        const completeness = Math.round((fieldsExtracted / 6) * 100);
        const dataQuality = confidence >= 80 && completeness >= 75 ? 'high' : 
                           confidence >= 60 && completeness >= 50 ? 'medium' : 'low';
        
        // Calculate competitive metrics if user context available
        let competitiveMetrics = null;
        if (userSolutions && userSolutions.length > 0 && extractedDetails.competitiveMapping) {
          const mapping = extractedDetails.competitiveMapping;
          competitiveMetrics = {
            feature_overlap_count: mapping.featureOverlap?.length || 0,
            feature_gap_count: mapping.featureGaps?.length || 0,
            pain_point_coverage_count: mapping.painPointCoverage?.length || 0,
            audience_overlap_count: mapping.audienceOverlap?.length || 0,
            has_competitive_analysis: true
          };
        }
        
        console.log('[SUCCESS] Extracted for', solution.name, ':', extractedDetails.features?.length || 0, 'features,', extractedDetails.useCases?.length || 0, 'use cases,', extractedDetails.painPoints?.length || 0, 'pain points,', completeness + '% complete,', dataQuality, 'quality');
        if (competitiveMetrics) {
          console.log('[COMPETITIVE]', competitiveMetrics.feature_overlap_count, 'overlaps,', competitiveMetrics.pain_point_coverage_count, 'pain points covered');
        }
        
        diagnostics.full_extractions++;
        diagnostics.successful_extractions = (diagnostics.successful_extractions || 0) + 1;
        
        return {
          name: solution.name,
          category: solution.category,
          short_description: solution.short_description,
          long_description: extractedDetails.positioning || solution.short_description,
          external_url: solution.url || relevantPage.url,
          logo_url: null,
          positioning: extractedDetails.positioning || null,
          unique_value_propositions: extractedDetails.uniqueValuePropositions || [],
          key_differentiators: extractedDetails.competitiveMapping?.differentiators || [],
          features: extractedDetails.features || [],
          use_cases: extractedDetails.useCases || [],
          pain_points: extractedDetails.painPoints || [],
          target_audience: extractedDetails.targetAudience || [],
          benefits: extractedDetails.benefits || [],
          pricing: extractedDetails.pricing || null,
          technical_specs: extractedDetails.technicalSpecs || null,
          integrations: extractedDetails.integrations || [],
          case_studies: [],
          resources: [],
          tags: [],
          market_data: null,
          discovery_source: 'serp:focused',
          last_analyzed_at: new Date().toISOString(),
          metadata: {
            extraction_status: dataQuality === 'high' || dataQuality === 'medium' ? 'complete' : 'partial',
            extraction_timestamp: new Date().toISOString(),
            extraction_time_ms: extractionTime,
            data_quality: dataQuality,
            completeness_score: completeness,
            confidence_score: confidence,
            fields_extracted: fieldsExtracted,
            source_page: relevantPage.url,
            competitive_mapping: extractedDetails.competitiveMapping || null,
            competitive_metrics: competitiveMetrics
          }
        };
        
      } catch (error) {
        console.error('[ERROR] Extraction failed for:', solution.name, error);
        diagnostics.failed_extractions = (diagnostics.failed_extractions || 0) + 1;
        
        return {
          name: solution.name,
          category: solution.category || 'Unknown',
          short_description: solution.short_description || solution.name,
          long_description: solution.short_description,
          external_url: solution.url || validPages[0]?.url || urlsToAnalyze[0],
          features: [],
          use_cases: [],
          target_audience: [],
          discovery_source: 'serp:failed',
          last_analyzed_at: new Date().toISOString(),
          metadata: {
            extraction_status: 'failed',
            extraction_error: error.message || 'Unknown error',
            extraction_timestamp: new Date().toISOString(),
            data_quality: 'low',
            completeness_score: 0,
            confidence_score: 0
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
    console.log('[DIAGNOSTICS] Final Diagnostics:', diagnostics);
    console.log('[SUCCESS] Discovery complete! Saved', savedSolutions.length, 'solutions in', diagnostics.total_time_ms + 'ms');

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
