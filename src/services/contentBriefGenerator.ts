import { ContentBrief, ContentFormatCount, CampaignStrategy } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generates detailed content briefs for each piece in a campaign
 */
export async function generateContentBriefs(
  formatItem: ContentFormatCount,
  strategy: CampaignStrategy,
  solutionData: any | null,
  userId: string
): Promise<ContentBrief[]> {
  
  const briefs: ContentBrief[] = [];
  
  // Generate a brief for each piece of this format
  for (let i = 0; i < formatItem.count; i++) {
    const brief = await generateSingleBrief(
      formatItem.formatId,
      i + 1,
      formatItem.count,
      strategy,
      solutionData,
      userId
    );
    briefs.push(brief);
  }
  
  return briefs;
}

/**
 * Generates a single content brief
 */
async function generateSingleBrief(
  formatId: string,
  pieceNumber: number,
  totalPieces: number,
  strategy: CampaignStrategy,
  solutionData: any | null,
  userId: string
): Promise<ContentBrief> {
  
  // Build context for AI
  const context = {
    format: formatId,
    pieceNumber,
    totalPieces,
    campaignTitle: strategy.title,
    campaignDescription: strategy.description,
    targetAudience: strategy.targetAudience,
    goal: strategy.expectedEngagement,
    solution: solutionData ? {
      name: solutionData.name,
      description: solutionData.short_description || solutionData.description,
      features: solutionData.features,
      benefits: solutionData.benefits,
      targetAudience: solutionData.target_audience
    } : null
  };

  const systemPrompt = `You are an expert content strategist creating detailed briefs.
  
Generate a content brief with:
- 3-5 title suggestions (specific and compelling)
- 1 primary keyword (highly relevant)
- 5-7 LSI keywords (semantic variations)
- Content angle/hook (unique perspective)
- Recommended CTA (clear action)
- Target word count (appropriate for format)
- SEO metadata (meta title, meta description)
- Difficulty rating (easy/medium/hard)
- SERP opportunity score (0-100, higher = better ranking potential)

Format: ${formatId}
Campaign: ${strategy.title}
Target Audience: ${strategy.targetAudience || 'Not specified'}
Solution: ${solutionData ? solutionData.name : 'None'}

Return ONLY a JSON object with this structure:
{
  "title": "Main title suggestion",
  "description": "Brief description of what this content will cover",
  "keywords": ["primary keyword", "secondary 1", "secondary 2", "..."],
  "metaTitle": "SEO-optimized meta title (60 chars max)",
  "metaDescription": "SEO-optimized meta description (160 chars max)",
  "targetWordCount": 1200,
  "difficulty": "medium",
  "serpOpportunity": 75
}`;

  try {
    const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate brief for piece #${pieceNumber} of ${totalPieces}` }
        ],
        userId,
        extractJson: true
      }
    });

    if (error) throw error;

    const briefData = typeof data.content === 'string' 
      ? JSON.parse(data.content) 
      : data.content;

    return {
      title: briefData.title || `${formatId} #${pieceNumber}`,
      description: briefData.description || 'Content description',
      keywords: briefData.keywords || [],
      metaTitle: briefData.metaTitle || briefData.title,
      metaDescription: briefData.metaDescription || briefData.description,
      targetWordCount: briefData.targetWordCount || 800,
      difficulty: briefData.difficulty || 'medium',
      serpOpportunity: briefData.serpOpportunity || 50
    };

  } catch (error) {
    console.error('Failed to generate brief:', error);
    
    // Fallback brief
    return {
      title: `${formatId} #${pieceNumber}`,
      description: `Content piece for ${strategy.title}`,
      keywords: [strategy.targetAudience || 'general'],
      metaTitle: `${formatId} | ${strategy.title}`,
      metaDescription: strategy.description.substring(0, 160),
      targetWordCount: getDefaultWordCount(formatId),
      difficulty: 'medium',
      serpOpportunity: 50
    };
  }
}

/**
 * Returns default word counts based on format
 */
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
  
  return defaults[formatId] || 500;
}
