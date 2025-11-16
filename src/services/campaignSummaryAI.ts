import { CampaignStrategySummary } from '@/types/campaign-types';
import { EnhancedCampaignData } from '@/hooks/useCampaignConversation';
import { supabase } from '@/integrations/supabase/client';
import { solutionService } from './solutionService';

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

  const systemPrompt = `You are an expert B2B SaaS marketing strategist and content planner.

Your task: Generate 3-4 HIGHLY SPECIFIC campaign strategy options based on the user's exact idea and context.

USER'S CAMPAIGN CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign Idea: ${collectedData.idea || 'Not specified'}
Target Audience: ${collectedData.targetAudience || 'Not specified'}
Primary Goal: ${collectedData.goal || 'awareness'}
Timeline: ${collectedData.timeline || '4-week'}${solutionContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS FOR STRATEGY NAMING:
❌ DO NOT use generic names like "Content Authority Builder", "Social Amplification Strategy", or "Video-First Awareness"
✅ DO create specific, actionable strategy names that directly reflect the USER'S IDEA and SOLUTION

NAMING PATTERN EXAMPLES (based on different scenarios):

Example 1 - User promoting AI invoice tool to CFOs:
• "CFO LinkedIn Thought Leadership: Finance Automation"
• "Webinar Series: Transform Your Invoice Processing"  
• "Finance Industry Email Drip: AI-Powered Efficiency"

Example 2 - User promoting project management tool to startups:
• "Startup Founder Content Hub: Project Management Tips"
• "Twitter Campaign: Productivity Hacks for Founders"
• "Case Study Showcase: Startup Success Stories"

Example 3 - User promoting cybersecurity solution to enterprises:
• "Enterprise CISO Education: Security Best Practices"
• "LinkedIn + Blog: Threat Intelligence Insights"
• "Gated Whitepaper Campaign: Zero Trust Architecture"

YOUR STRATEGY TITLES MUST:
1. Mention the TARGET AUDIENCE or INDUSTRY (e.g., "CFO", "Startup Founders", "Enterprise CISO")
2. Reference the ACTUAL SOLUTION CATEGORY or BENEFIT (e.g., "Finance Automation", "Project Management", "Security")
3. Specify the PRIMARY CHANNEL or CONTENT TYPE (e.g., "LinkedIn", "Webinar Series", "Email Drip")
4. Be 5-8 words maximum
5. Sound like a real campaign name, not a generic bucket

Each strategy should be SIGNIFICANTLY DIFFERENT:
• Different content mixes (some blog-heavy, some social-heavy, some video-focused, some paid ads)
• Different focuses (awareness vs conversion vs engagement vs education)  
• Different effort levels (low, medium, high)
• Different channels (organic social, paid ads, email, content marketing, events)

For each strategy provide:
1. **title**: SPECIFIC, actionable campaign name (following patterns above)
2. **description**: 1-2 sentences explaining the tactical approach (not generic benefits)
3. **contentMix**: Array of {formatId, count} - use these format IDs:
   - "blog", "email", "social-linkedin", "social-twitter", "social-facebook", "social-instagram", "script", "landing-page", "carousel", "meme", "google-ads"
4. **expectedOutcome**: 1 specific sentence on what THIS campaign achieves for THIS solution
5. **focus**: "awareness" | "conversion" | "engagement" | "education"
6. **effortLevel**: "low" | "medium" | "high"
7. **totalEffort**: REQUIRED object with:
   - hours: number (calculate based on content mix, e.g., blog=4hrs, social=1hr, video=8hrs)
   - complexity: "beginner" | "skilled" | "expert"
   - workflowOrder: array of formatIds in recommended creation order
8. **optionalAddons**: REQUIRED object with:
   - contentCalendar: true
   - draftCopies: true
   - fullSeoBriefs: true
   - landingPageCopy: boolean
   - emailSequences: boolean
   - exportOptions: ["PDF", "Notion", "Google Docs"]

REMEMBER: Use the user's actual idea, solution details, and target audience to create CUSTOM strategy names. No generic templates!

Return ONLY valid JSON array with 3-4 options. Each option must have a unique id (use uuid format).`;

  try {
    const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 3-4 distinct strategy options for this campaign:\n${contextSummary}` }
        ],
        stream: false
      }
    });

    if (error) throw error;

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Parse JSON response
    let summaries: CampaignStrategySummary[];
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      summaries = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI-generated strategies. Please try again.');
    }

    // Validate and ensure we have 3-4 summaries
    if (!Array.isArray(summaries) || summaries.length < 3) {
      throw new Error('AI generated insufficient strategies. Please try again.');
    }

    return summaries.slice(0, 4); // Max 4 options

  } catch (error) {
    console.error('Error generating campaign summaries:', error);
    throw error;
  }
}
