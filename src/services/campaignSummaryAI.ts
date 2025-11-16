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
  
  // Fetch solution data for context (only name for summary generation)
  let solutionContext = '';
  if (solutionId) {
    try {
      const { data: solution } = await supabase
        .from('solutions')
        .select('name')
        .eq('id', solutionId)
        .single();

      if (solution) {
        solutionContext = `\n\nSOLUTION TO PROMOTE: ${solution.name}`;
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

Your task: Generate 3-4 HIGH-QUALITY campaign strategy summaries for promoting a B2B SaaS product/solution.

USER PROVIDED (ESSENTIALS):
- Campaign goal/idea: ${collectedData.idea || 'Not specified'}
- Target audience: ${collectedData.targetAudience || 'Not specified'}
- Goal: ${collectedData.goal || 'awareness'}
- Timeline: ${collectedData.timeline || '4-week'}${solutionContext}

IMPORTANT: The user only provided basic essentials. You MUST INTELLIGENTLY INFER:
• Pain points (based on goal + solution context or industry knowledge)
• Unique value propositions (from solution data or competitive market insights)
• Competitive context (from market research and industry trends)
• Success metrics (aligned with campaign goal)
• Resource requirements (based on timeline + scope)

Use your deep market knowledge, solution data (if available), and B2B SaaS expertise to fill gaps intelligently. Create strategies that are comprehensive despite limited input.

Each option should be SIGNIFICANTLY DIFFERENT from the others:
- Different content mixes (some blog-heavy, some social-heavy, some video-focused)
- Different focuses (awareness vs conversion vs engagement vs education)
- Different effort levels (low, medium, high)

For each option provide:
1. title: Short, catchy title (5-8 words max)
2. description: 1-2 sentences explaining the approach
3. contentMix: Array of {formatId, count} - use these format IDs:
   - "blog-post", "social-post", "video", "infographic", "case-study", "guide", "whitepaper", "email", "webinar", "podcast"
4. expectedOutcome: 1 sentence on what this achieves
5. focus: "awareness" | "conversion" | "engagement" | "education"
6. effortLevel: "low" | "medium" | "high"

CRITICAL: Return ONLY valid JSON array with 3-4 options. Each option must have a unique id (use uuid format).

Example format:
[
  {
    "id": "abc-123",
    "title": "Content Authority Builder",
    "description": "Establish thought leadership through comprehensive blog content and case studies.",
    "contentMix": [{"formatId": "blog-post", "count": 8}, {"formatId": "case-study", "count": 3}],
    "expectedOutcome": "Build trust and domain authority with high-value educational content",
    "focus": "awareness",
    "effortLevel": "medium"
  }
]`;

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
      // Fallback to default summaries
      summaries = getFallbackSummaries(collectedData);
    }

    // Validate and ensure we have 3-4 summaries
    if (!Array.isArray(summaries) || summaries.length < 3) {
      summaries = getFallbackSummaries(collectedData);
    }

    return summaries.slice(0, 4); // Max 4 options

  } catch (error) {
    console.error('Error generating campaign summaries:', error);
    return getFallbackSummaries(collectedData);
  }
}

/**
 * Fallback summaries based on campaign goal
 */
function getFallbackSummaries(data: EnhancedCampaignData): CampaignStrategySummary[] {
  const goal = data.goal || 'awareness';
  
  const summaries: Record<string, CampaignStrategySummary[]> = {
    awareness: [
      {
        id: crypto.randomUUID(),
        title: 'Content Authority Builder',
        description: 'Establish thought leadership through comprehensive blog content and educational resources.',
        contentMix: [
          { formatId: 'blog-post', count: 8 },
          { formatId: 'guide', count: 2 },
          { formatId: 'infographic', count: 3 }
        ],
        expectedOutcome: 'Build brand awareness and domain authority with high-value content',
        focus: 'awareness',
        effortLevel: 'medium'
      },
      {
        id: crypto.randomUUID(),
        title: 'Social Amplification Strategy',
        description: 'Maximize reach through consistent social media presence and viral content.',
        contentMix: [
          { formatId: 'social-post', count: 20 },
          { formatId: 'video', count: 5 },
          { formatId: 'infographic', count: 4 }
        ],
        expectedOutcome: 'Rapid brand awareness growth across social channels',
        focus: 'awareness',
        effortLevel: 'high'
      },
      {
        id: crypto.randomUUID(),
        title: 'Video-First Awareness',
        description: 'Leverage video content for maximum engagement and shareability.',
        contentMix: [
          { formatId: 'video', count: 8 },
          { formatId: 'social-post', count: 12 },
          { formatId: 'blog-post', count: 3 }
        ],
        expectedOutcome: 'High engagement rates and viral potential through video',
        focus: 'awareness',
        effortLevel: 'high'
      }
    ],
    conversion: [
      {
        id: crypto.randomUUID(),
        title: 'Lead Generation Funnel',
        description: 'Drive conversions with targeted case studies, whitepapers, and strategic CTAs.',
        contentMix: [
          { formatId: 'case-study', count: 4 },
          { formatId: 'whitepaper', count: 2 },
          { formatId: 'email', count: 6 },
          { formatId: 'blog-post', count: 5 }
        ],
        expectedOutcome: 'Generate qualified leads through gated premium content',
        focus: 'conversion',
        effortLevel: 'medium'
      },
      {
        id: crypto.randomUUID(),
        title: 'Webinar-Driven Conversion',
        description: 'Build trust and convert through live webinars and follow-up sequences.',
        contentMix: [
          { formatId: 'webinar', count: 3 },
          { formatId: 'email', count: 8 },
          { formatId: 'case-study', count: 3 }
        ],
        expectedOutcome: 'High-intent leads from engaged webinar attendees',
        focus: 'conversion',
        effortLevel: 'high'
      },
      {
        id: crypto.randomUUID(),
        title: 'Social Proof Strategy',
        description: 'Convert through customer success stories and testimonials.',
        contentMix: [
          { formatId: 'case-study', count: 6 },
          { formatId: 'video', count: 4 },
          { formatId: 'social-post', count: 10 }
        ],
        expectedOutcome: 'Build trust and drive conversions through social proof',
        focus: 'conversion',
        effortLevel: 'medium'
      }
    ],
    engagement: [
      {
        id: crypto.randomUUID(),
        title: 'Community Building Campaign',
        description: 'Foster engagement through interactive content and community discussions.',
        contentMix: [
          { formatId: 'social-post', count: 25 },
          { formatId: 'podcast', count: 4 },
          { formatId: 'webinar', count: 2 }
        ],
        expectedOutcome: 'Build an active, engaged community around your brand',
        focus: 'engagement',
        effortLevel: 'high'
      },
      {
        id: crypto.randomUUID(),
        title: 'Interactive Content Hub',
        description: 'Drive engagement with polls, quizzes, and user-generated content.',
        contentMix: [
          { formatId: 'social-post', count: 20 },
          { formatId: 'infographic', count: 5 },
          { formatId: 'video', count: 6 }
        ],
        expectedOutcome: 'High engagement rates through interactive formats',
        focus: 'engagement',
        effortLevel: 'medium'
      },
      {
        id: crypto.randomUUID(),
        title: 'Podcast-Led Engagement',
        description: 'Build deep connections through long-form podcast conversations.',
        contentMix: [
          { formatId: 'podcast', count: 8 },
          { formatId: 'social-post', count: 16 },
          { formatId: 'blog-post', count: 8 }
        ],
        expectedOutcome: 'Loyal audience through consistent podcast content',
        focus: 'engagement',
        effortLevel: 'medium'
      }
    ],
    education: [
      {
        id: crypto.randomUUID(),
        title: 'Comprehensive Learning Path',
        description: 'Educate through detailed guides, tutorials, and step-by-step resources.',
        contentMix: [
          { formatId: 'guide', count: 5 },
          { formatId: 'blog-post', count: 10 },
          { formatId: 'video', count: 6 }
        ],
        expectedOutcome: 'Position as industry educator and build trust through value',
        focus: 'education',
        effortLevel: 'high'
      },
      {
        id: crypto.randomUUID(),
        title: 'Video Tutorial Series',
        description: 'Teach through engaging video tutorials and how-to content.',
        contentMix: [
          { formatId: 'video', count: 12 },
          { formatId: 'blog-post', count: 6 },
          { formatId: 'infographic', count: 4 }
        ],
        expectedOutcome: 'Educate audience through visual, easy-to-follow content',
        focus: 'education',
        effortLevel: 'high'
      },
      {
        id: crypto.randomUUID(),
        title: 'Webinar Education Series',
        description: 'Deep-dive educational webinars with expert insights and Q&A.',
        contentMix: [
          { formatId: 'webinar', count: 4 },
          { formatId: 'guide', count: 3 },
          { formatId: 'email', count: 6 }
        ],
        expectedOutcome: 'Establish expertise through in-depth educational sessions',
        focus: 'education',
        effortLevel: 'medium'
      }
    ]
  };

  return summaries[goal] || summaries.awareness;
}
