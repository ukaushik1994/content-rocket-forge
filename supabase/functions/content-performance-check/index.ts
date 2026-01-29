import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceData {
  bounceRate?: number;
  avgSessionDuration?: number;
  pageviews?: number;
  position?: number;
  ctr?: number;
  impressions?: number;
  lcpScore?: number;
  clsScore?: number;
  scrollDepth?: number;
}

interface OptimizationSuggestion {
  suggestion_type: string;
  reason: string;
  suggested_content: string;
  priority: 'high' | 'medium' | 'low';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, content_id } = await req.json();

    // If specific content_id provided, check just that one
    // Otherwise, check all published content for the user
    let contentQuery = supabaseClient
      .from('content_items')
      .select('*')
      .eq('status', 'published');

    if (content_id) {
      contentQuery = contentQuery.eq('id', content_id);
    } else if (user_id) {
      contentQuery = contentQuery.eq('user_id', user_id);
    } else {
      return new Response(
        JSON.stringify({ error: 'user_id or content_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: contentItems, error: contentError } = await contentQuery;

    if (contentError) {
      throw contentError;
    }

    if (!contentItems || contentItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No published content to analyze', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const content of contentItems) {
      try {
        // Gather performance data from various sources
        const performanceData = await gatherPerformanceData(supabaseClient, content);
        
        // Generate AI suggestions based on performance data
        const suggestions = await generateAISuggestions(content, performanceData);
        
        if (suggestions.length > 0) {
          // Store suggestions in content_optimization_history
          for (const suggestion of suggestions) {
            const { error: insertError } = await supabaseClient
              .from('content_optimization_history')
              .insert({
                content_id: content.id,
                user_id: content.user_id,
                suggestion_type: suggestion.suggestion_type,
                original_content: extractRelevantContent(content.content, suggestion.suggestion_type),
                suggested_content: suggestion.suggested_content,
                reason: suggestion.reason,
                status: 'pending_review',
                metadata: {
                  priority: suggestion.priority,
                  performance_data: performanceData,
                  generated_at: new Date().toISOString()
                }
              });

            if (insertError) {
              console.error(`Failed to insert suggestion for content ${content.id}:`, insertError);
            }
          }

          // Update pending_optimizations_count on content_items
          await supabaseClient
            .from('content_items')
            .update({ pending_optimizations_count: suggestions.length })
            .eq('id', content.id);

          results.push({
            content_id: content.id,
            title: content.title,
            suggestions_count: suggestions.length
          });
        }
      } catch (err) {
        console.error(`Error processing content ${content.id}:`, err);
        results.push({
          content_id: content.id,
          title: content.title,
          error: err.message
        });
      }
    }

    // Send notification if suggestions were generated
    const totalSuggestions = results.reduce((sum, r) => sum + (r.suggestions_count || 0), 0);
    if (totalSuggestions > 0 && user_id) {
      await supabaseClient
        .from('dashboard_alerts')
        .insert({
          user_id,
          title: 'Content Optimization Available',
          message: `${results.filter(r => r.suggestions_count).length} content pieces could perform better with a few tweaks.`,
          notification_type: 'info',
          module: 'content_optimizer',
          priority: 'medium',
          action_buttons: [
            {
              id: 'view_suggestions',
              label: 'View in Repository',
              action: 'navigate',
              url: '/repository?filter=needs_optimization',
              variant: 'primary'
            }
          ]
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: contentItems.length,
        suggestions_generated: totalSuggestions,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content performance check error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function gatherPerformanceData(
  supabase: any, 
  content: any
): Promise<PerformanceData> {
  const performanceData: PerformanceData = {};

  try {
    // Try to get analytics data if available
    const { data: analytics } = await supabase
      .from('content_analytics')
      .select('analytics_data, search_console_data')
      .eq('content_id', content.id)
      .single();

    if (analytics?.analytics_data) {
      performanceData.bounceRate = analytics.analytics_data.bounceRate;
      performanceData.avgSessionDuration = analytics.analytics_data.avgSessionDuration;
      performanceData.pageviews = analytics.analytics_data.pageviews;
    }

    if (analytics?.search_console_data) {
      performanceData.position = analytics.search_console_data.position;
      performanceData.ctr = analytics.search_console_data.ctr;
      performanceData.impressions = analytics.search_console_data.impressions;
    }
  } catch (err) {
    // Analytics data may not exist, that's okay
    console.log(`No analytics data for content ${content.id}`);
  }

  return performanceData;
}

async function generateAISuggestions(
  content: any, 
  performanceData: PerformanceData
): Promise<OptimizationSuggestion[]> {
  const suggestions: OptimizationSuggestion[] = [];
  
  // Analyze based on available data and content
  const contentText = content.content || '';
  const title = content.title || '';
  
  // Check for high bounce rate (>70%)
  if (performanceData.bounceRate && performanceData.bounceRate > 70) {
    const firstParagraph = contentText.split('\n\n')[0] || contentText.substring(0, 200);
    suggestions.push({
      suggestion_type: 'headline',
      reason: `${Math.round(performanceData.bounceRate)}% of visitors leave quickly. A stronger opening could improve engagement.`,
      suggested_content: await improveHeadline(title, firstParagraph),
      priority: 'high'
    });
  }

  // Check for low CTR (<2%)
  if (performanceData.ctr && performanceData.ctr < 2 && performanceData.impressions && performanceData.impressions > 100) {
    suggestions.push({
      suggestion_type: 'meta_description',
      reason: `Your content gets ${performanceData.impressions} impressions but only ${(performanceData.ctr).toFixed(1)}% click through. A more compelling description could help.`,
      suggested_content: await improveMetaDescription(title, contentText),
      priority: 'high'
    });
  }

  // Check for poor position (>20)
  if (performanceData.position && performanceData.position > 20) {
    suggestions.push({
      suggestion_type: 'seo',
      reason: `Your content ranks at position ${Math.round(performanceData.position)}. Optimizing for search intent could improve visibility.`,
      suggested_content: await improveSEO(title, contentText, content.keywords || []),
      priority: 'medium'
    });
  }

  // Check for short session duration (<30 seconds)
  if (performanceData.avgSessionDuration && performanceData.avgSessionDuration < 30) {
    suggestions.push({
      suggestion_type: 'content_structure',
      reason: 'Readers spend less than 30 seconds on this page. Better formatting and scannable content could keep them engaged.',
      suggested_content: await improveStructure(contentText),
      priority: 'medium'
    });
  }

  // If no performance data, do basic content analysis
  if (Object.keys(performanceData).length === 0) {
    // Check content length
    const wordCount = contentText.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push({
        suggestion_type: 'content_depth',
        reason: 'This content is quite short. Adding more depth and detail could improve its value and search ranking.',
        suggested_content: 'Consider expanding with examples, case studies, or answering common questions about this topic.',
        priority: 'low'
      });
    }

    // Check for CTA
    const hasCTA = /call to action|contact|sign up|subscribe|learn more|get started/i.test(contentText);
    if (!hasCTA) {
      suggestions.push({
        suggestion_type: 'cta',
        reason: 'This content doesn\'t have a clear call-to-action. Adding one could improve conversions.',
        suggested_content: 'Add a compelling CTA that guides readers to the next step.',
        priority: 'low'
      });
    }
  }

  return suggestions;
}

function extractRelevantContent(content: string, suggestionType: string): string {
  switch (suggestionType) {
    case 'headline':
      return content.split('\n')[0] || content.substring(0, 100);
    case 'meta_description':
      return content.substring(0, 160);
    case 'cta':
      // Try to find existing CTA or return last paragraph
      const paragraphs = content.split('\n\n');
      return paragraphs[paragraphs.length - 1] || content.substring(content.length - 200);
    default:
      return content.substring(0, 500);
  }
}

// Simple improvement functions (in production, these would use AI)
async function improveHeadline(title: string, firstParagraph: string): Promise<string> {
  // In production, this would call an AI model
  return `Consider making your headline more specific and benefit-focused. Current: "${title}"`;
}

async function improveMetaDescription(title: string, content: string): Promise<string> {
  // In production, this would call an AI model
  const snippet = content.substring(0, 100);
  return `Create a compelling 150-160 character description that highlights the main benefit. Include your primary keyword naturally.`;
}

async function improveSEO(title: string, content: string, keywords: string[]): Promise<string> {
  // In production, this would call an AI model
  return `Focus on matching search intent. Ensure your primary keyword "${keywords[0] || 'main topic'}" appears in the first paragraph and headers.`;
}

async function improveStructure(content: string): Promise<string> {
  // In production, this would call an AI model
  return `Break up long paragraphs, add subheadings every 300 words, and use bullet points for lists. Consider adding a table of contents.`;
}
