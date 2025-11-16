import { CampaignStrategySummary } from '@/types/campaign-types';
import { EnhancedCampaignData } from '@/hooks/useCampaignConversation';
import { supabase } from '@/integrations/supabase/client';
import { solutionService } from './solutionService';

/**
 * Campaign Strategy Generation Service
 * 
 * Uses: enhanced-ai-chat edge function
 * AI Providers: User-configured providers from ai_service_providers table
 * (OpenRouter, Anthropic, OpenAI, Gemini, Mistral, etc.)
 * 
 * IMPORTANT: Does NOT use Lovable AI - uses your personal API keys
 */

/**
 * Generates 3-4 lightweight strategy summary options for user selection
 */
export async function generateCampaignSummaries(
  collectedData: EnhancedCampaignData,
  solutionId: string | null,
  userId: string
): Promise<CampaignStrategySummary[]> {
  
  // Fetch complete solution data for rich context
  let solutionContext = '';
  if (solutionId) {
    try {
      const { data: solution } = await supabase
        .from('solutions')
        .select(`
          id,
          name,
          short_description,
          description,
          features,
          benefits,
          key_differentiators,
          use_cases,
          target_audience,
          pricing_model,
          category
        `)
        .eq('id', solutionId)
        .single();

      if (solution) {
        solutionContext = `

SOLUTION TO PROMOTE:
- Name: ${solution.name}
- Description: ${solution.short_description || solution.description || 'Not specified'}
- Target Audience: ${Array.isArray(solution.target_audience) ? solution.target_audience.join(', ') : (solution.target_audience as any) || 'Not specified'}
- Key Features: ${Array.isArray(solution.features) ? solution.features.join(', ') : 'Not specified'}
- Key Benefits: ${Array.isArray(solution.benefits) ? solution.benefits.join(', ') : 'Not specified'}
- Differentiators: ${Array.isArray(solution.key_differentiators) ? solution.key_differentiators.join(', ') : 'Not specified'}
- Use Cases: ${Array.isArray(solution.use_cases) ? solution.use_cases.join(', ') : 'Not specified'}
- Category: ${solution.category || 'Not specified'}`;
      }
    } catch (error) {
      console.error('Failed to fetch solution:', error);
    }
  }

  // Build comprehensive context from collected data
  const contextSummary = `
CAMPAIGN OVERVIEW:
- Idea: ${collectedData.idea}
- Pain points: ${collectedData.painPoints}
- Unique value: ${collectedData.uniqueValue}
- Target audience: ${collectedData.targetAudience}
- Goal: ${collectedData.goal}
- Timeline: ${collectedData.timeline}
${solutionContext}`;

  const systemPrompt = `You are an expert B2B SaaS marketing strategist.

Generate 3-4 SPECIFIC campaign strategies for this user's campaign:

CAMPAIGN CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━
- Campaign Idea: ${collectedData.idea || 'Not specified'}
- Target Audience: ${collectedData.targetAudience || 'Not specified'}
- Primary Goal: ${collectedData.goal || 'awareness'}
- Timeline: ${collectedData.timeline || '4-week'}${solutionContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━

STRATEGY REQUIREMENTS:

1. **Each strategy must be SIGNIFICANTLY DIFFERENT:**
   - Vary content mix: some blog-heavy, some social-heavy, some video-focused
   - Vary channels: organic social, paid ads, email, content marketing, events
   - Vary effort: low (5-20hrs), medium (20-50hrs), high (50-150hrs)

2. **Title Format:** "[Audience] [Channel/Type]: [Solution Benefit]"
   Examples:
   - "CFO LinkedIn: Finance Automation"
   - "Startup Founders Email Series: Project Management Tips"
   - "Enterprise CISO Webinar: Security Best Practices"

3. **Content Mix Calculation:**
   - blog = 4 hours each
   - email = 2 hours each
   - social (LinkedIn/Twitter/Facebook/Instagram) = 1 hour each
   - video/script = 8 hours each
   - landing-page = 6 hours each
   - carousel = 3 hours each
   - meme = 0.5 hours each
   - google-ads = 2 hours each

4. **Complexity Assessment:**
   - Beginner: Social media only
   - Skilled: Blogs, emails, landing pages
   - Expert: Video, paid ads, complex funnels

Focus on creating ACTIONABLE, SPECIFIC strategies tailored to the user's exact campaign context.`;

  try {
    console.log('📋 [Campaign Summary AI] Starting strategy generation...');
    console.log('📋 [Campaign Summary AI] Context:', {
      idea: collectedData.idea,
      targetAudience: collectedData.targetAudience,
      goal: collectedData.goal,
      timeline: collectedData.timeline,
      solutionId: solutionId,
      hasSolutionContext: !!solutionContext
    });
    
    // Use tool calling for reliable structured output
    const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 3-4 distinct, specific strategies for this campaign.` }
        ],
        useCampaignStrategyTool: true, // ← Enable campaign strategy tool
        stream: false
      }
    });

    console.log('📋 [Campaign Summary AI] Edge function response:', {
      hasData: !!data,
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : [],
      errorDetails: error
    });

    if (error) {
      console.error('📋 [Campaign Summary AI] Edge function error:', error);
      throw error;
    }

    // ✅ VALIDATION: Check fast path response structure
    console.log('📋 [Campaign Summary AI] Validating fast path response...');
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error('📋 [Campaign Summary AI] ❌ No tool call found in response');
      console.error('📋 [Campaign Summary AI] Response structure:', JSON.stringify(data, null, 2));
      
      // Fallback: Try manual parsing
      console.log('📋 [Campaign Summary AI] Attempting fallback content parsing...');
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        console.error('📋 [Campaign Summary AI] ❌ No content in response either');
        throw new Error('No response from AI - invalid response structure');
      }
      
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      const summaries = JSON.parse(jsonText);
      
      if (!Array.isArray(summaries) || summaries.length < 3) {
        console.error('📋 [Campaign Summary AI] ❌ Insufficient strategies:', summaries?.length || 0);
        throw new Error('AI generated insufficient strategies');
      }
      
      console.log('📋 [Campaign Summary AI] ✅ Fallback parsing successful:', summaries.length, 'strategies');
      return enrichStrategies(summaries);
    }

    // ✅ VALIDATION: Verify tool call function name
    if (toolCall.function?.name !== 'generate_campaign_strategies') {
      console.error('📋 [Campaign Summary AI] ❌ Wrong tool call:', toolCall.function?.name);
      throw new Error(`Unexpected tool call: ${toolCall.function?.name}`);
    }

    console.log('📋 [Campaign Summary AI] ✅ Tool call validated:', toolCall.function.name);

    // Parse tool call arguments
    const parsedArgs = JSON.parse(toolCall.function.arguments);
    const strategies = parsedArgs.strategies;

    console.log('📋 [Campaign Summary AI] Parsed strategies:', {
      count: strategies?.length || 0,
      isArray: Array.isArray(strategies),
      firstStrategyKeys: strategies?.[0] ? Object.keys(strategies[0]) : []
    });

    if (!Array.isArray(strategies)) {
      console.error('📋 [Campaign Summary AI] ❌ Strategies is not an array:', typeof strategies);
      throw new Error('Invalid strategies format - expected array');
    }

    if (strategies.length < 3) {
      console.error('📋 [Campaign Summary AI] ❌ Insufficient strategies:', strategies.length);
      throw new Error(`AI generated only ${strategies.length} strategies. Need at least 3.`);
    }

    console.log('📋 [Campaign Summary AI] ✅ Strategies validated, enriching...');
    
    // Enrich with additional fields
    const enrichedStrategies = enrichStrategies(strategies);
    
    console.log('📋 [Campaign Summary AI] ✅ Strategy generation complete:', {
      count: enrichedStrategies.length,
      titles: enrichedStrategies.map(s => s.title)
    });
    
    return enrichedStrategies;

  } catch (error) {
    console.error('📋 [Campaign Summary AI] ❌ Fatal error:', error);
    console.error('📋 [Campaign Summary AI] Error stack:', error instanceof Error ? error.stack : 'N/A');
    throw error;
  }
}

/**
 * Enrich strategies with additional computed fields
 */
function enrichStrategies(strategies: any[]): CampaignStrategySummary[] {
  return strategies.slice(0, 4).map(s => ({
    ...s,
    id: s.id || crypto.randomUUID(),
    totalEffort: {
      hours: s.totalHours || calculateHours(s.contentMix),
      complexity: s.complexity || inferComplexity(s.contentMix),
      workflowOrder: generateWorkflowOrder(s.contentMix)
    },
    optionalAddons: {
      contentCalendar: true,
      draftCopies: true,
      fullSeoBriefs: true,
      landingPageCopy: s.contentMix?.some((c: any) => c.formatId === 'landing-page') || false,
      emailSequences: s.contentMix?.some((c: any) => c.formatId === 'email') || false,
      exportOptions: ["PDF", "Notion", "Google Docs"]
    }
  }));
}

/**
 * Calculate total hours from content mix
 */
function calculateHours(contentMix: Array<{ formatId: string; count: number }>): number {
  const hourMap: Record<string, number> = {
    blog: 4,
    email: 2,
    'social-linkedin': 1,
    'social-twitter': 1,
    'social-facebook': 1,
    'social-instagram': 1,
    script: 8,
    'landing-page': 6,
    carousel: 3,
    meme: 0.5,
    'google-ads': 2
  };
  
  return contentMix.reduce((total, item) => {
    return total + (hourMap[item.formatId] || 2) * item.count;
  }, 0);
}

/**
 * Infer complexity from content mix
 */
function inferComplexity(contentMix: Array<{ formatId: string; count: number }>): 'beginner' | 'skilled' | 'expert' {
  const hasExpert = contentMix.some(c => ['script', 'google-ads'].includes(c.formatId));
  const hasSkilled = contentMix.some(c => ['blog', 'email', 'landing-page', 'carousel'].includes(c.formatId));
  
  if (hasExpert) return 'expert';
  if (hasSkilled) return 'skilled';
  return 'beginner';
}

/**
 * Generate workflow order for content creation
 */
function generateWorkflowOrder(contentMix: Array<{ formatId: string; count: number }>): string[] {
  const priorityOrder = [
    'landing-page',
    'blog',
    'email',
    'script',
    'carousel',
    'social-linkedin',
    'social-twitter',
    'social-facebook',
    'social-instagram',
    'meme',
    'google-ads'
  ];
  
  const formats = contentMix.map(c => c.formatId);
  return priorityOrder.filter(f => formats.includes(f));
}
