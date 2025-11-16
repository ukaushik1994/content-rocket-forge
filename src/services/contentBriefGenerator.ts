import { ContentBrief, ContentFormatCount, CampaignStrategy } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generates detailed content briefs for each piece in a campaign
 */
export async function generateContentBriefs(
  formatItem: ContentFormatCount,
  strategy: CampaignStrategy,
  solutionData: any | null,
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<ContentBrief[]> {
  
  console.log(`📝 [Brief Generator] Starting generation for ${formatItem.count} ${formatItem.formatId} pieces`);
  
  try {
    // Call the edge function to generate all briefs at once
    const { data, error } = await supabase.functions.invoke('generate-campaign-briefs', {
      body: {
        formatId: formatItem.formatId,
        count: formatItem.count,
        strategy: {
          title: strategy.title,
          description: strategy.description,
          targetAudience: strategy.targetAudience,
          expectedEngagement: strategy.expectedEngagement
        },
        solutionData,
        userId
      }
    });

    if (error) {
      console.error('📝 [Brief Generator] Edge function error:', error);
      throw error;
    }

    const briefs = data.briefs as ContentBrief[];
    
    console.log(`📝 [Brief Generator] ✓ Generated ${briefs.length} briefs in ${data.timing?.totalMs}ms`);
    
    // Report progress
    if (onProgress) {
      onProgress(briefs.length, formatItem.count);
    }
    
    // Validate briefs
    const validatedBriefs = briefs.map((brief, index) => validateBrief(brief, formatItem.formatId, index));
    
    return validatedBriefs;

  } catch (error: any) {
    console.error('📝 [Brief Generator] Failed to generate briefs:', error);
    
    // Handle specific error types
    if (error.message?.includes('429')) {
      console.warn('📝 [Brief Generator] Rate limit exceeded, using fallback briefs');
    } else if (error.message?.includes('402')) {
      console.warn('📝 [Brief Generator] Payment required, using fallback briefs');
    }
    
    // Generate fallback briefs
    const fallbackBriefs: ContentBrief[] = [];
    for (let i = 0; i < formatItem.count; i++) {
      fallbackBriefs.push(generateFallbackBrief(formatItem.formatId, i + 1, strategy));
    }
    
    return fallbackBriefs;
  }
}

/**
 * Validates and enriches a brief with defaults
 */
function validateBrief(brief: ContentBrief, formatId: string, index: number): ContentBrief {
  const isValid = !!(
    brief.title &&
    brief.description &&
    brief.keywords?.length > 0 &&
    brief.targetWordCount > 0 &&
    brief.metaTitle &&
    brief.metaDescription
  );

  if (!isValid) {
    console.warn(`📝 [Brief Validator] Brief ${index + 1} incomplete, applying defaults`);
  }

  return {
    title: brief.title || `${formatId} Piece #${index + 1}`,
    description: brief.description || 'Content description',
    keywords: Array.isArray(brief.keywords) && brief.keywords.length > 0 
      ? brief.keywords 
      : ['content'],
    metaTitle: brief.metaTitle || brief.title || `${formatId} Content`,
    metaDescription: brief.metaDescription || brief.description || 'Content description',
    targetWordCount: brief.targetWordCount > 0 ? brief.targetWordCount : getDefaultWordCount(formatId),
    difficulty: ['easy', 'medium', 'hard'].includes(brief.difficulty as string) 
      ? brief.difficulty 
      : 'medium',
    serpOpportunity: typeof brief.serpOpportunity === 'number' 
      ? Math.min(100, Math.max(0, brief.serpOpportunity))
      : 50
  };
}

/**
 * Generates a fallback brief when AI generation fails
 */
function generateFallbackBrief(
  formatId: string,
  pieceNumber: number,
  strategy: CampaignStrategy
): ContentBrief {
  return {
    title: `${formatId} Content Piece #${pieceNumber}`,
    description: `Content piece for ${strategy.title}`,
    keywords: [strategy.targetAudience || 'general'],
    metaTitle: `${formatId} | ${strategy.title}`,
    metaDescription: strategy.description.substring(0, 160),
    targetWordCount: getDefaultWordCount(formatId),
    difficulty: 'medium',
    serpOpportunity: 50
  };
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
