import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefRequest {
  formatId: string;
  count: number;
  strategy: {
    title: string;
    description: string;
    targetAudience?: string;
    expectedEngagement?: string;
  };
  solutionData?: {
    name: string;
    description?: string;
    short_description?: string;
    features?: any;
    benefits?: any;
    target_audience?: any;
  } | null;
  userId: string;
}

interface ContentBrief {
  title: string;
  description: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  targetWordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  serpOpportunity: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { formatId, count, strategy, solutionData, userId }: BriefRequest = await req.json();

    console.log(`[Brief Generator] Starting generation: ${count} briefs for ${formatId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate briefs in batches of 3-5 for efficiency
    const batchSize = Math.min(5, count);
    const batches = Math.ceil(count / batchSize);
    const allBriefs: ContentBrief[] = [];

    for (let batch = 0; batch < batches; batch++) {
      const briefsInBatch = Math.min(batchSize, count - allBriefs.length);
      console.log(`[Brief Generator] Batch ${batch + 1}/${batches}: Generating ${briefsInBatch} briefs`);

      const systemPrompt = buildSystemPrompt(formatId, strategy, solutionData, briefsInBatch);

      try {
        const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
          body: {
            messages: [
              { role: 'system', content: systemPrompt },
              { 
                role: 'user', 
                content: `Generate ${briefsInBatch} unique, detailed content briefs for ${formatId} pieces. Ensure each brief has distinct titles, keywords, and angles. Return as a JSON array.`
              }
            ],
            userId,
            extractJson: true
          }
        });

        if (error) {
          console.error(`[Brief Generator] AI call failed in batch ${batch + 1}:`, error);
          // Generate fallback briefs for this batch
          allBriefs.push(...generateFallbackBriefs(formatId, briefsInBatch, strategy, allBriefs.length));
          continue;
        }

        const batchBriefs = parseBriefResponse(data.content, briefsInBatch, formatId);
        allBriefs.push(...batchBriefs);

      } catch (batchError) {
        console.error(`[Brief Generator] Batch ${batch + 1} error:`, batchError);
        // Add fallback briefs for failed batch
        allBriefs.push(...generateFallbackBriefs(formatId, briefsInBatch, strategy, allBriefs.length));
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / count;

    console.log(`[Brief Generator] Complete: ${allBriefs.length} briefs in ${totalTime}ms (avg ${avgTime}ms)`);

    return new Response(
      JSON.stringify({
        briefs: allBriefs,
        timing: {
          totalMs: totalTime,
          avgPerBrief: avgTime
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[Brief Generator] Fatal error:', error);
    
    // Return error with appropriate status code
    const status = error.message?.includes('429') ? 429 
                 : error.message?.includes('402') ? 402 
                 : 500;

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate briefs',
        briefs: [] // Empty array for graceful degradation
      }),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildSystemPrompt(
  formatId: string,
  strategy: any,
  solutionData: any | null,
  count: number
): string {
  const wordCountDefaults: Record<string, number> = {
    'blog': 1500,
    'email': 500,
    'social-twitter': 280,
    'social-linkedin': 600,
    'social-facebook': 400,
    'social-instagram': 300,
    'script': 800,
    'landing-page': 1000,
    'carousel': 200,
    'meme': 50,
    'google-ads': 150
  };

  const defaultWordCount = wordCountDefaults[formatId] || 800;

  return `You are an expert content strategist creating detailed, actionable content briefs.

Campaign Context:
- Title: ${strategy.title}
- Description: ${strategy.description}
- Target Audience: ${strategy.targetAudience || 'General audience'}
- Goal: ${strategy.expectedEngagement || 'Engagement and conversions'}
${solutionData ? `- Solution: ${solutionData.name} - ${solutionData.short_description || solutionData.description || ''}` : ''}

Format: ${formatId}
Required: Generate ${count} UNIQUE content briefs

For each brief, provide:
1. **title**: Specific, compelling headline (not generic like "Blog Post #1")
2. **description**: Clear 2-3 sentence overview of what the content covers
3. **keywords**: Array with 1 primary keyword + 5-7 LSI/semantic keywords
4. **metaTitle**: SEO-optimized title (max 60 characters)
5. **metaDescription**: SEO-optimized description (max 160 characters)
6. **targetWordCount**: Appropriate for ${formatId} (around ${defaultWordCount} words)
7. **difficulty**: "easy", "medium", or "hard" based on topic complexity
8. **serpOpportunity**: Score 0-100 (higher = better ranking potential)

CRITICAL: Each brief must be DISTINCT:
- Different titles and angles
- Varied keywords (no duplicates)
- Unique content hooks
- Different difficulty levels if possible

Return ONLY a JSON array of ${count} brief objects. No markdown, no explanation.

Example structure:
[
  {
    "title": "10 Data-Driven Strategies to Boost Customer Retention",
    "description": "Explore proven retention tactics backed by industry research and real case studies.",
    "keywords": ["customer retention strategies", "retention rate optimization", "customer churn reduction", "loyalty program tactics", "customer lifecycle management", "retention marketing", "customer engagement strategies"],
    "metaTitle": "10 Customer Retention Strategies That Actually Work",
    "metaDescription": "Discover data-driven customer retention strategies that reduce churn and boost lifetime value. Proven tactics with measurable results.",
    "targetWordCount": ${defaultWordCount},
    "difficulty": "medium",
    "serpOpportunity": 75
  }
]`;
}

function parseBriefResponse(content: any, expectedCount: number, formatId: string): ContentBrief[] {
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    const briefs = Array.isArray(parsed) ? parsed : [parsed];

    return briefs.slice(0, expectedCount).map((brief, index) => ({
      title: brief.title || `${formatId} Piece #${index + 1}`,
      description: brief.description || 'Content description',
      keywords: Array.isArray(brief.keywords) ? brief.keywords : [],
      metaTitle: brief.metaTitle || brief.title || `${formatId} Content`,
      metaDescription: brief.metaDescription || brief.description || 'Content description',
      targetWordCount: brief.targetWordCount || getDefaultWordCount(formatId),
      difficulty: ['easy', 'medium', 'hard'].includes(brief.difficulty) 
        ? brief.difficulty 
        : 'medium',
      serpOpportunity: typeof brief.serpOpportunity === 'number' 
        ? brief.serpOpportunity 
        : 50
    }));
  } catch (parseError) {
    console.error('[Brief Generator] Failed to parse AI response:', parseError);
    return generateFallbackBriefs(formatId, expectedCount, { title: '', description: '' }, 0);
  }
}

function generateFallbackBriefs(
  formatId: string,
  count: number,
  strategy: any,
  startIndex: number
): ContentBrief[] {
  const briefs: ContentBrief[] = [];
  
  for (let i = 0; i < count; i++) {
    const index = startIndex + i + 1;
    briefs.push({
      title: `${formatId} Content Piece #${index}`,
      description: `Content piece for ${strategy.title || 'campaign'}`,
      keywords: [strategy.targetAudience || 'general'],
      metaTitle: `${formatId} | ${strategy.title || 'Campaign'}`,
      metaDescription: (strategy.description || 'Campaign content').substring(0, 160),
      targetWordCount: getDefaultWordCount(formatId),
      difficulty: 'medium',
      serpOpportunity: 50
    });
  }
  
  return briefs;
}

function getDefaultWordCount(formatId: string): number {
  const defaults: Record<string, number> = {
    'blog': 1500,
    'email': 500,
    'social-twitter': 280,
    'social-linkedin': 600,
    'social-facebook': 400,
    'social-instagram': 300,
    'script': 800,
    'landing-page': 1000,
    'carousel': 200,
    'meme': 50,
    'google-ads': 150
  };
  
  return defaults[formatId] || 800;
}
